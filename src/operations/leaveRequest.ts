import mongoose from "mongoose";
import { ILeaveRequest, ILeaveRequestCreate } from "../../types/models.types";
import LeaveRequestModel from "../models/leaverequest";
import User from "../models/users";
import LeaveSummaryModel from "../models/leavesummary"

export const createLeaveRequest = async (
    payload: Partial<ILeaveRequestCreate> & { name: string }
  ): Promise<ILeaveRequest | { error: any }> => {
    try {
      // 1. Find employee by name
      const employee = await User.findOne({ userName: payload.name }).exec();
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


const DEFAULT_MONTHLY_QUOTA = 5; // Default monthly leave quota

export const updateLeaveRequest = async (
  id: string,
  updates: Partial<ILeaveRequest>
): Promise<{
  updatedLeave?: ILeaveRequest;
  leavesTaken?: number;
  remainingLeaves?: number;
  error?: any;
}> => {
  try {
    // 1. Fetch the existing leave request from the database
    const existingLeave = await LeaveRequestModel.findOne({ _id: new mongoose.Types.ObjectId(id) }).exec();
    
    if (!existingLeave) {
      return { error: "Leave request not found" };
    }

    // 2. If leave is not being approved, just update and return
    const isBeingApproved = updates.leaveStatus === "APPROVED";
    if (!isBeingApproved) {
      const updatedLeave = await LeaveRequestModel.findByIdAndUpdate(id, updates, { new: true }).exec();

      if (!updatedLeave) {
        return { error: "Failed to update leave request." };
      }

      return { updatedLeave };
    }

    // 3. Compute the current month range (start and end date)
    const employeeId = existingLeave.employeeId;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 4. Fetch all other approved leaves for the same employee in the current month
    const approvedLeaves = await LeaveRequestModel.find({
      employeeId,
      leaveStatus: "APPROVED",
      _id: { $ne: id }, // Exclude the current leave
      fromDate: { $gte: monthStart, $lte: monthEnd },
    });

    // 5. Calculate the duration of the new leave request (either from updates or existing)
    const from = new Date(updates.fromDate || existingLeave.fromDate);
    const to = new Date(updates.toDate || existingLeave.toDate);
    const thisLeaveDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // 6. Calculate the total leaves taken so far (including other approved leaves in the current month)
    const takenSoFar = approvedLeaves.reduce((sum, leave) => {
      const fromDate = new Date(leave.fromDate);
      const toDate = new Date(leave.toDate);
      const days = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return sum + days;
    }, 0);

    const totalWithThis = takenSoFar + thisLeaveDays;

    // 7. Check if the leave quota is exceeded
    if (totalWithThis > DEFAULT_MONTHLY_QUOTA) {
      return {
        error: `Leave quota exceeded. Requested ${totalWithThis} days, but monthly quota is ${DEFAULT_MONTHLY_QUOTA}.`,
        leavesTaken: takenSoFar,
        remainingLeaves: DEFAULT_MONTHLY_QUOTA - takenSoFar,
      };
    }

// 8. Approve and update the leave request
const updatedLeave = await LeaveRequestModel.findByIdAndUpdate(id, updates, { new: true }).exec();

if (!updatedLeave) {
  return { error: "Failed to update leave request after approval." };
}

// 9. Store a record in the LeaveSummary collection
const leaveSummary = new LeaveSummaryModel({
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
  createdDate: new Date(),
  createdBy: updatedLeave.approvedName,
  updatedDate: new Date(),
  updatedBy: updatedLeave.approvedName,
});

await leaveSummary.save();


    return {
      updatedLeave,
      leavesTaken: totalWithThis,
      remainingLeaves: DEFAULT_MONTHLY_QUOTA - totalWithThis,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : error };
  }
};





