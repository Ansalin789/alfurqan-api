import mongoose, { Schema } from "mongoose";
import CustomEnumerator from "../shared/enum";
import { ICourse } from "../../types/models.types";
import { z } from "zod";
import { appStatus } from "../config/messages";

const courseSchema = new Schema<ICourse>({
    course: {
      courseId: { type: String, required: false },
      courseTitle: { type: String, required: true },
      courseDuration: { type: String, required: true },
      courseDescription: { type: String, required: true },
      courseLevel: { type: String, required: true },
    },
    courseName: { type: String, required: true },
    level: [
      {
        levelId: {
          type: String, // You can also use mongoose.Types.ObjectId if auto-generated
          required: true,
        },
        contentLevel: { type: String, required: true },
        descriptions: { type: Buffer, required: true },
        duration: { type: String, required: true },
      }
    ],
    status: {
      type: String,
      enum: CustomEnumerator.Status,
      default: 'Active',
    },
    createdDate: { type: Date, default: Date.now },
    createdBy: { type: String },
    lastUpdatedDate: { type: Date },
    lastUpdatedBy: { type: String },
  }, 
  {
    collection: "courses",
    timestamps: false,
  });
  


  export const zodCourseSchema = z.object({
    course: z.object({
      courseId: z.string().optional(),
      courseTitle: z.string(),
      courseDuration: z.string(),
      courseDescription: z.string(),
      courseLevel: z.string(),
    }),
    courseName: z.string(),
    level: z.array(  // Make sure `level` is defined as an array
      z.object({
        levelId: z.string(),
        contentLevel: z.string(),
        descriptions: z.preprocess(
          (val) => {
            if (typeof val === 'string') return Buffer.from(val);  // Convert string to Buffer
            return val;
          },
          z.custom<Buffer>((val) => val instanceof Buffer, {
            message: 'Expected a Buffer',
          })
        ),
        duration: z.string(),
      })
    ),  // `level` should be an array of objects
    status: z.string().default('Active'),
    createdDate: z.string(),
    createdBy: z.string(),
    lastUpdatedDate: z.string(),
    lastUpdatedBy: z.string(),
  });
  



export default mongoose.model<ICourse>('Course', courseSchema);