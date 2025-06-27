import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import teachermeeting, {zodTeacherMeetingSchema} from "../../models/teachermeeting";
import { createTeacherMeeting, getallTeachermeeting } from "../../operations/teacherMeeting"


const createInputValidation = z.object({
    payload : zodTeacherMeetingSchema.pick({
        meetingId : true,
        meetingName : true,
        teacher : true,
        participants : true,
        meetingDate : true,
        fromTime : true,
        description : true,
        meetingStatus : true,
        status : true,
        createdDate : true,
        createdBy : true,
        updatedDate : true,
        updatedBy : true,

    })
});

const updateTeacherMeetingValidation = z.object({
    payload : zodTeacherMeetingSchema.pick({
        meetingId : true,
        meetingName : true,
        teacher : true,
        participants : true,
        meetingDate : true,
        fromTime : true,
        description : true,
        meetingStatus : true,
        status : true,
        createdDate : true,
        createdBy : true,
        updatedDate : true,
        updatedBy : true, 
    })  .extend({
        offset: z.string().optional().nullable(),
        limit: z.string().optional().nullable(),
        searchText: z.string().optional(),
        sortBy: z.string().optional(), // Add sortBy as optional
      })
      .partial(),
})

export default {
    async createTeacherMeeting(req: Request, h:ResponseToolkit){
        try {
            const {payload} = createInputValidation.parse({payload:req.payload});
            let teacher : {teacherId?: string, teacherName?: string, teacherEmail?:string} = {};

            // if (typeof payload.teacher === "string") {
            //     try {
            //       const parsed = JSON.parse(payload.teacher);
            //       teacher = {
            //         teacherId: parsed.teacherId,
            //         teacherName: parsed.teacherName,
            //         teacherEmail: parsed.teacherEmail
            //       };
            //     } catch (err) {
            //       console.error("Failed to parse teacher string:", err);
            //     }
            //   } else if (typeof payload.teacher === "object" && payload.teacher !== null) {
            //     teacher = {
            //         teacherId: payload.teacher.teacherId,
            //         teacherName: payload.teacher.teacherName,
            //         teacherEmail: payload.teacher.teacherEmail
            //     };
            //   }

              const meeting = await createTeacherMeeting({
                meetingId : "",
                meetingName : payload.meetingName,
                participants : Array.isArray(payload.participants) ? payload.participants : [],
                teacher,
                description : payload.description,
                meetingDate : new Date(payload.meetingDate),
                fromTime : payload.fromTime,
                toTime : payload.fromTime,
                meetingStatus : payload.meetingStatus ?? 'Scheduled',
                status : payload.status,
                createdDate : payload.createdDate || new Date(),
                createdBy: payload.createdBy,
                updatedDate: payload.updatedDate || new Date(),

              })
        } catch (error) {
            return h.response({error}).code(400);
        }
    },

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
    
}
