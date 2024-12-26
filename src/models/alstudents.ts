import { model, Schema } from "mongoose";
import { z } from "zod";
import { IAlStudents } from "../../types/models.types";


const alStudentSchema = new Schema<IAlStudents>(
    {
student: {
    studentId: {
       type: String,
       required: true,
    },
    studentEmail: {
        type: String,
        required: true,
    },
    studentPhone: {
        type: Number,
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
role: {
    type: String,
    required: true,
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
export const zodEvaluationSchema = z.object({
 
});
export default model<IAlStudents>("AlfurqanStudent", alStudentSchema);