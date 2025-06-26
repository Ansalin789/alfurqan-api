import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import teachermeeting, {zodTeacherMeetingSchema} from "../../models/teachermeeting";


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
        meetingId : 
    })
})