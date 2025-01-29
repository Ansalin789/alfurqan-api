import { z } from "zod";
import { ResponseToolkit, Request } from "@hapi/hapi";
import { zodFeedbackSchema } from "../../models/feedback";
import { createFeedback } from "../../operations/feedback";

const createFeedbackValidation = z.object({
  payload: zodFeedbackSchema.pick({
    student: true,
    teacher: true,
    classDay: true,
    preferedTeacher: true,
    ratings: true,
    course: true,
    startDate: true,
    endDate: true,
    startTime: true,
    endTime: true,
    feedbackmessage: true,
    createdBy: true,
    lastUpdatedBy: true,
  }).partial(),
});

export default {
  async createFeedback(req: Request, h: ResponseToolkit) {
    try {
      const { payload } = createFeedbackValidation.parse({ payload: req.payload });

      const result = await createFeedback({
        student: payload.student!,
        teacher: payload.teacher || {},
        classDay: payload.classDay || [],
        preferedTeacher: payload.preferedTeacher!,
        course: payload.course!,
        ratings: payload.ratings ?? 0,
        startDate: new Date(payload.startDate!),
        endDate: new Date(payload.endDate!),
        startTime: payload.startTime || [],
        endTime: payload.endTime || [],
        feedbackmessage: payload.feedbackmessage || "",
        createdDate: new Date(),
        createdBy: payload.createdBy || "System",
        lastUpdatedDate: new Date(),
        lastUpdatedBy: payload.lastUpdatedBy || "System",
      });

      return h.response({ message: "Feedback created successfully", data: result }).code(201);
    } catch (error) {
      console.error("Error creating feedback:", error);
      return h.response({ error: "Failed to create feedback" }).code(500);
    }
  },
};
