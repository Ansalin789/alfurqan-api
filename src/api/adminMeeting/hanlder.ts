import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { zodAdminAddMeetingSchema } from "../../models/adminmeeting";
import { admincreateMeeting, getAdminMeetingById, getAllAdminMeetingRecords } from "../../operations/adminmeeting";
import { IAdminMeetingCreate } from "../../../types/models.types";
import { isNil } from "lodash";
import { addAminMeetingMessages } from "../../config/messages";
import { notFound } from "@hapi/boom";



const createInputValidation = z.object({
  payload: zodAdminAddMeetingSchema.pick({
    meetingName: true,
    selectedDate: true,
    startTime: true,
    endTime: true,
    teacher: true,
    description: true,
    status: true,
    meetingStatus: true,
    createdDate: true,
    createdBy: true,
    updatedDate: true,
  }),
});



export default {


  //Create Admin Meeting
  async createAdminMeeting(req: Request, h: ResponseToolkit) {
    try {
      const rawPayload = req.payload as any;
  
      const payload: IAdminMeetingCreate = {
        meetingName: rawPayload.meetingName,
        selectedDate: new Date(rawPayload.selectedDate),
        startTime: rawPayload.startTime,
        endTime: rawPayload.endTime,
        description: rawPayload.description,
        status: rawPayload.status,
        meetingStatus: rawPayload.meetingStatus ?? "Scheduled",
        createdDate: rawPayload.createdDate ? new Date(rawPayload.createdDate) : new Date(),
        createdBy: rawPayload.createdBy,
        updatedDate: rawPayload.updatedDate ? new Date(rawPayload.updatedDate) : new Date(),
        updatedBy: rawPayload.updatedBy ?? "",
        teacher: Array.isArray(rawPayload.teacher) ? rawPayload.teacher : [],
      };
  
      // Call the service to create meetings
      const meetings = await admincreateMeeting(payload);
  
      if ("error" in meetings) {
        return h.response({ error: meetings.error }).code(400);
      }
  
      return h.response({
        message: "Meetings created successfully for each teacher.",
        data: meetings
      }).code(201);
  
    } catch (error) {
      console.error("Error in createAdminMeeting handler:", error);
      return h.response({ error }).code(400);
    }
  },
  
  
  //Admin Meeting List

    async getAllAdminMeeting(req: Request, h: ResponseToolkit) {
      try {
        const meetings = await getAllAdminMeetingRecords();
        return h.response({ message: "Meetings retrieved successfully", data: meetings }).code(200);
      } catch (error) {
        return h.response({ error }).code(500);
      }
    },

  //get by ID
      async getAdminMeetingRecordById(req: Request, h: ResponseToolkit){
        const result = await getAdminMeetingById(String(req.params.meetingId));
  
        if (isNil(result)) {
             return notFound(addAminMeetingMessages.USER_NOT_FOUND);
             }
  
    return result;
      },
  




}






  