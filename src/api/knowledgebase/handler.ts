import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { createKnowledgeBase } from "../../operations/knowledgeBase";
import { zodknowledgeBaseValidationSchema } from "../../models/knowledgebase";

const createInputValidation = z.object({
  payload: zodknowledgeBaseValidationSchema.pick({
    courseName: true,
    subjectTitle: true,
    uploadedFormat: true,
    uploadedFile: true,
    status: true,
    createdDate: true,
    createdBy: true,
    updatedBy: true,
    updatedDate: true,
  }),
});

export default {
  async createKnowledgeBase(req: Request, h: ResponseToolkit) {
    try {
      const { payload } = createInputValidation.parse({ payload: req.payload });

      let attachFileBuffer: Buffer;

if (typeof payload.uploadedFile === "string") {
  // Clean the base64 string (remove data URI prefix if present)
  const base64String = payload.uploadedFile.split(",")[1] || payload.uploadedFile;
  attachFileBuffer = Buffer.from(base64String, 'base64');
} else if (Buffer.isBuffer(payload.uploadedFile)) {
  attachFileBuffer = payload.uploadedFile;
} else {
  console.log("Invalid file format for attachFile");
  return h
    .response({ success: false, error: "attachFile must be a base64 string or Buffer" })
    .code(400);
}

      


      const knowledgebase = await createKnowledgeBase({
        courseName: payload.courseName,
        subjectTitle: payload.subjectTitle,
        uploadedFormat: payload.uploadedFormat,
        uploadedFile: attachFileBuffer, // now guaranteed to be Buffer or null
        status: payload.status ?? '',
        createdDate: payload.createdDate || new Date(),
        createdBy: payload.createdBy ?? '',
        updatedBy: payload.updatedBy ?? '',
        updatedDate: payload.updatedDate || new Date(),
      });

      if ("error" in knowledgebase) {
        return h.response({ error: knowledgebase.error }).code(400);
      }

      return h.response({ message: "KnowledgeBase created successfully", data: knowledgebase }).code(201);

    } catch (error) {
      console.error(error);
      return h.response({ error: "Something went wrong" }).code(400);
    }
  },
};
