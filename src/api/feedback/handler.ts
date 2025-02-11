import { z } from "zod";
import { ResponseToolkit, Request } from "@hapi/hapi";
import { zodFeedbackSchema } from "../../models/feedback";
import { createFeedback, createTeacherFeedback } from "../../operations/feedback";

const createFeedbackValidation = z.object({
  payload: zodFeedbackSchema.pick({
    student: true,
    teacher: true,
    classDay: true,
    preferedTeacher: true,
    teacherRatings: true,
    course: true,
    level: true,
    startDate: true,
    endDate: true,
    studentsRating: true, // Keep this for createFeedback only
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

      // Ensure studentsRating is always set
      const result = await createFeedback({
        student: payload.student!,
        teacher: payload.teacher || {},
        classDay: payload.classDay || "",
        preferedTeacher: payload.preferedTeacher!,
        course: payload.course!,

        // Ensure studentsRating is set with default values if not provided
        studentsRating: {
          classUnderstanding: payload.studentsRating?.classUnderstanding ?? 0,
          engagement: payload.studentsRating?.engagement ?? 0,
          homeworkCompletion: payload.studentsRating?.homeworkCompletion ?? 0,
          
        },

        startDate: new Date(payload.startDate!),
        endDate: new Date(payload.endDate!),
        startTime: payload.startTime || "",
        endTime: payload.endTime || "",
        feedbackmessage: payload.feedbackmessage || "",
        createdDate: new Date(),
        createdBy: payload.createdBy || "System",
        lastUpdatedDate: new Date(),
        lastUpdatedBy: payload.lastUpdatedBy || "System",
        level: 0,
        teacherRatings: {
          listeningAbility: payload.teacherRatings?.listeningAbility|| 0,
          readingAbility: payload.teacherRatings?.readingAbility || 0,
          overallPerformance:payload.teacherRatings?.overallPerformance|| 0,
        }
      });

      return h.response({ message: "Feedback created successfully", data: result }).code(201);
    } catch (error) {
      console.error("Error creating feedback:", error);
      return h.response({ error: "Failed to create feedback" }).code(500);
    }
  },

  async createTeacherFeedback(req: Request, h: ResponseToolkit) {
    try {
      // Validate the incoming payload
      const { payload } = createFeedbackValidation.parse({ payload: req.payload });

      // Ensure necessary attributes, using defaults if they are missing
      const result = await createTeacherFeedback({
        student: payload.student!,
        teacher: payload.teacher || {},
        classDay: payload.classDay || '',
        preferedTeacher: payload.preferedTeacher!,
        course: payload.course!,

        // Ensure ratings have default values if they are missing
        teacherRatings: {
          listeningAbility: payload.teacherRatings?.listeningAbility ?? 0,
          readingAbility: payload.teacherRatings?.readingAbility ?? 0,
          overallPerformance: payload.teacherRatings?.overallPerformance ?? 0,
        },

        level: payload.level ?? 0,

        // Ensure startDate and endDate are set as Date objects
        startDate: payload.startDate ? new Date(payload.startDate) : new Date(),
        endDate: payload.endDate ? new Date(payload.endDate) : new Date(),

        // Handle times, setting empty arrays if they are missing
        startTime: payload.startTime || '',
        endTime: payload.endTime || '',

        // Feedback message with fallback if missing
        feedbackmessage: payload.feedbackmessage || "",

        // Dates for creation and update with current timestamp
        createdDate: new Date(),
        createdBy: payload.createdBy || "System",
        lastUpdatedDate: new Date(),
        lastUpdatedBy: payload.lastUpdatedBy || "System",
        studentsRating: {
          classUnderstanding: 0,
          engagement: 0,
          homeworkCompletion: 0
        }
      });

      return h.response({ message: "Feedback created successfully", data: result }).code(201);
    } catch (error) {
      console.error("Error creating feedback:", error);
      return h.response({ error: "Failed to create feedback" }).code(500);
    }
  }
};
