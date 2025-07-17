import mongoose, { Types } from "mongoose";
import { ILeaveRequest, ILeaveRequestCreate, IleaveSummary } from "../../types/models.types";
import LeaveRequestModel from "../models/leaverequest";
import User from "../models/users";
import LeaveSummaryModel from "../models/leavesummary"
import AppLogger from "../helpers/logging";
import { leaveStatus } from "../config/messages";
import leaverequest from "../models/leaverequest";

export const createLeaveRequest = async (
    payload: Partial<ILeaveRequestCreate> 
  ): Promise<ILeaveRequest | { error: any }> => {
    try {
      // 1. Find employee by name
      const employee = await User.findOne({ _id: new Types.ObjectId(payload.employeeId) }).exec();
            console.log(">>>", employee);

      if (!employee) {
        return { error: "Employee not found with the given name." };
      }


      // 2. Find admin by createdBy
      const admin = await User.findOne({
        userName: payload.createdBy,
        role: { $in: ["ADMIN"] }
      }).exec();
      if (!admin) {
        return { error: "Admin not found with the given createdBy." };
      }
  
      // 3. Build payload
      const fullPayload: ILeaveRequestCreate = {
        ...payload,
        name:employee.userName,
        employeeId: employee._id.toString(),  // Save employeeId (teacher's _id)
        role: Array.isArray(employee.role) ? employee.role[0] : employee.role,
        approvedId: admin._id.toString(),
        approvedName: admin.userName,
      } as ILeaveRequestCreate;
  
      // Save the leave request
      const newRequest = new LeaveRequestModel(fullPayload);
      const savedRequest = await newRequest.save();
  
      // Return saved leave request with employeeId included
      return {
        ...savedRequest.toObject(),
        employeeId: employee._id.toString(), // Add employeeId to the response
      };
    } catch (error) {
      return { error };
    }

 };
  

 
//Update leave summary


const DEFAULT_MONTHLY_QUOTA = 5;

export const updateLeaveRequest = async (
  employeeId: string,
  updates: Partial<ILeaveRequest>
): Promise<{
  updatedLeave?: ILeaveRequest;
  leavesTaken?: number;
  remainingLeaves?: number;
  error?: any;
}> => {
  try {
    // 1. Get the latest leave request for the employee
    const existingLeave = await LeaveRequestModel.findOne({ employeeId }).sort({ createdDate: -1 }).exec();
    if (!existingLeave) return { error: "Leave request not found" };

    // 2. Determine date range for updated or existing leave
    const from = new Date(updates.fromDate || existingLeave.fromDate);
    const to = new Date(updates.toDate || existingLeave.toDate);
    const thisLeaveDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // 3. Define month range
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 4. Fetch other approved leaves for this employee in the current month
    const approvedLeaves = await LeaveRequestModel.find({
      employeeId,
      leaveStatus: "APPROVED",
      _id: { $ne: existingLeave._id },
      fromDate: { $gte: monthStart, $lte: monthEnd },
    });

    // 5. Sum days from approved leaves (excluding current)
    const takenSoFar = approvedLeaves.reduce((sum, leave) => {
      const fromDate = new Date(leave.fromDate);
      const toDate = new Date(leave.toDate);
      const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return sum + days;
    }, 0);

    const isBeingApproved = updates.leaveStatus === "APPROVED";
    const totalWithThis = isBeingApproved ? takenSoFar + thisLeaveDays : takenSoFar;

    // 6. Validate leave quota only for APPROVED
    if (isBeingApproved && totalWithThis > DEFAULT_MONTHLY_QUOTA) {
      return {
        error: `Leave quota exceeded. Requested ${totalWithThis} days, but monthly quota is ${DEFAULT_MONTHLY_QUOTA}.`,
        leavesTaken: takenSoFar,
        remainingLeaves: DEFAULT_MONTHLY_QUOTA - takenSoFar,
      };
    }

    // 7. Update the leave request document
    const updatedLeave = await LeaveRequestModel.findByIdAndUpdate(
      existingLeave._id,
      updates,
      { new: true }
    ).exec();
    if (!updatedLeave) return { error: "Failed to update leave request." };

    // 8. Upsert summary per employeeId
    await LeaveSummaryModel.findOneAndUpdate(
      { employeeId: updatedLeave.employeeId }, // single summary per employee
      {
        employeeId: updatedLeave.employeeId,
        name: updatedLeave.name,
        role: updatedLeave.role,
        fromDate: updatedLeave.fromDate,
        toDate: updatedLeave.toDate,
        leaveType: updatedLeave.leaveType,
        leaveStatus: updatedLeave.leaveStatus,
        leavesTaken: totalWithThis.toString(),
        remainingLeaves: (DEFAULT_MONTHLY_QUOTA - totalWithThis).toString(),
        approvedId: updatedLeave.approvedId,
        approvedName: updatedLeave.approvedName,
        reason: updatedLeave.reason,
        status: updatedLeave.status,
        createdBy: updatedLeave.approvedName,
        updatedBy: updatedLeave.approvedName,
        updatedDate: new Date(),
        $setOnInsert: { createdDate: new Date() },
      },
      { upsert: true, new: true }
    );

    return {
      updatedLeave,
      leavesTaken: totalWithThis,
      remainingLeaves: DEFAULT_MONTHLY_QUOTA - totalWithThis,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : error };
  }
};



