import mongoose, { Schema } from "mongoose";
import CustomEnumerator from "../shared/enum";
import { ICourse } from "../../types/models.types";

const courseSchema = new Schema<ICourse>({
    courseName: {
        type: String,
        required: true,
    },
    status:{
        type: String,
        enum: CustomEnumerator.Status,
        default: 'Active',

    },
    createdDate: {
        type: Date,
        default: Date.now,
    },      
    createdBy: {
        type: String,
    },
    lastUpdatedDate: {
        type: Date,
    },                      
    lastUpdatedBy: {
        type: String,
    },
},
{
    collection: "courses",
    timestamps: false,
}
);

export default mongoose.model<ICourse>('Course', courseSchema);