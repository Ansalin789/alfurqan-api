import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import addmeeting, { zodAddMeetingSchema } from "../../models/addmeeting";
import { createMeeting, getAllMeetingRecords, getMeetingRecordById, updateMeetingById } from "../../operations/addmeeting";
import { isNil } from "lodash";
import { notFound } from "@hapi/boom";
import { addMeetingMessages } from "../../config/messages";
import { checkMeetingConflict, getMeetingById, mergeMeetingPayload } from "../../shared/utils/meetingUtils";


const createInputValidation = z.object({
  payload: zodAddMeetingSchema.pick({
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

 const updateMeetingInputValidation = z.object({
  payload: zodAddMeetingSchema.pick({
    meetingName: true,
    selectedDate: true,
    startTime: true,
    endTime: true,
    description: true,
    status: true,
    meetingStatus: true,
    updatedDate: true,
    updatedBy:true,
  }),
 })

export default {
  async createMeeting(req: Request, h: ResponseToolkit) {
    try {
     
      const { payload } = createInputValidation.parse({ payload: req.payload });

      const meeting = await createMeeting({
        meetingName: payload.meetingName,
        selectedDate: new Date(payload.selectedDate),
        startTime: payload.startTime,
        endTime: payload.endTime,
        teacher: Array.isArray(payload.teacher) ? payload.teacher : [],
        description: payload.description,
        status: payload.status,
        meetingStatus: payload.meetingStatus ?? "Scheduled",
        createdDate: payload.createdDate || new Date(),
        createdBy: payload.createdBy,
        updatedDate: payload.updatedDate || new Date(),
        meetingId: ""
      });

      return h.response({ message: "Meeting created successfully", data: meeting }).code(201);
    } catch (error) {
      return h.response({ error }).code(400);
    }
  },

  async getAllMeetings(req: Request, h: ResponseToolkit) {
    try {
      const meetings = await getAllMeetingRecords();
      return h.response({ message: "Meetings retrieved successfully", data: meetings }).code(200);
    } catch (error) {
      return h.response({ error }).code(500);
    }
  },


  //get by ID
      async getMeetingRecordById(req: Request, h: ResponseToolkit){
        const result = await getMeetingRecordById(String(req.params.meetingId));
  
        if (isNil(result)) {
             return notFound(addMeetingMessages.USER_NOT_FOUND);
             }
  
    return result;
      },

//Update

async updateMeetingRecordById(req: Request, h: ResponseToolkit) {
  try {
    // Directly use req.payload without destructuring
    const payload = req.payload as any;
    
    if (!payload) {
      return h.response({ message: "Request payload is missing" }).code(400);
    }

    console.log("Received Payload:", payload);

    // Validate and parse payload using Zod
    const validatedPayload = updateMeetingInputValidation.parse({ payload });

    // Fetch existing meeting record
    const existingMeeting = await getMeetingById(req.params.meetingId);
    if (!existingMeeting) {
      return h.response({ message: addMeetingMessages.USER_NOT_FOUND }).code(404);
    }

    // Merge existing values if not provided in the payload
    const updatedPayload = mergeMeetingPayload(validatedPayload.payload, existingMeeting);

    // Check if time has changed
    const isTimeChanged =
      updatedPayload.startTime !== existingMeeting.startTime ||
      updatedPayload.endTime !== existingMeeting.endTime;

    if (isTimeChanged) {
      // ✅ FIX: Correct teacher and supervisor validation
      if (
        !updatedPayload.teacher?.length ||  // Ensure teacher array exists and is not empty
        !updatedPayload.teacher[0]?.teacherId ||  // Access first teacher's teacherId
        !updatedPayload.supervisor?.supervisorId
      ) {
        return h.response({ message: "Invalid teacher or supervisor details" }).code(400);
      }

      // Check for conflicts before rescheduling
      const hasConflict = await checkMeetingConflict(
        updatedPayload.teacher[0].teacherId,  // Use first teacher's ID
        updatedPayload.supervisor.supervisorId,
        updatedPayload.selectedDate,
        updatedPayload.startTime,
        updatedPayload.endTime,
        req.params.meetingId
      );

      if (hasConflict) {
        return h.response({ message: "Reschedule failed: Time slot already occupied" }).code(400);
      }

      updatedPayload.meetingStatus = "rescheduled";
    }

    // Update meeting in the database
    const result = await updateMeetingById(req.params.meetingId, updatedPayload);

    if (!result) {
      return h.response({ message: addMeetingMessages.USER_NOT_FOUND }).code(404);
    }

    return h.response(result).code(200);
  } catch (error) {
    console.error("Error updating meeting:", error);
    return h.response({ message: "Internal Server Error", error }).code(500);
  }
}




    }    






  