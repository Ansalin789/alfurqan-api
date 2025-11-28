import { Request, ResponseToolkit } from "@hapi/hapi";
import { IAdminAssignment, IAdminAssignmentCreate } from "../../../types/models.types";
import { assignemntMessages } from "../../config/messages";
import { zodAdminAssignmentSchema } from "../../models/adminassignment";
import { getAdminAssignmentsByCourseAndLevel, getAdminAssignmentsByCourseNameAndLevelName, saveAdminAssignment } from "../../operations/adminassignment";


function base64ToBuffer(base64String: string): Buffer {
  if (!base64String.includes(',')) {
    throw new Error("Invalid base64 string format");
  }
  const base64 = base64String.split(',')[1];
  return Buffer.from(base64, 'base64');
}

export default {

  async createAssignment(req: Request, h: ResponseToolkit) {
    try {
      const payload = req.payload as IAdminAssignmentCreate;
      const createdAssignments = [];
      const generatedAssignmentId = `${payload.courseName.replaceAll(/\s+/g, "_").toUpperCase()}_${payload.levelName.replaceAll(/\s+/g, "_").toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`;
      for (const q of payload.questions) {
        const baseData: Partial<IAdminAssignment> = {
          levelId: payload.levelId,
          levelName: payload.levelName,
          courseId: payload.courseId,
          courseName: payload.courseName,
          assignmentId: generatedAssignmentId,
          assignmentName: payload.assignmentName,
          assignmentType: q.assignmentType,
          questionName: q.questionName,
          chooseType: false,
          trueorfalseType: false,
          options: Array.isArray(q.question.options) ? q.question.options : [],
          answerValidation: Array.isArray(q.question.correctAnswer)
            ? q.question.correctAnswer.join(", ")
            : q.question.correctAnswer,
          createdDate: new Date(),
          createdBy: "admin",
          updatedDate: new Date(),
          updatedBy: "admin",
        };

        switch (q.question.contentType) {
          case "text":
            baseData.question = Array.isArray(q.question.question)
              ? q.question.question.join("\n")
              : q.question.question as string;
            break;

          case "audio":
            baseData.audioFile = base64ToBuffer(q.question.question as string);
            break;

          case "image":
            baseData.uploadFile = base64ToBuffer(q.question.question as string);
            break;
        }
        // 📌 Answer type handling
        switch (q.question.answerType) {
          case "choose":
            baseData.chooseType = true;
            break;

          case "trueorfalse":
            baseData.trueorfalseType = true;
            break;
        }

        // ✅ Validate with Zod
        const validatedData = zodAdminAssignmentSchema.parse(baseData);
        const saved = await saveAdminAssignment(validatedData);
        createdAssignments.push(saved);
      }

      return h
        .response({
          message: assignemntMessages.created,
          data: createdAssignments,
        })
        .code(201);

    } catch (error) {
      return h
        .response({
          error: "Assignment creation failed",
          details: error,
        })
        .code(400);
    }
  },


  async getAdminAssignmentsByCourseAndLevel(req: Request, h: ResponseToolkit) {
    try {
      const { courseId, levelId } = req.query as { courseId: string; levelId: string };

      if (!courseId || !levelId) {
        return h
          .response({ error: "Missing courseName or levelName in query params" })
          .code(400);
      }

      const assignments = await getAdminAssignmentsByCourseAndLevel(courseId, levelId);

      return h
        .response({
          message: assignemntMessages.FETCH_SUCCESS || "Assignments retrieved successfully",
          data: assignments,
        })
        .code(200);

    } catch (error) {
      return h.response({ error: "Failed to retrieve assignments", details: error }).code(400);
    }
  },


  async getAdminAssignmentsByCourseNameAndLevelName(req: Request, h: ResponseToolkit) {
    try {
      const { courseName, levelName } = req.query as { courseName: string; levelName: string };

      if (!courseName || !levelName) {
        return h
          .response({ error: "Missing courseName or levelName in query params" })
          .code(400);
      }

      const assignments = await getAdminAssignmentsByCourseNameAndLevelName(courseName, levelName);

      return h
        .response({
          message: assignemntMessages.FETCH_SUCCESS || "Assignments retrieved successfully",
          data: assignments,
        })
        .code(200);

    } catch (error) {
      return h.response({ error: "Failed to retrieve assignments", details: error }).code(400);
    }
  }
};


