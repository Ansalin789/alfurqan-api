import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { zodAddMeetingSchema } from "../../models/addmeeting";
import { createMeeting, getAllMeetingRecords, getMeetingRecordById, meetingByIdRecord, updateMeetingById, updateMeetingMinutesAndAttendees } from "../../operations/addmeeting";
import { isNil } from "lodash";
import { addMeetingMessages, ClassSchedulesMessages } from "../../config/messages";
import { checkMeetingConflict, getMeetingById } from "../../shared/utils/meetingUtils";
import { ITeacher, IOrganizer } from "../../../types/models.types";
import crypto from "node:crypto";


const createInputValidation = z.object({
  payload: zodAddMeetingSchema.pick({
    meetingName: true,
    meetingId: true,
    selectedDate: true,
    startTime: true,
    endTime: true,
    organizer: true,
    description: true,
    status: true,
    teacher: true,
    meetingStatus: true,
    meetingminutes: true,
    createdDate: true,
    createdBy: true,
    duration: true,
    updatedDate: true,
    participants: true,
  }),
});

const updateMeetingInputValidation = zodAddMeetingSchema.pick({
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
})
  .extend({
    offset: z.string().optional().nullable(),
    limit: z.string().optional().nullable(),
    searchText: z.string().optional(),
    sortBy: z.string().optional(),
  })
  .partial(); // ✅ allow partial updates

