import { z } from "zod";
import { model, Schema } from "mongoose";
import { IKnowledgeBase } from "../../types/models.types";
import { addKnowledgeBaseMessages, uploadedFormat } from "../config/messages";



const knowledgeBaseSchema = new Schema<IKnowledgeBase>(
    {
      courseName:{
        type: String,
        required: true,
      },
      subjectTitle: {
        type: String,
        required: true,
      },
      uploadedFormat: {
        type: String,
        required: true,
      },
      uploadedFile: {
        type: Buffer,
        required: true,
      },
      status: {
        type: String,
        required: false,
        trim: true,
      },
      createdDate: {
        type: Date,
        required: false,
        
      },
      createdBy: {
        type: String,
        required: false,
        trim: true,
      },
      updatedDate: {
        type: Date,
        required: false,
      },
      updatedBy: {
        type: String,
        required: false,
        trim: true,
      },
    },
    {
      timestamps: false,
    }
  );
  
 

  export const zodknowledgeBaseValidationSchema = z.object({
    courseName: z.string(), 
    subjectTitle: z.string(),
    uploadedFormat: z.enum([uploadedFormat.PDF, uploadedFormat.VIDEO,]),
    uploadedFile: z.union([
      z.instanceof(Buffer),
      z.string().refine((val) => {
        // Remove data URI prefix if it exists
        const cleanVal = val.split(",")[1] || val;
        const base64Regex = /^[A-Za-z0-9+/=]+$/;
        return base64Regex.test(cleanVal);
      }, {
        message: "uploadedFile must be a valid base64 string or Buffer",
      })
    ]),
    
    status: z.string(),
    createdDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: addKnowledgeBaseMessages.INVALID_DATE_FORMAT,
    }).transform((val) => new Date(val)),
    createdBy: z.string(),
    updatedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: addKnowledgeBaseMessages.INVALID_DATE_FORMAT,
    }).transform((val) => new Date(val)),
    updatedBy: z.string(),
    
  });
  
export default model<IKnowledgeBase>("KnowledgeBase", knowledgeBaseSchema);
