import { Request, ResponseToolkit } from "@hapi/hapi";
import { z } from "zod";
import { createAssignment, getAllAssignment, getAssignmentsById, updateStudentAssignment } from "../../operations/assignments"; // Replace with your service logic
import * as Stream from "stream";
import { isNil } from "lodash";
import { notFound } from "@hapi/boom";


// Input Validations for student list
const getAssignmnentListInputValidation = z.object({
  query: z.object({
    studentId: z.string().optional(),
    assignmentName: z.string().optional(),
    assignedTeacher: z.string().optional(),
    assignmentType: z.object({
      type: z.string(), // Ensure type is required
      name: z.string(), // Ensure name is required
    }),
    chooseType: z.boolean().optional(),
    trueorfalseType: z.boolean().optional(),
    question: z.string().optional(),
    hasOptions: z.boolean().optional(),
    options: z.object({
      optionOne: z.string().optional(),
      optionTwo: z.string().optional(),
      optionThree: z.string().optional(),
      optionFour: z.string().optional(),
    }).optional(),
    status: z.string().optional(),
    createdDate: z.date().optional(),
    createdBy: z.string().optional(),
    updatedDate: z.date().optional(),
    updatedBy: z.string().optional(),
    level: z.string().optional(),
    courses: z.string().optional(),
    assignedDate: z.date().optional(),
    dueDate: z.date().optional(),
    answer:z.string().optional(),
    answerValidation: z.string().optional(),

  }),
});





// Helper function to convert a readable stream to a buffer
async function streamToBuffer(stream: Stream.Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
  });
}

// Helper function to safely parse JSON
function parseJSONSafe(input: any): any {
  if (typeof input === "string") {
    try {
      return JSON.parse(input);
    } catch (error) {
      console.error("Invalid JSON string:", input, error);
      return null;
    }
  }
  return input;
}

