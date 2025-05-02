import { Request, ResponseToolkit } from '@hapi/hapi'; 
import { zodleaverequestSchema } from '../../models/leaverequest';
import { z } from 'zod';
import { createLeaveRequest } from '../../operations/leaveRequest';

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
    }
  };
  
  
