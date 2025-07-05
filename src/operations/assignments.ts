import { badRequest } from "@hapi/boom";
import {
  IallAssignment,
  IAssignment,
  IAssignmentCreate,
} from "../../types/models.types";
import assignment from "../models/assignments";
import userModel from "../models/users";
import alstudents from "../models/alstudents";
import { FlattenMaps, Types } from "mongoose";
import Stream from "stream";
import mongoose from "mongoose";
import assignments from "../models/assignments";

interface AssignmentQuery {
  assignmentId?: string;
  _id?: string;
}
/**
 * Creates a new assignment record in the database.
 * @param {IAssignmentCreate} payload - The data required to create a new assignment record.
 * @returns {Promise<{ totalCount: number; assignments: IAssignmentCreate[] } | { error: any }>}
 */

async function streamToBuffer(stream: Stream.Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
  });
}

// Type for options
type AssignmentOptions = {
  optionOne: string;
  optionTwo: string;
  optionThree: string;
  optionFour: string;
};

export const createAssignment = async (
  payload: Partial<IAssignment>[]
): Promise<
  { totalCount: number; assignments: IAssignment[] } | { error: any }
> => {
  try {
    console.log("🚀 createAssignment triggered");
    console.log("📥 Raw payload received:", payload);

    if (!payload || payload.length === 0) {
      console.error("❌ Payload is empty");
      return { error: "Payload is empty" };
    }

    const assignmentRecords: Partial<IAssignment>[] = [];
    const allowedTypes = [
      "quiz",
      "writing",
      "reading",
      "imageIdentification",
      "wordMatching",
    ];
    console.log("✅ Allowed types:", allowedTypes);

    for (const [index, item] of payload.entries()) {
      console.log(`\n🔄 Processing assignment index: ${index}`);
      console.log("📦 Full item:", item);

      if (!item.studentId) {
        console.warn("⚠️ Skipping record due to missing studentId");
        continue;
      }

      console.log("🔍 Finding student by ID:", item.studentId);
      const studentDetails = await alstudents.findById(item.studentId).exec();
      if (!studentDetails) {
        console.warn("⚠️ Invalid studentId:", item.studentId);
        continue;
      }

      const studentId = studentDetails._id.toString();
      const studentName = studentDetails.username || "";
      const sessionClassType = studentDetails.sessionClassType || "";
      console.log("✅ Student found:", {
        studentId,
        studentName,
        sessionClassType,
      });


       console.log("🔍 Finding student by ID:", item.studentId);


       


const assignedTeacher = item.assignedTeacher;
const assignedTeacherId = item.assignedTeacherId ;

console.log("👩‍🏫 Assigned Teacher:", {
  assignedTeacher,
  assignedTeacherId,
});;

      const assignmentType = item.assignmentType;
      console.log("🧩 assignmentType object:", assignmentType);
      console.log("🔍 assignmentType.type:", assignmentType?.type);

      if (!assignmentType || !allowedTypes.includes(assignmentType.type)) {
        console.warn(
          `⚠️ Invalid assignmentType at index ${index}:`,
          assignmentType
        );
        continue;
      }

      const parsedOptions: AssignmentOptions = {
        optionOne: item.options?.optionOne || "",
        optionTwo: item.options?.optionTwo || "",
        optionThree: item.options?.optionThree || "",
        optionFour: item.options?.optionFour || "",
      };
      console.log("📝 Parsed options:", parsedOptions);

  
      const newAssignment: Partial<IAssignment> = {
        studentId,
        studentName,
        sessionClassType,
        assignmentId:item .assignmentId,
        title:item.title || "",
        assignmentName: item.assignmentName || "",
        questionName: item.questionName || "",
        questionType: item.questionType || "",
        typeofQuestion: item.typeofQuestion || "",
        assignedTeacher,
        assignedTeacherId, // ✅ Now this is just a string
         assignmentType,
        chooseType: item.chooseType === true,
        trueorfalseType: item.trueorfalseType === true,
        question: item.question || "",
        hasOptions: item.hasOptions || false,
        options: parsedOptions,
        audioFile: item.audioFile,
        uploadFile: item.uploadFile,
        status: item.status,
        createdDate: new Date(),
        createdBy: item.createdBy || "System",
        updatedDate: new Date(),
        updatedBy: item.updatedBy || "",
        level: item.level || "",
        courses: item.courses || "",
        assignedDate: item.assignedDate || new Date(),
        dueDate: item.dueDate || new Date(),
        answer:"",
        answerValidation: item.answerValidation || "",
        assignmentStatus: item.assignmentStatus,
      };

      console.log("📌 New assignment record prepared:", newAssignment);
      assignmentRecords.push(newAssignment);
    }

    console.log(
      "🧾 Total valid assignments prepared:",
      assignmentRecords.length
    );
    if (assignmentRecords.length === 0) {
      console.error("❌ No valid assignments to insert");
      return { error: "No valid assignments to insert" };
    }

    console.log("📤 Inserting assignments into DB...");
    const insertedAssignments = await assignment.insertMany(assignmentRecords);
    console.log("✅ Assignments inserted:", insertedAssignments.length);

    const totalCount = await assignment.countDocuments();
    console.log("📊 Total assignment count in DB:", totalCount);

    return { totalCount, assignments: insertedAssignments as IAssignment[] };
  } catch (error) {
    console.error("❌ Error in createAssignment:", error);
    return { error };
  }
};