export default {

// Handler for creating assignments
  async createAssignment(req: Request, h: ResponseToolkit) {
    try {

      const rawPayload = req.payload as any;

      console.log("Received payload:", req.payload);

     // Safely parse options
     const options = parseJSONSafe(rawPayload.options);
     if (!options) {
       return h.response({ error: "Invalid options format" }).code(400);
     }


      // Parse and process payload fields
      const chooseType = rawPayload.chooseType === "true" || rawPayload.chooseType === true;
      const trueorfalseType =
        rawPayload.trueorfalseType === "true" || rawPayload.trueorfalseType === true;

      // Handle file buffers (if present)
      const audioFileBuffer = rawPayload.audioFile
        ? await streamToBuffer(rawPayload.audioFile)
        : null;
      const uploadFileBuffer = rawPayload.uploadFile
        ? await streamToBuffer(rawPayload.uploadFile)
        : null;


  
      // Create assignment logic
      const result = await createAssignment({
        studentId :rawPayload.studentId || "",
        assignmentName: rawPayload.assignmentName || "",
        assignedTeacher: rawPayload.assignedTeacher || "",
        assignmentType: rawPayload.assignmentType || {},
        chooseType, // Parsed boolean
        trueorfalseType, // Parsed boolean
        question: rawPayload.question || "",
        hasOptions: rawPayload.hasOptions,
        options, // Parsed options object
        audioFile: audioFileBuffer ? Buffer.from(audioFileBuffer) : undefined,
        uploadFile: uploadFileBuffer ? Buffer.from(uploadFileBuffer) : undefined,
        status: rawPayload.status || "",
        createdDate: rawPayload.createdDate || new Date(),
        createdBy: rawPayload.createdBy || "",
        updatedDate: rawPayload.updatedDate || new Date(),
        updatedBy: rawPayload.updatedBy || "",
        level: rawPayload.level || "",
        courses: rawPayload.courses || "",
        assignedDate: rawPayload.assignedDate || new Date(),
        dueDate: rawPayload.dueDate || new Date(),
        answer: rawPayload.answer || "",
        answerValidation: rawPayload.answerValidation || "" ,
      });
      
      console.log("correctAnswer>>>>>>", rawPayload.updatedDate)


      console.log("Created assignment:", result);

      return h.response(result).code(201); // Success response
    } catch (error) {
      console.error("Error creating assignment:", error);
      return h.response({ error: "Invalid payload" }).code(400);
    }
  },


  // Update an Assignment
async updateAssignment(req: Request, h: ResponseToolkit) {
  try {
    // Ensure the payload is valid
    const rawPayload = req.payload as any;
    if (!rawPayload || Object.keys(rawPayload).length === 0) {
      return h.response({ error: "Missing or empty payload" }).code(400);
    }
    console.log("Received payload:", rawPayload);

    // Parse and handle boolean fields
    const chooseType = rawPayload.chooseType === "true" || rawPayload.chooseType === true;
    const trueorfalseType = rawPayload.trueorfalseType === "true" || rawPayload.trueorfalseType === true;

    // Handle file buffers (if present)
    const audioFileBuffer = rawPayload.audioFile ? await streamToBuffer(rawPayload.audioFile) : null;
    const uploadFileBuffer = rawPayload.uploadFile ? await streamToBuffer(rawPayload.uploadFile) : null;

    // Ensure options are parsed correctly
    const options = parseJSONSafe(rawPayload.options);
    if (!options) {
      return h.response({ error: "Invalid options format" }).code(400);
    }
   
    return  updateStudentAssignment(String(req.params.assinmentId),{
      
      studentId :rawPayload.studentId || "",
      assignmentName: rawPayload.assignmentName || "",
      assignedTeacher: rawPayload.assignedTeacher || "",
      assignmentType: rawPayload.assignmentType || {},
      chooseType, // Parsed boolean
      trueorfalseType, // Parsed boolean
      question: rawPayload.question || "",
      hasOptions: rawPayload.hasOptions,
      options, // Parsed options object
      audioFile: audioFileBuffer ? Buffer.from(audioFileBuffer) : undefined,
      uploadFile: uploadFileBuffer ? Buffer.from(uploadFileBuffer) : undefined,
      status: rawPayload.status || "",
      createdDate: rawPayload.createdDate || new Date(),
      createdBy: rawPayload.createdBy || "",
      updatedDate: rawPayload.updatedDate || new Date(),
      updatedBy: rawPayload.updatedBy || "",
      level: rawPayload.level || "",
      courses: rawPayload.courses || "",
      assignedDate: rawPayload.assignedDate || new Date(),
      dueDate: rawPayload.dueDate || new Date(),
      answer: rawPayload.answer || "",
      answerValidation: rawPayload.answerValidation || "",
    });
  
    
  } 
  
  catch (error) {
  console.error("Error updating assignment:", error);


    console.log("Answer>>>", updateStudentAssignment);

    return h.response({ error: "Internal Server Error" }).code(500);
  }
},



  //get all assignment

  async getAllAssignment(req: Request, h: ResponseToolkit) {
    try {
      // Parse and validate the input
      const { query } = getAssignmnentListInputValidation.parse({
        query: {
          ...req.query,
          assignmentType: {
            type: req.query?.assignmentType?.type || "", // Default value for type
            name: req.query?.assignmentType?.name || "", // Default value for name
          },
          filterValues: req.query?.filterValues ? JSON.parse(req.query.filterValues) : {},
        },
      });
  
      // Call the function with the validated query object
      const { assignments, totalCount } = await getAllAssignment(query);
  
      // Return the assignments and the total count
      return h.response({ assignments, totalCount }).code(200);
  
    } catch (error) {
      console.error("Error getting assignments:", error);

      return h.response({ error: error || "Invalid query parameters" }).code(400);
    }
},


 async getAssignmentsById(req: Request, h: ResponseToolkit) {
    const result = await getAssignmentsById(String(req.params.assignmentsId));
  
    if (isNil(result)) {
      return notFound("Assignment not found");
    }
  
    return result;
  },

}