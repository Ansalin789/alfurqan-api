import { badRequest } from "@hapi/boom";
import { IAssignment, IAssignmentCreate } from "../../types/models.types";
import assignment from "../models/assignments";
import userModel from "../models/users";
import { getAllAssignmnetParams, GetAllRecordsParams } from "../shared/enum";

/**
 * Creates a new assignment record in the database.
 * @param {IAssignmentCreate} payload - The data required to create a new assignment record.
 * @returns {Promise<{ totalCount: number; assignments: IAssignmentCreate[] } | { error: any }>}
 */
export const createAssignment = async (
  payload: IAssignmentCreate
): Promise<{ totalCount: number; assignments: IAssignmentCreate[] } | { error: any }> => {
  try {
    // Validate assignment due date
    if (payload.dueDate && payload.dueDate === new Date()) {
      throw badRequest("Assignment due date cannot be today. Please select another date.");
    }

    // Log the incoming payload for debugging
    console.log("Incoming Payload:", payload);

   
    const assignedTeacher = await userModel.findOne({userName: payload.assignedTeacher, role : 'TEACHER'}).exec();
   
    console.log("assignedTeacher>>>>", assignedTeacher);


    // // Find the audio file by its ID or other relevant identifier
    // const audioFile = await assignment.findOne({
    //   audioFile: payload.audioFile,
    // });

    console.log("audioFile>>>>", payload.audioFile); // Logs the fetched audio file

    // Create a new assignment
    const newAssignment = new assignment({
      assignmentName: payload.assignmentName || "",
      assignedTeacher: assignedTeacher?.userName || "", // Save the teacher's userName in the assignment
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
      audioFile: payload.audioFile || "", // Save the audio file ID in the database
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
    return { error };
  }
};




export const getAllAssignment = async (query: { assignmentType: { type: string; name: string; }; status?: string | undefined; createdDate?: Date | undefined; createdBy?: string | undefined; assignmentName?: string | undefined; assignedTeacher?: string | undefined; chooseType?: boolean | undefined; trueorfalseType?: boolean | undefined; question?: string | undefined; hasOptions?: boolean | undefined; options?: { optionOne?: string | undefined; optionTwo?: string | undefined; optionThree?: string | undefined; optionFour?: string | undefined; } | undefined; updatedDate?: Date | undefined; updatedBy?: string | undefined; level?: string | undefined; courses?: string | undefined; assignedDate?: Date | undefined; dueDate?: Date | undefined; }): Promise<{ assignments: Partial<IAssignmentCreate>[]; totalCount: number }> => {
  try {
    // Fetch the assignments from the database
    const assignmentsCreate = await assignment.find().lean().exec();

    // You can either return Partial<IAssignment> directly if you're not worried about the missing properties
    const assignments: Partial<IAssignmentCreate>[] = assignmentsCreate;

    // Get the total count of assignments
    const totalCount = await assignment.countDocuments();

    return { assignments, totalCount };
  } catch (error) {
    console.error("Error fetching assignments:", error);
    throw new Error("Failed to fetch assignments.");
  }
};









