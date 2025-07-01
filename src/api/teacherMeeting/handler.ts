import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import teachermeeting, {zodTeacherMeetingSchema} from "../../models/teachermeeting";
import { createTeacherMeeting, getallTeachermeeting, getTeachermeetingById, updateAllTeacherMeeting } from "../../operations/teacherMeeting"
import { zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation";
import { addMeetingMessages, evaluationMessages } from "../../config/messages";
import { checkMeetingConflict, getMeetingById, getTeacherMeetingById, mergeMeetingPayload } from "../../shared/utils/meetingUtils";
import { isNil } from "lodash";
import { notFound } from "@hapi/boom";


const createInputValidation = z.object({
    payload : zodTeacherMeetingSchema.pick({
        meetingId : true,
        meetingName : true,
        teacher : true,
        participants : true,
        meetingdate : true,
        startTime : true,
        endTime:true,
        description : true,
        meetingStatus : true,
        status : true,
        createdDate : true,
        createdBy : true,
        updatedDate: true,
        updatedBy: true,
        

    })
});

const getallTeachermeetingInputValidation = z.object({
    payload: zodGetAllRecordsQuerySchema.pick({
   meetingId:true,
 sortBy:true,
    }),
  });

 const updateMeetingInputValidation = z.object({
  payload: zodTeacherMeetingSchema.pick({
    meetingName: true,
    meetingdate: true,         // ✅ Replaces 'selectedDate'
    startTime: true,            // ✅ Replaces 'startTime'
    endTime: true,              // ✅ Replaces 'endTime'
    description: true,
    status: true,
    meetingStatus: true,
    updatedDate: true,
    updatedBy: true
  }).extend({
    filterValues: z.any().optional(), // ✅ Properly handled here
    offset: z.string().optional().nullable(),
    limit: z.string().optional().nullable(),
    searchText: z.string().optional(),
    sortBy: z.string().optional()
  }).partial()
});



export default {


   async createTeacherMeeting(req: Request, h: ResponseToolkit) {
  try {
    const { payload } = createInputValidation.parse({ payload: req.payload });

    const meeting = await createTeacherMeeting({
      meetingId: "",
      meetingName: payload.meetingName,
      participants: Array.isArray(payload.participants) ? payload.participants : [],
      teacher: payload.teacher, // ✅ Directly assign parsed teacher data
      description: payload.description,
      meetingdate: new Date(payload.meetingdate),
      startTime: payload.startTime,
      endTime: payload.endTime,
      meetingStatus: payload.meetingStatus ?? "Scheduled",
      status: payload.status,
      createdDate: payload.createdDate ? new Date(payload.createdDate) : new Date(),
      createdBy: payload.createdBy ?? "system",
      updatedDate: payload.updatedDate ? new Date(payload.updatedDate) : new Date(),
      updatedBy: payload.updatedBy ?? "system"
    });

    return h.response({ meeting }).code(200);
  } catch (error) {
    console.error("Create Meeting Error:", error);
    return h.response({ error }).code(400);
  }
}
,

    async getallTeachermeeting(req: Request, h: ResponseToolkit) {
        try {
          // Parse and validate the request query using zod
          const parsedQuery = getallTeachermeetingInputValidation.parse({
            payload: {
              ...req.query,
              filterValues: (() => {
                try {
                  return req.query?.filterValues
                    ? JSON.parse(req.query.filterValues as string)
                    : {};
                } catch {
                  throw new Error("Invalid filterValues JSON format.");
                }
              })(),
            },
          });
    
          const query = parsedQuery.payload;
    
          // Call your service or database function to fetch data
          const result = await getallTeachermeeting(query);
    
          // Return the response
          return h.response(result).code(200);
        } catch (error) {
          // Handle errors (validation or other errors)
          return h
            .response({ error })
            .code(400);
        }
    }
    ,

    async getTeachermeetingById(req: Request , h: ResponseToolkit) {
      const result = await getTeachermeetingById(String(req.params.meetingId));
    
      if (isNil(result)) {
        return notFound(evaluationMessages.EVALUATIONS_NOT_FOUND);
      }
    
      return result;
    },
    
  async updateTeacherMeeting(req: Request, h: ResponseToolkit) {
    try {
      const meetingId = req.params.id;
  
      if (!meetingId) {
        return h.response({ message: "Meeting ID is missing in path" }).code(400);
      }
  
      const payload = req.payload as any;
      if (!payload) {
        return h.response({ message: "Request payload is missing" }).code(400);
      }
  
      // Validate using Zod
      const validatedPayload = updateMeetingInputValidation.parse({ payload });
  
      // Fetch existing meeting
      const existingMeeting = await getTeacherMeetingById(meetingId);
      if (!existingMeeting) {
        return h.response({ message: addMeetingMessages.USER_NOT_FOUND }).code(404);
      }
  
      // Merge payload with existing meeting
      const updatedPayload = mergeMeetingPayload(validatedPayload.payload, existingMeeting);
  
      // Detect time change
      const isTimeChanged =
        updatedPayload.startTime !== existingMeeting.startTime ||
        updatedPayload.endTime !== existingMeeting.endTime;
  
      if (isTimeChanged) {
        const teacherId = updatedPayload.teacher?.teacherId;
        const studentId = updatedPayload.participants?.[0]?.studentId;
  
        if (!teacherId || !studentId) {
          return h.response({ message: "Invalid teacher or student details" }).code(400);
        }
  
        const hasConflict = await checkMeetingConflict(
          studentId,
          updatedPayload.selectedDate,
          updatedPayload.startTime,
          updatedPayload.endTime,
          meetingId
        );
  
        if (hasConflict) {
          return h.response({ message: "Reschedule failed: Time slot already occupied" }).code(400);
        }
  
        updatedPayload.meetingStatus = "Re-Scheduled";
      }
  
      // Update in DB
      const result = await updateAllTeacherMeeting(meetingId, updatedPayload);
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
