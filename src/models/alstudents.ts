import { model, Schema } from "mongoose";
import { z } from "zod";
import { IAlStudents } from "../../types/models.types";
import { appStatus, commonMessages } from "../config/messages";
import { string } from "joi";


const alStudentSchema = new Schema<IAlStudents>(
    {
student: {
    studentId: {
       type: String,
       required: false,
    },
    studentEmail: {
        type: String,
        required: true,
    },
    studentPhone: {
        type: Number,
        required: true,
    },
    course:{
        type: String,
        required: true,
    },
    courseId: {
        type: String,
        required: false,
    },
    package:
    {
        type: String,
        required: true,
    },
    city:{
        type: String,
        required: true,
    },
    country:
    {
        type: String,
        required: true,
    },
    gender:{
        type: String,
        required: true, 
    }
},
username: {
    type:String,
    required: true,
},
password:{
    type:String,
    required: true, 
},
sessionClassType:{
    type:String,
    required: false,
},
role: {
    type: String,
    required: true,
},
level: {
    type: string,
    required: false,
    default: 0, 
},
startDate:{
    type: Date,
    required: false,

},
endDate:{
    type: Date,
    required: false,
},
status: {
    type: String,
    required: true
},
createdDate: {
    type: Date,
    required: true,
},
createdBy: {
    type: String,
    required: false,
},
updatedDate: {
    type: Date,
    required: false,
},
updatedBy: {
    type: String,
    required: false,
}
 },
 {
    collection: "alfurqanstudent",
    timestamps: false,
}
);
export const zodAlStudentSchema = z.object({
    student: z.object({
      studentId: z.string().optional(),
      studentEmail: z.string(),
      studentPhone: z.number(),
      course: z.string(),
      package: z.string(),
      city: z.string(),
      country: z.string(),
      gender: z.string()
    }),
    sessionClassType:z.string().optional(),
    level:z.string().optional(),

    username: z.string().min(3),
    password: z.string().min(8),
    role: z.string(),
      status: z.enum([appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED]),
      createdDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: commonMessages.INVALID_DATE_FORMAT,
      }).transform((val) => new Date(val)).optional(),
      createdBy: z.string(),
      lastUpdatedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: commonMessages.INVALID_DATE_FORMAT,
      }).transform((val) => new Date(val)).optional(),
      lastUpdatedBy: z.string(),
});
export default model<IAlStudents>("AlfurqanStudent", alStudentSchema);