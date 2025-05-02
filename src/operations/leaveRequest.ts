import { ILeaveRequest, ILeaveRequestCreate } from "../../types/models.types";
import LeaveRequestModel from "../models/leaverequest";
import User from "../models/users"

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
  
  
