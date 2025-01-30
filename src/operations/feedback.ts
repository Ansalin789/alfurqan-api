import { IFeedbackCreate } from "../../types/models.types";
import feedback from "../models/feedback";

export const createFeedback = async (
  payload: IFeedbackCreate
): Promise<{ totalCount: number; feedback: IFeedbackCreate } | { error: any }> => {
  try {
    const newFeedback = new feedback({
      student: payload.student,
      teacher: payload.teacher || {},
      classDay: payload.classDay || [],
      preferedTeacher: payload.preferedTeacher,
      course: payload.course,
      ratings: payload.ratings,
      startDate: payload.startDate,
      endDate: payload.endDate,
      startTime: payload.startTime || [],
      endTime: payload.endTime || [],
      feedbackmessage: payload.feedbackmessage || "",
      createdDate: payload.createdDate || new Date(),
      createdBy: payload.createdBy,
      lastUpdatedDate: payload.lastUpdatedDate || new Date(),
      lastUpdatedBy: payload.lastUpdatedBy,
    });

    const feedbackRecord = await newFeedback.save();
    const totalCount = await feedback.countDocuments();

    return { totalCount, feedback: feedbackRecord };
  } catch (error) {
    console.error("Error creating feedback:", error);
    return { error };
  }
};
