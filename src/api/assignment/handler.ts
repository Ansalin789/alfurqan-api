import { Request, ResponseToolkit } from "@hapi/hapi";
import { z } from "zod";
import { assignmentValidationSchema } from "../../models/assignments";
import { createAssignment } from "../../operations/assignments";

// Update the validation schema to expect assignmentType as an object with type and name
const createAssignmentValidation = z.object({
  payload: assignmentValidationSchema
    .pick({
      assignmentName: true,
      assignedTeacher: true,
      assignmentType: true, // Make sure this is being picked correctly
      chooseType: true,
      trueorfalseType: true,
      question: true,
      hasOptions: true,
      options: true,
      audioFile: true,
      uploadFile: true,
      status: true,
      createdDate: true,
      createdBy: true,
      updatedDate: true,
      updatedBy: true,
      level: true,
      courses: true,
      assignedDate: true,
      dueDate: true,
    })
    .partial(), // Allow partial inputs
});

export default {
  async createAssignment(req: Request, h: ResponseToolkit) {
    // Log the incoming raw data
    console.log("Raw payload:", req.payload);

    try {
      // Parse and validate the payload
      const { payload } = createAssignmentValidation.parse({
        payload: req.payload,
      });

      // Log validated payload to ensure assignmentType is being passed
      console.log("Validated payload:", payload);

      // Ensure assignmentType is properly processed as an object with type and name
      const assignmentType = payload.assignmentType; // Fix the field name here
      const type = assignmentType?.type || "";
      const name = assignmentType?.name || "";

      // Check if assignmentType is missing or not valid
      if (!type || !name) {
        throw new Error("Assignment type is required. Please provide a valid type.");
      }

      // Create the assignment record with validated data
      const result = await createAssignment({
        assignmentName: payload.assignmentName || "",
        assignedTeacher: payload.assignedTeacher || "",
        assignmentType: { type, name }, // Ensure it is passed as an object
        chooseType: !!payload.chooseType, // Ensure boolean
        trueorfalseType: !!payload.trueorfalseType, // Ensure boolean
        question: payload.question || "",
        hasOptions: !!payload.hasOptions, // Ensure boolean
        options: {
          optionOne: payload.options?.optionOne || "",
          optionTwo: payload.options?.optionTwo || "",
          optionThree: payload.options?.optionThree || "",
          optionFour: payload.options?.optionFour || "",
        },
        audioFile: payload.audioFile || undefined,
        uploadFile: payload.uploadFile || undefined,
        status: payload.status || "", // Default status
        createdDate: payload.createdDate || new Date(),
        createdBy: payload.createdBy || "", // Default createdBy
        updatedDate: payload.updatedDate || new Date(),
        updatedBy: payload.updatedBy || "",
        level: payload.level || "",
        courses: payload.courses || "",
        assignedDate: payload.assignedDate || new Date(),
        dueDate: payload.dueDate || new Date(),
      });

      console.log("result>>>>>>>", result);

      return h.response(result).code(201); // Success response
    } catch (error) {
      console.error("Validation error:", error);
      return h.response({ error: "Invalid payload" }).code(400); // Bad request response
    }
  },
};