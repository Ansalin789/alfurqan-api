import { badRequest } from "@hapi/boom";
import { IallAssignment, IAssignment, IAssignmentCreate } from "../../types/models.types";
import assignment from "../models/assignments";
import userModel from "../models/users";
import alstudents from "../models/alstudents";
import { Types } from "mongoose";
import student from "../models/student";
/**
 * Creates a new assignment record in the database.
 * @param {IAssignmentCreate} payload - The data required to create a new assignment record.
 * @returns {Promise<{ totalCount: number; assignments: IAssignmentCreate[] } | { error: any }>}
 */
export const createAssignment = async (
  payload: IAssignmentCreate
): Promise<{ totalCount: number; assignments: IAssignment[] } | { error: any }> => {
  try {
    // ✅ Log what you received
    console.log("➡️ Received Payload.student:", payload.studentId);
    console.log("Received options:", payload.options);

let studentDetails;
let studentName = "";
let studentId = "";
let sessionClassType = "";

    console.log("sessionClassType to be saved:", sessionClassType);

if (payload.studentId) {
  console.log("📌 Fetching student by _id:", payload.studentId);
  studentDetails = await alstudents.findById(payload.studentId).exec();

  if (studentDetails) {
    studentName = studentDetails.username;
    studentId = studentDetails._id.toString();
    sessionClassType = studentDetails.sessionClassType;

    // ✅ Now log after assigning
    console.log("✅ Found student sessionClassType:", sessionClassType);
  } else {
    console.warn("⚠️ Student not found for the provided _id");
  }
}


    let assignedTeacher;
    let assignedTeacherId = "";

    if (payload.assignedTeacher) {
      console.log("📌 Fetching teacher by username:", payload.assignedTeacher);

      assignedTeacher = await userModel.findOne({
        userName: payload.assignedTeacher,
        role: { $in: ["TEACHER"] }, // supports array role
      }).exec();

      if (assignedTeacher) {
        assignedTeacherId = assignedTeacher.userId || ""; // ✅ use custom userId instead of _id
      }

      console.log("✅ assignedTeacher from DB:", assignedTeacher);
    }
    console.log("sessionClassType to be saved in new", sessionClassType);

    const newAssignment = new assignment({
       studentId, 
       studentName,
  sessionClassType: sessionClassType || "", // 👈 use this!      
  assignmentName: payload.assignmentName || "",
      assignedTeacher: assignedTeacher?.userName || "",
      assignedTeacherId: assignedTeacher?.userId || "",
      assignmentType: payload.assignmentType || {},
      chooseType: payload.chooseType || false,
      trueorfalseType: payload.trueorfalseType || false,
      question: payload.question || "",
      hasOptions: payload.hasOptions || false,
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
      answer: payload.answer || "",
      answerValidation: payload.answerValidation || "",
      assignmentStatus: payload.assignmentStatus || "Not Assigned",
    });


    console.log("Received options:", payload.options);
    console.log("🆕 Prepared newAssignment object:", newAssignment);
    console.log("sessionClassType to be saved sesion:", sessionClassType);

    const assignmentRecord = await newAssignment.save();
    const totalCount = await assignment.countDocuments();

    console.log("✅ Assignment successfully created:", assignmentRecord);

    return { totalCount, assignments: [assignmentRecord] };
  } catch (error) {
    console.error("❌ Error in createAssignment:", error);
    return { error };
  }
};




//Update Assignments

export const updateStudentAssignment = async (
  id: string,
  payload: IAssignmentCreate | null
): Promise<{ totalCount: number; assignments: IAssignment[] } | { error: any }> => {
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
    studentName: studentDetails?.username|| "",
    sessionClassType:studentDetails?.sessionClassType || "",
        assignmentName: payload.assignmentName || "",
        assignedTeacher,
        assignmentType: payload.assignmentType,
        chooseType: payload.chooseType,
        trueorfalseType: payload.trueorfalseType,
        question: payload.question || "",
        hasOptions: payload.hasOptions,
        options:{
          optionOne: payload.options?.optionOne,
          optionTwo: payload.options?.optionTwo,
          optionThree: payload.options?.optionThree,
          optionFour: payload.options?.optionFour,
        } ,
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



  export const getAssignmentsById = async (
    id: string
  ): Promise<IAssignment | null> => {
    return assignment.findOne({
      _id: new Types.ObjectId(id),
    }).lean();
  };