//Update Assignments

// export const updateStudentAssignment = async (
//   id: string,
//   payload: IAssignmentCreate | null
// ): Promise<
//   { totalCount: number; assignments: IAssignment[] } | { error: any }
// > => {
//   try {
//     console.log("Received payload:", payload);
//     console.log("AssignmentID>>>>", id);

//     // Validate Payload
//     if (!payload || !payload.studentId) {
//       console.error("Error: Received null or invalid payload");
//       return {
//         error:
//           "Invalid request: Payload is missing or studentId is not provided",
//       };
//     }

//     // Answer Validation Check
//     const { answer, answerValidation } = payload;
//     const isCorrect = answer === answerValidation;
//     console.log("Answer validation result:", isCorrect);

//     // Fetch student details
//     const studentDetails = await alstudents
//       .findOne({ _id: payload.studentId })
//       .exec();
//     console.log("studentDetails>>>>", studentDetails);

//     // Fetch the existing assignment
//     const existingAssignment = await assignment.findOne({ _id: id }).exec();
//     if (!existingAssignment) {
//       console.error("Error: Assignment not found with ID:", id);
//       return { error: "Assignment not found" };
//     }
//     console.log("Existing Assignment:", existingAssignment);

//     // Ensure `assignedTeacher` is properly extracted
//     const assignedTeacher = payload.assignedTeacher || "Unknown Teacher";

//     // Ensure `audioFile` and `uploadFile` are properly formatted as Buffers
//     const audioFile =
//       typeof payload.audioFile === "string"
//         ? Buffer.from(payload.audioFile, "base64")
//         : payload.audioFile;
//     const uploadFile =
//       typeof payload.uploadFile === "string"
//         ? Buffer.from(payload.uploadFile, "base64")
//         : payload.uploadFile;

//     // Updating the Assignment
//     const updatedAssignment = await assignment
//       .findByIdAndUpdate(
//         String(id),
//         {
//           studentId: studentDetails?._id || "",
//           studentName: studentDetails?.username || "",
//           sessionClassType: studentDetails?.sessionClassType || "",
//           assignmentName: payload.assignmentName || "",
//           assignedTeacher,
//           assignmentType: payload.assignmentType,
//           chooseType: payload.chooseType,
//           trueorfalseType: payload.trueorfalseType,
//           question: payload.question || "",
//           hasOptions: payload.hasOptions,
//           options: {
//             optionOne: payload.options?.optionOne,
//             optionTwo: payload.options?.optionTwo,
//             optionThree: payload.options?.optionThree,
//             optionFour: payload.options?.optionFour,
//           },
//           audioFile,
//           uploadFile,
//           status: payload.status || "Pending",
//           createdDate: existingAssignment.createdDate,
//           createdBy: existingAssignment.createdBy,
//           updatedDate: new Date(),
//           updatedBy: payload.updatedBy || "",
//           level: payload.level || "",
//           courses: payload.courses || "",
//           assignedDate: payload.assignedDate || new Date(),
//           dueDate: payload.dueDate || new Date(),
//           answer: payload.answer || "",
//           answerValidation: payload.answerValidation || "",
//         },
//         { new: true }
//       )
//       .exec();

