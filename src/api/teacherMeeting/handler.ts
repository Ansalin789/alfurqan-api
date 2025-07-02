import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import teachermeeting, {zodTeacherMeetingSchema} from "../../models/teachermeeting";
import { createTeacherMeeting, getallTeachermeeting, getTeachermeetingById, updateAllTeacherMeeting } from "../../operations/teacherMeeting"
import { zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation";
import { addMeetingMessages, evaluationMessages } from "../../config/messages";
import { checkMeetingConflict, getTeacherMeetingById, mergeMeetingPayload } from "../../shared/utils/meetingUtils";
import { isNil } from "lodash";
import { notFound } from "@hapi/boom";
import { Types } from "mongoose";

const createInputValidation = z.object({
    payload : zodTeacherMeetingSchema.pick({
        meetingId : true,
        meetingName : true,
        teacher : true,
        participants : true,
        selectedDate : true,
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
    selectedDate: true,         // ✅ Replaces 'selectedDate'
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

    let teacher: { teacherId?: string; teacherName?: string; teacherEmail?: string } = {};

    if (typeof payload.teacher === "string") {
      try {
        const parsed = JSON.parse(payload.teacher);
        teacher = {
          teacherId: parsed.teacherId,
          teacherName: parsed.teacherName,
          teacherEmail: parsed.teacherEmail
        };
      } catch (err) {
        console.error("Failed to parse supervisor string:", err);
      }
    } else if (typeof payload.teacher === "object" && payload.teacher !== null) {
      teacher = {
        teacherId: payload.teacher.teacherId,
        teacherName: payload.teacher.teacherName,
        teacherEmail: payload.teacher.teacherEmail
      };
    }

    const meeting = await createTeacherMeeting({
      meetingId: "",
      meetingName: payload.meetingName,
      participants: Array.isArray(payload.participants) ? payload.participants : [],
      teacher,// ✅ Directly assign parsed teacher data
      description: payload.description,
      selectedDate: new Date(payload.selectedDate),
      startTime: payload.startTime,
      endTime: payload.endTime,
      meetingStatus: payload.meetingStatus ?? "Scheduled",
      status: payload.status,
      createdDate: payload.createdDate ? new Date(payload.createdDate) : new Date(),
      createdBy: payload.createdBy ?? "system",
      updatedDate: payload.updatedDate ? new Date(payload.updatedDate) : new Date(),
      updatedBy: payload.updatedBy ?? "system"
    });

    console.log('teacherid...', meeting);

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
      console.log("🔄 Incoming updateTeacherMeeting request");
  
      const meetingId = req.params.id;
      console.log("📌 Meeting ID:", meetingId);
  
      if (!meetingId) {
        console.log("❌ Meeting ID is missing in path");
        return h.response({ message: "Meeting ID is missing in path" }).code(400);
      }
  
      const payload = req.payload as any;
      console.log("📦 Raw Payload:", payload);
  const teaherdtails = await teachermeeting.findOne({_id : new Types.ObjectId(meetingId) });
  console.log("teaherdtails>>>", teaherdtails?.teacher);

      if (!payload) {
        console.log("❌ Request payload is missing");
        return h.response({ message: "Request payload is missing" }).code(400);
      }
  
      // Validate using Zod
      console.log("✅ Validating payload with Zod");
      const validatedPayload = updateMeetingInputValidation.parse({ payload });
      console.log("✅ Validated Payload:", validatedPayload);
  
      // Fetch existing meeting
      console.log("📥 Fetching existing meeting from DB...");
      const existingMeeting = await getTeacherMeetingById(meetingId);
      console.log("📄 Existing Meeting:", existingMeeting);
  
      if (!existingMeeting) {
        console.log("❌ Meeting not found");
        return h.response({ message: addMeetingMessages.USER_NOT_FOUND }).code(404);
      }
  
      // Merge payload with existing meeting
      console.log("🧩 Merging existing meeting with payload...");
      const updatedPayload = mergeMeetingPayload(validatedPayload.payload, existingMeeting);
      console.log("🔀 Merged Payload:", updatedPayload);
  
      // Detect time change
      const isTimeChanged =
        updatedPayload.startTime !== existingMeeting.startTime ||
        updatedPayload.endTime !== existingMeeting.endTime;
  
      console.log("⏱ Time Changed:", isTimeChanged);
  
      if (isTimeChanged) {
        const teacherId = updatedPayload.teacher?.teacherId;
        const studentId = updatedPayload.participants?.[0]?.studentId;
  
        console.log("👤 Teacher ID:", teacherId);
        console.log("👨‍🎓 Student ID:", studentId);
  
        if (!teacherId || !studentId) {
          console.log("❌ Invalid teacher or student details");
          return h.response({ message: "Invalid teacher or student details" }).code(400);
        }
  
        console.log("🧠 Checking for scheduling conflict...");
        const hasConflict = await checkMeetingConflict(
          studentId,
          updatedPayload.selectedDate,
          updatedPayload.startTime,
          updatedPayload.endTime,
          meetingId
        );
        console.log("📛 Has Conflict:", hasConflict);
  
        if (hasConflict) {
          console.log("❌ Time slot conflict detected");
          return h.response({ message: "Reschedule failed: Time slot already occupied" }).code(400);
        }
  
        updatedPayload.meetingStatus = "Re-Scheduled";
        console.log("📆 Meeting status updated to Re-Scheduled");
      }
  
      // Update in DB
      console.log("💾 Updating meeting in database...");
      const updateResult = await updateAllTeacherMeeting(meetingId, updatedPayload);
      console.log("✅ DB Update Result:", updateResult);
  
      if (!updateResult) {
        console.log("❌ Failed to update meeting: Not Found");
        return h.response({ message: addMeetingMessages.USER_NOT_FOUND }).code(404);
      }
  
      // Fetch the updated meeting to ensure all fields (including teacherId) are present
      const updatedMeeting = await getTeacherMeetingById(meetingId);

      console.log("✅ Successfully updated meeting");
      if (!updatedMeeting) {
        console.log("❌ Updated meeting not found after update");
        return h.response({ message: addMeetingMessages.USER_NOT_FOUND }).code(404);
      }
      return h.response(updatedMeeting).code(200);
    } catch (error) {
      console.error("💥 Error updating meeting:", error);
      return h.response({ message: "Internal Server Error", error }).code(500);
    }
  }
    
    
}
