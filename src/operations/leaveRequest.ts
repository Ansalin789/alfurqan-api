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


export const updateLeaveRequest = async (
  leaveRequestId: string,
  updates: Partial<ILeaveRequest>
): Promise<{
  updatedLeave?: ILeaveRequest;
  error?: any;
}> => {
  try {
    console.log("Searching for leave request by _id:", leaveRequestId);
    const existingLeave = await LeaveRequestModel.findById(leaveRequestId).exec();

    if (!existingLeave) {
      console.warn("Leave request not found for _id:", leaveRequestId);
      return { error: "Leave request not found" };
    }

    if (!updates.fromDate || !updates.toDate || updates.approvedDays == null) {
      console.warn("Missing required fields in update:", updates);
      return { error: "Missing required fields: fromDate, toDate, approvedDays" };
    }

    console.log("Updating leave request with:", updates);
    const updatedLeave = await LeaveRequestModel.findByIdAndUpdate(
      leaveRequestId,
      updates,
      { new: true }
    ).exec();

    if (!updatedLeave) {
      console.error("Failed to update leave request.");
      return { error: "Failed to update leave request." };
    }

    console.log("Leave request updated:", updatedLeave);
    console.log("Upserting LeaveSummaryModel...");

    await LeaveSummaryModel.findOneAndUpdate(
      { employeeId: updatedLeave.employeeId },
      {
        employeeId: updatedLeave.employeeId,
        name: updatedLeave.name,
        role: updatedLeave.role,
        fromDate: updatedLeave.fromDate,
        toDate: updatedLeave.toDate,
        leaveType: updatedLeave.leaveType,
        leaveStatus: updatedLeave.leaveStatus,
        approvedDays: updates.approvedDays,
        deductionDays: updates.deductionDays,
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
    };
  } catch (error) {
    console.error("Error in updateLeaveRequest:", error);
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