//     console.log("New Updated Record>>>>", answer);

//     // Error Handling for Update Failure
//     if (!updatedAssignment) {
//       console.error("Error: Failed to update assignment for _id:", id);
//       return { error: "Failed to update assignment" };
//     }

//     console.log("Updated assignment:", updatedAssignment);
//     return { totalCount: 1, assignments: [updatedAssignment] };
//   } catch (error) {
//     console.log("the error>>>>>>", error);

//     console.error("Error updating assignment:", error);
//     return { error: "Internal Server Error" };
//   }
// };

// //Get All Assignment

// export const getAllAssignment = async (query: {
//   assignmentType: { type: string; name: string };
//   status?: string | undefined;
//   createdDate?: Date | undefined;
//   createdBy?: string | undefined;
//   assignmentName?: string | undefined;
//   assignedTeacher?: string | undefined;
//   chooseType?: boolean | undefined;
//   trueorfalseType?: boolean | undefined;
//   question?: string | undefined;
//   hasOptions?: boolean | undefined;
//   options?:
//     | {
//         optionOne?: string | undefined;
//         optionTwo?: string | undefined;
//         optionThree?: string | undefined;
//         optionFour?: string | undefined;
//       }
//     | undefined;
//   updatedDate?: Date | undefined;
//   updatedBy?: string | undefined;
//   level?: string | undefined;
//   courses?: string | undefined;
//   assignedDate?: Date | undefined;
//   dueDate?: Date | undefined;
// }): Promise<{
//   assignments: Partial<IAssignmentCreate>[];
//   totalCount: number;
// }> => {
//   try {
//     // Fetch the assignments from the database
//     const assignmentsCreate = await assignment.find().lean().exec();

//     // You can either return Partial<IAssignment> directly if you're not worried about the missing properties
//     const assignments: Partial<IallAssignment>[] = assignmentsCreate;

//     // Get the total count of assignments
//     const totalCount = await assignment.countDocuments();

//     return { assignments, totalCount };
//   } catch (error) {
//     console.error("Error fetching assignments:", error);
//     throw new Error("Failed to fetch assignments.");
//   }
// };




export const getAssignments = async ({
  assignmentId,
  _id
}: AssignmentQuery): Promise<IAssignment[]> => {
  if (!assignmentId && !_id) {
    throw new Error('Must provide either assignmentId or _id');
  }

  const query: any = {};

  if (_id) {
    if (!Types.ObjectId.isValid(_id)) {
      throw new Error('Invalid _id format');
    }
    query._id = new Types.ObjectId(_id);
  }

  if (assignmentId) {
    // Exact match with string trimming
    query.assignmentId = assignmentId.trim();
  }

  console.log('Final query:', JSON.stringify(query)); // Debug log

  return await assignments
    .find(query)
    .collation({ locale: 'en', strength: 2 }) // Case-insensitive
    .sort({ createdDate: -1 })
    .lean<IAssignment[]>()
    .exec();
};


export const getAssignmentForStudentId = async ({
  studentId
}: {
  studentId: string;
}): Promise<IAssignment[]> => {
  const query = { studentId: studentId.trim() };

  return await assignments
    .find(query)
    .collation({ locale: 'en', strength: 2 })
    .sort({ createdDate: -1 })
    .lean<IAssignment[]>()
    .exec();
};




