import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import addmeeting, { zodAddMeetingSchema } from "../../models/addmeeting";
import { createMeeting, getAllMeetingRecords, getMeetingRecordById, updateMeetingById, updateMeetingMinutesAndAttendees } from "../../operations/addmeeting";
import { isNil } from "lodash";
import { notFound } from "@hapi/boom";
import { addMeetingMessages } from "../../config/messages";
import { checkMeetingConflict, getMeetingById, mergeMeetingPayload } from "../../shared/utils/meetingUtils";
import { supervisorAddMeeting } from "../../kafka/producers/supervisorProducer";
import { ITeacher } from "../../../types/models.types";


const createInputValidation = z.object({
  payload: zodAddMeetingSchema.pick({
    meetingName: true,
    selectedDate: true,
    startTime: true,
    endTime: true,
    teacher: true,
    supervisor: true,
    description: true,
    status: true,
    meetingStatus: true,
    meetingminutes: true,
    createdDate: true,
    createdBy: true,
    duartion:true,
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
    updatedBy: true,
    filterValues: true,
  })
  .extend({
    offset: z.string().optional().nullable(),
    limit: z.string().optional().nullable(),
    searchText: z.string().optional(),
    sortBy: z.string().optional(), // Add sortBy as optional
  })
  .partial(),
});

 


export default {
async createMeeting(req: Request, h: ResponseToolkit) {
  try {
    const { payload } = createInputValidation.parse({ payload: req.payload });

    let supervisor: { supervisorId?: string; supervisorName?: string; supervisorEmail?: string } = {};

    if (typeof payload.supervisor === "string") {
      try {
        const parsed = JSON.parse(payload.supervisor);
        supervisor = {
          supervisorId: parsed.supervisorId,
          supervisorName: parsed.supervisorName,
          supervisorEmail: parsed.supervisorEmail
        };
      } catch (err) {
        console.error("Failed to parse supervisor string:", err);
      }
    } else if (typeof payload.supervisor === "object" && payload.supervisor !== null) {
      supervisor = {
        supervisorId: payload.supervisor.supervisorId,
        supervisorName: payload.supervisor.supervisorName,
        supervisorEmail: payload.supervisor.supervisorEmail
      };
    }

    const meeting = await createMeeting({
      meetingName: payload.meetingName,
      selectedDate: new Date(payload.selectedDate),
      startTime: payload.startTime,
      endTime: payload.endTime,
      teacher: Array.isArray(payload.teacher) ? payload.teacher : [],
      supervisor, 
      description: payload.description,
      status: payload.status,
      meetingStatus: payload.meetingStatus ?? "Scheduled",
      meetingminutes: payload.meetingminutes,
      createdDate: payload.createdDate || new Date(),
      createdBy: payload.createdBy,
      updatedDate: payload.updatedDate || new Date(),
      meetingId: "",
      duration: payload.duartion || "",

    });

    if (meeting) {
     await supervisorAddMeeting({data: meeting });
    }

    return h.response({ message: "Meeting created successfully", data: meeting }).code(201);
  } catch (error) {
    return h.response({ error }).code(400);
  }
},


async getAllMeetings(req: Request, h: ResponseToolkit) {
  let filterValues: any = {};

  // Parse filterValues if present as string
  if (typeof req.query.filterValues === "string") {
    try {
      filterValues = JSON.parse(req.query.filterValues);
    } catch {
      filterValues = {};
    }
  } else {
    filterValues = {};
    if (req.query.meetingStatus) {
      filterValues.meetingStatus = Array.isArray(req.query.meetingStatus)
        ? req.query.meetingStatus
        : [req.query.meetingStatus];
    }
    if (req.query.startTime) {
      filterValues.startTime = Array.isArray(req.query.startTime)
        ? req.query.startTime
        : [req.query.startTime];
    }
    if (req.query["dateRange.from"] && req.query["dateRange.to"]) {
      filterValues.dateRange = {
        from: req.query["dateRange.from"],
        to: req.query["dateRange.to"]
      };
    }
    // Add more filter normalizations as needed
  }

  const queryObj = {
    ...req.query,
    filterValues,
  };

  const { payload } = updateMeetingInputValidation.parse({ payload: queryObj });

  const queryForService = {
    ...payload,
    offset:
      payload.offset !== null && payload.offset !== undefined
        ? String(payload.offset)
        : null,
    limit:
      payload.limit !== null && payload.limit !== undefined
        ? String(payload.limit)
        : null,
    sortBy: payload.sortBy ?? "createdDate", // Add a default sortBy if not provided
  };

  return getAllMeetingRecords(queryForService);
}


,

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
const validatedPayload = updateMeetingInputValidation.parse({ payload }); // ✅ correct

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

      updatedPayload.meetingStatus = "Rescheduled";
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
},

//Update meeting minutes
async updateMeetingMinutesRecordById(req: Request, h: ResponseToolkit) {
  try {
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Raw payload:", req.payload);

    const meetingId = req.params.meetingbyId;
    const payload = req.payload as {
      meetingminutes: string;
      teacher: ITeacher[];
      updatedBy?: string;
    };

    if (!payload || !payload.meetingminutes || !Array.isArray(payload.teacher)) {
      return h.response({ message: "Missing or invalid data" }).code(400);
    }

    const result = await updateMeetingMinutesAndAttendees(
      meetingId,
      payload.meetingminutes,
      payload.teacher,
      payload.updatedBy
    );

    if (!result) {
      return h.response({ message: addMeetingMessages.USER_NOT_FOUND }).code(404);
    }

    return h.response(result).code(200);
  } catch (error) {
    console.error("Error updating meeting minutes and attendees:", error);
    return h.response({ message: "Internal Server Error", error }).code(500);
  }
}


  


}



  