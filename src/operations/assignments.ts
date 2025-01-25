import { badRequest } from "@hapi/boom";
import { IAssignmentCreate } from "../../types/models.types";
import assignment from "../models/assignments";
import userModel from "../models/users";

/**
 * Creates a new assignment record in the database.
 *
 * @param {IAssignmentCreate} payload - The data required to create a new assignment record.
 * @returns {Promise<{ totalCount: number; assignments: IAssignmentCreate[] } | { error: any }>} 
 * A promise that resolves to the created assignment record, or an error object if the creation fails.
 */
export const createAssignment = async (
  payload: IAssignmentCreate
): Promise<{ totalCount: number; assignments: IAssignmentCreate[] } | { error: any }> => {
  try {
    // Validate assignment due date
    if (payload.dueDate && payload.dueDate.toDateString() === new Date().toDateString()) {
      throw badRequest("Assignment due date cannot be today. Please select another date.");
    }
 console.log("payload>>>>", payload.assignmentType)
    // Validate assignment type object
    if (!payload.assignmentType || !payload.assignmentType.type || !payload.assignmentType.name) {
      throw badRequest("Assignment type is required. Please provide a valid type.");
    }

    // Check if the assigned teacher exists
    const assignedTeacher = await userModel.findOne({
      userName: payload.assignedTeacher,
      role: "TEACHER",
    }).exec();
    // if (!assignedTeacher) {
    //   throw badRequest("Assigned teacher not found. Please assign a valid teacher.");
    // }

    // Create a new assignment
    const newAssignment = new assignment({
      assignmentName: payload.assignmentName || "",
      assignedTeacher: assignedTeacher?.userName || "",
      assignmentType: payload.assignmentType, // Use the entire object { type, name }
      chooseType: !!payload.chooseType,
      trueorfalseType: !!payload.trueorfalseType,
      question: payload.question || "",
      hasOptions: !!payload.hasOptions,
      options: {
        optionOne: payload.options?.optionOne || "",
        optionTwo: payload.options?.optionTwo || "",
        optionThree: payload.options?.optionThree || "",
        optionFour: payload.options?.optionFour || "",
      },
      audioFile: payload.audioFile || "",
      uploadFile: payload.uploadFile || "",
      status: payload.status || "Pending",
      createdDate: new Date(),
      createdBy: payload.createdBy || "System",
      updatedDate: new Date(),
      updatedBy: "",
      level: payload.level || "",
      courses: payload.courses || "",
      assignedDate: payload.assignedDate || new Date(),
      dueDate: payload.dueDate || new Date(),
    });

    // Save the new assignment to the database
    const assignmentRecord = await newAssignment.save();

    // Count total assignments in the database
    const totalCount = await assignment.countDocuments();

    return { totalCount, assignments: [assignmentRecord] };
  } catch (error) {
    return { error };
  }
};