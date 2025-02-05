import { IFeedbackCreate } from "../../types/models.types";
import feedback from "../models/feedback";

export const createFeedback = async (
  payload: IFeedbackCreate
): Promise<{ totalCount: number; feedback: IFeedbackCreate } | { error: any }> => {
  try {
    const newFeedback = new feedback({
      student: payload.student!,
        teacher: payload.teacher || {},
        classDay: payload.classDay || [],
        preferedTeacher: payload.preferedTeacher!,
        course: payload.course!,
        
        // Students rating with default values for each field
        studentsRating: {
          classUnderstanding: payload.studentsRating?.classUnderstanding ?? 0,
          engagement: payload.studentsRating?.engagement ?? 0,
          homeworkCompletion: payload.studentsRating?.homeworkCompletion ?? 0,
        },
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

    const feedbackRecord = await newFeedback.save();
    const totalCount = await feedback.countDocuments();

    return { totalCount, feedback: feedbackRecord };
  } catch (error) {
    console.error("Error creating feedback:", error);
    return {error};
}
};

export const createTeacherFeedback = async (
  payload: IFeedbackCreate
): Promise<{ totalCount: number; feedback: IFeedbackCreate } | { error: any }> => {
  try {
    const newFeedback = new feedback({
        student: payload.student!,
        teacher: payload.teacher || {},
        classDay: payload.classDay || [],
        preferedTeacher: payload.preferedTeacher!,
        course: payload.course!,

        // Ensure ratings have default values if they are missing
        teacherRatings: {
          listeningAbility: payload.teacherRatings?.listeningAbility ?? 0,
          readingAbility: payload.teacherRatings?.readingAbility ?? 0,
          overallPerformance: payload.teacherRatings?.overallPerformance ?? 0,
        },
        
        // Add Student Level, with a default value if missing
        level: payload.level ?? 0,
      
        // Ensure startDate and endDate are set as Date objects
        startDate: payload.startDate ? new Date(payload.startDate) : new Date(),
        endDate: payload.endDate ? new Date(payload.endDate) : new Date(),
        
        // Handle times, setting empty arrays if they are missing
        startTime: payload.startTime || [],
        endTime: payload.endTime || [],
        
        // Feedback message with fallback if missing
        feedbackmessage: payload.feedbackmessage || "",
        
        // Dates for creation and update with current timestamp
        createdDate: new Date(),
        createdBy: payload.createdBy || "System",
        lastUpdatedDate: new Date(),
        lastUpdatedBy: payload.lastUpdatedBy || "System",

    });

    const feedbackRecord = await newFeedback.save();
    const totalCount = await feedback.countDocuments();

    return { totalCount, feedback: feedbackRecord };
  } catch (error) {
    console.error("Error creating feedback:", error);
    return {error};
  }
};