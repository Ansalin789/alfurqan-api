import { ResponseToolkit, Request } from "@hapi/hapi";
import { admincreateMeeting, getAdminMeetingById, getAllAdminMeetingRecords, updateAdminMeetingById } from "../../operations/adminmeeting";
import { IAdminMeetingCreate } from "../../../types/models.types";
import { isNil } from "lodash";
import { addAminMeetingMessages } from "../../config/messages";
import { notFound } from "@hapi/boom";


export interface IAdminMeetingUpdate{
  meetingName:string,
  selectedDate: Date,
  status?:string,
  meetingStatus?: string,
  startTime:string,
  endTime:string,
  updatedDate?:Date,
  updatedBy?:string,
  description:string,
  }



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
  
//Update

async updateAdminMeetingRecordById(req: Request, h: ResponseToolkit) {
  try {
    const payload = req.payload as IAdminMeetingUpdate;

    if (!payload) {
      return h.response({ message: "Request payload is missing" }).code(400);
    }

    const { selectedDate, startTime, endTime, meetingStatus, updatedBy, updatedDate, meetingName, description } = payload;

    // Validate required reschedule fields (only selectedDate, startTime, and endTime)
    if (!selectedDate || !startTime || !endTime) {
      return h.response({ message: "Missing required reschedule fields" }).code(400);
    }

    const updatedPayload: Partial<IAdminMeetingUpdate> = {
      selectedDate: new Date(selectedDate),
      startTime,
      endTime,
      meetingStatus: meetingStatus ?? "rescheduled",
      updatedBy: updatedBy ?? "admin",
      updatedDate: updatedDate ?? new Date(),
      meetingName, // Optional field
      description, // Optional field
    };

    const result = await updateAdminMeetingById(req.params.meetingId, updatedPayload);

    if (!result) {
      return h.response({ message: "Failed to update meetings" }).code(404);
    }

    return h.response({ message: "Meetings updated successfully", data: result }).code(200);

  } catch (error) {
    console.error("Error during updating meetings:", error);
    return h.response({ message: "Internal Server Error", error }).code(500);
  }
}






}






  