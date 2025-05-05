import { Request, ResponseToolkit } from '@hapi/hapi'; 
import { zodleaverequestSchema } from '../../models/leaverequest';
import { z } from 'zod';
import { createLeaveRequest, updateLeaveRequest } from '../../operations/leaveRequest';
import { ILeaveRequest } from '../../../types/models.types';
import mongoose from 'mongoose';

const createInputValidation = z.object({
  payload: zodleaverequestSchema.pick({
    name: true,
    fromDate: true,
    toDate: true,
    leaveType: true,
    leaveStatus: true,
    reason: true,
    status: true,
    createdDate: true,
    createdBy: true,
    UpdatedDate: true,
    UpdatedBy: true,
  })
});

export default {
    async createLeaveRequestHandler(req: Request, h: ResponseToolkit) {
      try {
        const result = createInputValidation.safeParse({ payload: req.payload });
  
        if (!result.success) {
          return h.response({ error: result.error.flatten() }).code(400);
        }
  
        const { payload } = result.data;
  
        const leaveRequest = await createLeaveRequest(payload);
  
        if ('error' in leaveRequest) {
          return h.response({ error: leaveRequest.error }).code(400);
        }
  
        // Return the response with employeeId (teacher's _id) and other details
        return h
          .response({
            message: 'Leave request created successfully',
            data: {
              ...leaveRequest, // Include all leaveRequest details
              employeeId: leaveRequest.employeeId // Add employeeId here
            }
          })
          .code(201);
      } catch (error) {
        return h.response({ error: error instanceof Error ? error.message : error }).code(400);
      }
    },


//summary API for Leave


async updateLeaveRequestHandler(req: Request, h: ResponseToolkit) {
  try {
    // Extract ObjectId from path params
    const { id } = req.params as { id: string };
    console.log("Received ID:", id);  // Debugging log
    
    // Validate the ObjectId (checking if it’s a valid 24-character hex string)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return h.response({ error: "Invalid ObjectId format" }).code(400);
    }

    // Extract the payload for updating the leave request
    const payload = req.payload as Partial<ILeaveRequest>;

    // Call the updateLeaveRequest function to update the request
    const result = await updateLeaveRequest(id, payload);

    // Check for errors in the result
    if (result.error) {
      return h.response({ error: result.error }).code(400);
    }

    // Successfully updated leave request
    return h.response({
      message: 'Leave request updated successfully',
      data: result,
    }).code(200);

  } catch (error) {
    // Catch any errors and return a server error response
    return h.response({
      error: error instanceof Error ? error.message : error
    }).code(500);
  }
}







}
  
  