//leave Request List


export const getAllLeaveList = async (): Promise<{ totalCount: number; leaveRequest: ILeaveRequest[] }> => {
  const [leaveRequest, totalCount] = await Promise.all([
    LeaveRequestModel.find().exec(),
    LeaveRequestModel.countDocuments().exec(),
  ]);

  AppLogger.info("Fetched all leave requests", { totalCount });

  return { totalCount, leaveRequest };
};


//leave Summary List


export const getAllLeaveSummaryList = async (): Promise<{ totalCount: number; leavesummary: IleaveSummary[] }> => {
  const [leavesummary, totalCount] = await Promise.all([
    LeaveSummaryModel.find().exec(),
    LeaveSummaryModel.countDocuments().exec(),
  ]);

  AppLogger.info("Fetched all leave Summary", { totalCount });

  return { totalCount, leavesummary }; 
};

//LeaveRequestById

export const getLeaveRequestRecordByEmployeeId = async (
  employeeId: string
): Promise<any> => {
  const objectId = new Types.ObjectId(employeeId); // Optional: only needed if `_id` filtering is used

  const [leaveRecords, counts] = await Promise.all([
    LeaveRequestModel.find({ employeeId }).lean(), // ✅ return all matching records
    LeaveRequestModel.aggregate([
      { $match: { employeeId } },
      {
        $group: {
          _id: "$leaveStatus",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const countMap = {
    totalApplied: 0,
    totalApproved: 0,
    totalDeclined: 0,
  };

  counts.forEach((item) => {
    if (item._id === "WAITINGLIST") {
      countMap.totalApplied = item.count;
    } else if (item._id === "APPROVED") {
      countMap.totalApproved = item.count;
    } else if (item._id === "DECLINED") {
      countMap.totalDeclined = item.count;
    }
  });

  return {
    records: leaveRecords, // ✅ list of leave records
    ...countMap,           // ✅ summary counts
  };
};




//LeaveSummary

export const getLeaveSummaryRecordById = async (
  id: string
): Promise<IleaveSummary | null> => {
  return LeaveSummaryModel.findOne({
    _id: new Types.ObjectId(id),
  }).lean();
};

//card counts for leave requests

export const dashboardLeaveRequestCounts = async (): Promise<{
  totalApplication: number;
  pending: number;
  approved: number;
  rejected: number;
}> => {
  // Fetch counts in parallel
  const [pending, approved, rejected, totalApplication] = await Promise.all([
    leaverequest.countDocuments({ leaveStatus: "WAITINGLIST" }).exec(),
    leaverequest.countDocuments({ leaveStatus: "APPROVED" }).exec(),
    leaverequest.countDocuments({ leaveStatus: "REJECTED" }).exec(),
    leaverequest.countDocuments().exec(),
  ]);

  return {
    totalApplication,
    pending,
    approved,
    rejected,
  };
};