export default {
  async createMeeting(req: Request, h: ResponseToolkit) {
    try {
      const { payload } = createInputValidation.parse({ payload: req.payload });
      // ✅ Parse organizer safely (can be stringified or object)
      let organizer: IOrganizer | undefined;
      const organizerInput = (req.payload as any)?.organizer ?? payload.organizer;
      if (typeof organizerInput === "string") {
        try {
          const o = JSON.parse(organizerInput);
          const rawRole = o.role ?? o.organizerRole;
          const normRole = typeof rawRole === "string" ? rawRole.toLowerCase().replaceAll(/\s+/g, "") : undefined;
          organizer = {
            organizerId: o.organizerId,
            organizerName: o.organizerName,
            organizerEmail: o.organizerEmail,
            role: (normRole as any),
          };
        } catch (error) {
          return h.response({ message: "Failed to parse organizer string:", error }).code(400);
        }
      } else if (typeof organizerInput === "object" && organizerInput !== null) {
        const rawRole = (organizerInput).role ?? (organizerInput).organizerRole;
        const normRole = typeof rawRole === "string" ? rawRole.toLowerCase().replaceAll(/\s+/g, "") : undefined;
        organizer = {
          organizerId: (organizerInput).organizerId,
          organizerName: (organizerInput).organizerName,
          organizerEmail: (organizerInput).organizerEmail,
          role: (normRole as any),
        };
      }
      // ✅ Parse participants safely
      const participants = Array.isArray(payload.participants)
        ? payload.participants.map((p: any) => ({
          participantId: p.participantId,
          participantName: p.participantName,
          participantEmail: p.participantEmail,
          role: p.role,
          attendee: p.attendee || p.role,
        }))
        : [];
      // 🧠 Shared meetingId for all records
      const meetingId = payload.meetingId || `meet-${crypto.randomUUID()}`;
      // ✅ Create per-participant records in service
      const meetingResult = await createMeeting({
        meetingName: payload.meetingName,
        meetingId,
        selectedDate: payload.selectedDate,
        startTime: payload.startTime,
        endTime: payload.endTime,
        description: payload.description,
        meetingStatus: payload.meetingStatus,
        createdDate: payload.createdDate,
        createdBy: payload.createdBy,
        status: payload.status ?? "Active",
        meetingminutes: payload.meetingminutes,
        duration: payload.duration,
        participants,
        organizer, // ✅ pass organizer here
        updatedDate: payload.updatedDate,
      });
      if ((meetingResult as any)?.error) {
        return h.response({ error: (meetingResult as any).error }).code(400);
      }
      return h
        .response({
          message: "✅ Meeting created successfully",
          data: meetingResult,
        })
        .code(201);

    } catch (error) {
      return h.response({ message: "❌ Error creating meeting:", error }).code(400);
    }
  },

  //Get all meetings
  async listMeetings(req: Request, h: ResponseToolkit) {
    const { supervisorId, offset, limit, sortBy } = req.query;
    const queryForService = {
      supervisorId,
      offset: offset ? String(offset) : null,
      limit: limit ? String(limit) : null,
      sortBy: sortBy ?? "createdDate",
    };
    return getAllMeetingRecords(queryForService);
  },


  //get by ID
  async getMeetingById(req: Request, h: ResponseToolkit) {
    const { meetingId } = req.query;
    if (!meetingId) {
      return h.response({ error: 'meetingId is required in query params' }).code(400);
    }
    const result = await getMeetingRecordById(meetingId as string);
    if (!result.length) {
      return h.response({ message: 'No meetings found' }).code(404);
    }
    return h.response({ total: result.length, meetings: result }).code(200);
  },


  //Update Meeting 

  async updateMeetingRecordById(req: Request, h: ResponseToolkit) {
    try {
      const payload = req.payload as any;
      if (!payload) {
        return h.response({ message: "Request payload is missing" }).code(400);
      }
      // ✅ Step 1: Validate BEFORE merging (Zod expects strings, not Dates)
      const validatedPayload = updateMeetingInputValidation.parse(payload);
      // ✅ Step 2: Fetch the existing meeting
      const existingMeeting = await getMeetingById(req.params.meetingId);
      if (!existingMeeting) {
        return h.response({ message: addMeetingMessages.USER_NOT_FOUND }).code(404);
      }
      // ✅ Step 3: Merge Zod-validated payload into existing object
      const updatedPayload = {
        ...existingMeeting.toObject(),
        ...validatedPayload, // ⛔️ This might overwrite fields incorrectly
      };
      // 🔍 Check if time has changed
      const isTimeChanged =
        updatedPayload.startTime !== existingMeeting.startTime ||
        updatedPayload.endTime !== existingMeeting.endTime;

      if (isTimeChanged) {
        if (
          !updatedPayload.teacher?.length ||
          !updatedPayload.teacher[0]?.teacherId ||
          !updatedPayload.organizer?.organizerId
        ) {
          return h
            .response({ message: "Invalid teacher or supervisor details" })
            .code(400);
        }
        const studentId = " "; // Assuming teacherId is used as studentId
        const meetingdate = new Date(updatedPayload.selectedDate);
        const hasConflict = await checkMeetingConflict(
          updatedPayload.teacher[0].teacherId,
          updatedPayload.organizer?.organizerId,
          studentId,
          String(meetingdate),
          updatedPayload.startTime,
          updatedPayload.endTime,
          req.params.meetingId
        );

        if (hasConflict) {
          return h
            .response({ message: "Reschedule failed: Time slot already occupied" })
            .code(400);
        }
        updatedPayload.meetingStatus = "Rescheduled";
      }
      // ✅ Update DB
      const result = await updateMeetingById(req.params.meetingId, updatedPayload);
      if (!result) {
        return h.response({ message: addMeetingMessages.USER_NOT_FOUND }).code(404);
      }
      return h.response(result).code(200);
    } catch (error) {
      return h.response({ message: "Internal Server Error", error }).code(500);
    }
  },


  //Update meeting minutes
  async updateMeetingMinutesRecordById(req: Request, h: ResponseToolkit) {
    try {
      const meetingId = req.params.meetingById;
      const payload = req.payload as {
        duration: string;
        meetingStatus: string;
        meetingminutes: string;
        teacher: ITeacher[];
        updatedBy?: string;
      };

      if (!payload?.meetingminutes || !Array.isArray(payload.teacher)) {
        return h.response({ message: "Missing or invalid data" }).code(400);
      }

      const result = await updateMeetingMinutesAndAttendees(
        meetingId,
        payload.meetingminutes,
        payload.meetingStatus,
        payload.duration,
        payload.teacher,
        payload.updatedBy
      );

      if (!result) {
        return h.response({ message: addMeetingMessages.USER_NOT_FOUND }).code(404);
      }

      return h.response(result).code(200);
    } catch (error) {
      return h.response({ message: "Error updating meeting minutes and attendees", error }).code(400);
    }
  },


  async getMeetingRecord(req: Request, h: ResponseToolkit) {
    try {
      // Fetch the student by ID
      const result = await meetingByIdRecord(String(req.params.id));
      // Handle not found case
      if (isNil(result)) {
        return h
          .response({ message: ClassSchedulesMessages.NOT_FOUND })
          .code(404);
      }
      return h.response(result).code(200);
    } catch (error) {
      // Handle errors (unexpected or other)
      return h
        .response({ error })
        .code(500);
    }
  }
}



