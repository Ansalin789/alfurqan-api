import { badRequest } from "@hapi/boom";
import { IallAssignment, IAssignment, IAssignmentCreate } from "../../types/models.types";
import assignment from "../models/assignments";
import userModel from "../models/users";
import alstudents from "../models/alstudents";

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

    const studentDetails = await alstudents.findOne({_id: payload.studentId}).exec();
   
    console.log("studentDetails>>>>", studentDetails);
   

    const assignedTeacher = await userModel.findOne({userName: payload.assignedTeacher, role : 'TEACHER'}).exec();
   
    console.log("assignedTeacher>>>>", assignedTeacher);


    // // Find the audio file by its ID or other relevant identifier
    // const audioFile = await assignment.findOne({
    //   audioFile: payload.audioFile,
    // });

    console.log("optionAnswer>>>>", payload.options); // Logs the fetched audio file

    // Create a new assignment
    const newAssignment = new assignment({

      studentId:studentDetails?._id || "",
      assignmentName: payload.assignmentName || "",
      assignedTeacher: assignedTeacher?.userName || "", // Save the teacher's userName in the assignment
      assignmentType: payload.assignmentType, // Use the entire object { type, name }
      chooseType: payload.chooseType,
      trueorfalseType: payload.trueorfalseType,
      question: payload.question || "",
      hasOptions: payload.hasOptions,
      options: payload.options, // Use the entire object { type, name }
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
      answer:payload.answer || "",
      answerValidation: payload.answerValidation || "",
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


//Update Assignments

export const updateStudentAssignment = async (
  id: string,
  payload: IAssignmentCreate | null
): Promise<{ totalCount: number; assignments: IAssignmentCreate[] } | { error: any }> => {
  try {
    console.log("Received payload:", payload);
    console.log("AssignmentID>>>>", id);

    // Validate Payload
    if (!payload || !payload.studentId) {
      console.error("Error: Received null or invalid payload");
      return { error: "Invalid request: Payload is missing or studentId is not provided" };
    }

    // Answer Validation Check
    const { answer, answerValidation } = payload;
    const isCorrect = answer === answerValidation;
    console.log("Answer validation result:", isCorrect);

    // Fetch student details
    const studentDetails = await alstudents.findOne({ _id: payload.studentId }).exec();
    console.log("studentDetails>>>>", studentDetails);

    // Fetch the existing assignment
    const existingAssignment = await assignment.findOne({ _id: id }).exec();
    if (!existingAssignment) {
      console.error("Error: Assignment not found with ID:", id);
      return { error: "Assignment not found" };
    }
    console.log("Existing Assignment:", existingAssignment);

    // Ensure `assignedTeacher` is properly extracted
    const assignedTeacher = payload.assignedTeacher || "Unknown Teacher";

    // Ensure `audioFile` and `uploadFile` are properly formatted as Buffers
    const audioFile = typeof payload.audioFile === "string" ? Buffer.from(payload.audioFile, "base64") : payload.audioFile;
    const uploadFile = typeof payload.uploadFile === "string" ? Buffer.from(payload.uploadFile, "base64") : payload.uploadFile;

    // Updating the Assignment
    const updatedAssignment = await assignment.findByIdAndUpdate(String(id),
      {
        studentId: studentDetails?._id || "",
        assignmentName: payload.assignmentName || "",
        assignedTeacher,
        assignmentType: payload.assignmentType,
        chooseType: payload.chooseType,
        trueorfalseType: payload.trueorfalseType,
        question: payload.question || "",
        hasOptions: payload.hasOptions,
        options: payload.options,
        audioFile,
        uploadFile,
        status: payload.status || "Pending",
        createdDate: existingAssignment.createdDate,
        createdBy: existingAssignment.createdBy,
        updatedDate: new Date(),
        updatedBy: payload.updatedBy || "",
        level: payload.level || "",
        courses: payload.courses || "",
        assignedDate: payload.assignedDate || new Date(),
        dueDate: payload.dueDate || new Date(),
        answer: payload.answer || "",  
        answerValidation: payload.answerValidation || "",
      },
      { new: true } 
    ).exec();
    

    console.log("New Updated Record>>>>", answer);

    // Error Handling for Update Failure
    if (!updatedAssignment) {
      console.error("Error: Failed to update assignment for _id:", id);
      return { error: "Failed to update assignment" };
    }

    console.log("Updated assignment:", updatedAssignment);
    return { totalCount: 1, assignments: [updatedAssignment] };
  } catch (error) {
    console.log("the error>>>>>>", error)
    
    console.error("Error updating assignment:", error);
    return { error: "Internal Server Error" };
  }
};







//Get All Assignment

export const getAllAssignment = async (query: { assignmentType: { type: string; name: string; }; status?: string | undefined; createdDate?: Date | undefined; createdBy?: string | undefined; assignmentName?: string | undefined; assignedTeacher?: string | undefined; chooseType?: boolean | undefined; trueorfalseType?: boolean | undefined; question?: string | undefined; hasOptions?: boolean | undefined; options?: { optionOne?: string | undefined; optionTwo?: string | undefined; optionThree?: string | undefined; optionFour?: string | undefined; } | undefined; updatedDate?: Date | undefined; updatedBy?: string | undefined; level?: string | undefined; courses?: string | undefined; assignedDate?: Date | undefined; dueDate?: Date | undefined; }): Promise<{ assignments: Partial<IAssignmentCreate>[]; totalCount: number }> => {
  try {
    // Fetch the assignments from the database
    const assignmentsCreate = await assignment.find().lean().exec();

    // You can either return Partial<IAssignment> directly if you're not worried about the missing properties
    const assignments: Partial<IallAssignment>[] = assignmentsCreate;

    // Get the total count of assignments
    const totalCount = await assignment.countDocuments();

    return { assignments, totalCount };
  } catch (error) {
    console.error("Error fetching assignments:", error);
    throw new Error("Failed to fetch assignments.");
  }
};
