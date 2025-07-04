import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import {zodTeacherMeetingSchema} from "../../models/teachermeeting";
import { createTeacherMeeting, getallTeachermeeting, getTeachermeetingById, ITeacherMeetingUpdate, updateAllTeacherMeeting } from "../../operations/teacherMeeting"
import { zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation";
import { addMeetingMessages, evaluationMessages } from "../../config/messages";
import { checkTeacherMeetingConflict, getTeacherMeetingById} from "../../shared/utils/meetingUtils";
import { isNil } from "lodash";
import { notFound } from "@hapi/boom";

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

const updateMeetingInputValidation = zodTeacherMeetingSchema.pick({
  meetingName: true,
  selectedDate: true,
  startTime: true,
  endTime: true,
  description: true,
  status: true,
  meetingStatus: true,
  updatedDate: true,
  updatedBy: true,
  filterValues: true,
  participants: true, // ✅ add this line
})
.extend({
  offset: z.string().optional().nullable(),
  limit: z.string().optional().nullable(),
  searchText: z.string().optional(),
  sortBy: z.string().optional(),
})
.partial(); 


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
    const payload = req.payload as any;
    if (!payload) {
      return h.response({ message: "Request payload is missing" }).code(400);
    }

    const validatedPayload = updateMeetingInputValidation.parse(payload);
    if (validatedPayload.selectedDate) {
      validatedPayload.selectedDate = new Date(validatedPayload.selectedDate);
    }

    const meetingId = req.params.meetingId;
    const existingMeeting = await getTeacherMeetingById(meetingId);

    if (!existingMeeting) {
      return h.response({ message: addMeetingMessages.USER_NOT_FOUND }).code(404);
    }

    const isTimeChanged =
      validatedPayload.startTime !== existingMeeting.startTime ||
      validatedPayload.endTime !== existingMeeting.endTime ||
      (validatedPayload.selectedDate &&
        validatedPayload.selectedDate.getTime() !== new Date(existingMeeting.selectedDate).getTime());

    if (isTimeChanged) {
      const teacherId = existingMeeting.teacher?.teacherId;
      const meetingDate = validatedPayload.selectedDate ?? existingMeeting.selectedDate;
      const studentIds = (validatedPayload.participants || existingMeeting.participants || []).map((p: any) => p.studentId);

      for (const studentId of studentIds) {
        const hasConflict = await checkTeacherMeetingConflict(
          teacherId,
          studentId,
          meetingDate.toISOString(),
          validatedPayload.startTime ?? existingMeeting.startTime,
          validatedPayload.endTime ?? existingMeeting.endTime,
          meetingId
        );
        if (hasConflict) {
          return h
            .response({ message: `Reschedule failed: Conflict for student ${studentId}` })
            .code(400);
        }
      }
    }

    const updatedPayload: Partial<ITeacherMeetingUpdate> = {
      meetingName: validatedPayload.meetingName ?? existingMeeting.meetingName,
      selectedDate: validatedPayload.selectedDate ?? existingMeeting.selectedDate,
      startTime: validatedPayload.startTime ?? existingMeeting.startTime,
      endTime: validatedPayload.endTime ?? existingMeeting.endTime,
      description: validatedPayload.description ?? existingMeeting.description,
      meetingStatus: isTimeChanged ? "Rescheduled" : validatedPayload.meetingStatus ?? existingMeeting.meetingStatus,
      updatedBy: validatedPayload.updatedBy ?? existingMeeting.updatedBy,
      updatedDate: new Date(),
      status: validatedPayload.status ?? existingMeeting.status,
    };

    const result = await updateAllTeacherMeeting(meetingId, updatedPayload);

    if (!result) {
      return h.response({ message: addMeetingMessages.USER_NOT_FOUND }).code(404);
    }

    return h.response(result).code(200);
  } catch (error) {
    console.error("💥 Error updating meeting:", error);
    return h.response({ message: "Internal Server Error", error }).code(500);
  }
}


    
    
}
