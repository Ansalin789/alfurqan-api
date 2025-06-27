import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import teachermeeting, {zodTeacherMeetingSchema} from "../../models/teachermeeting";
import { createTeacherMeeting, getallTeachermeeting } from "../../operations/teacherMeeting"
import { zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation";


const createInputValidation = z.object({
    payload : zodTeacherMeetingSchema.pick({
        meetingId : true,
        meetingName : true,
        teacher : true,
        participants : true,
        meetingdate : true,
        fromTime : true,
        toTime:true,
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

// const updateTeacherMeetingValidation = z.object({
//     payload : zodTeacherMeetingSchema.pick({
//         meetingId : true,
//         meetingName : true,
//         teacher : true,
//         participants : true,
//         meetingDate : true,
//         fromTime : true,
//         description : true,
//         meetingStatus : true,
//         status : true,
//         createdDate : true,
//         createdBy : true,
//         updatedDate : true,
//         updatedBy : true, 
//     })  .extend({
//         offset: z.string().optional().nullable(),
//         limit: z.string().optional().nullable(),
//         searchText: z.string().optional(),
//         sortBy: z.string().optional(), // Add sortBy as optional
//       })
//       .partial(),
// })

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
      fromTime: payload.fromTime,
      toTime: payload.toTime,
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
    
}
