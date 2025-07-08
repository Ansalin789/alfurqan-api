import {
  IAssignment,
  IAssignmentCreate,
} from "../../types/models.types";
import assignment from "../models/assignments";
import alstudents from "../models/alstudents";
import { Types } from "mongoose";
import Stream from "stream";
import assignments from "../models/assignments";

interface AssignmentQuery {
  assignmentId?: string;
  _id?: string;
}

interface IAssignmentUpdatePayload {
  _id: string;
  answer: string;
  answerValidation: string;
  updatedBy?: string;
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
      "image identification",
      "word match",
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
         score: 0,
        rating: "",
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
  const trimmedId = studentId.trim();

  return await assignments.aggregate([
    {
      $match: {
        studentId: trimmedId
      }
    },
    {
      $sort: {
        createdDate: -1 // latest assignment first
      }
    },
    {
      $group: {
        _id: "$assignmentId",
        doc: { $first: "$$ROOT" }
      }
    },
    {
      $replaceWith: "$doc"
    },
  
  ]).exec();
};


export const getStudentCardCount = async ({
  studentId
}: {
  studentId: string;
}): Promise<{
  totalAssigned: number;
  totalCompleted: number;
  totalPending: number;
}> => {
  const trimmedId = studentId.trim();

  const result = await assignments.aggregate([
    {
      $match: {
        studentId: trimmedId
      }
    },
    {
      $group: {
        _id: "$assignmentStatus", 
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        assignmentStatus: "$_id", 
        count: 1
      }
    }
  ]).exec();

  const response = {
    totalAssigned: 0,
    totalCompleted: 0,
    totalPending: 0
  };

  for (const item of result) {
    if (item.assignmentStatus === "Assigned") {
      response.totalAssigned = item.count;
    } else if (item.assignmentStatus === "Completed") {
      response.totalCompleted = item.count;
    } else if (item.assignmentStatus === "InProgress") {
      response.totalPending = item.count;
    }
  }

  return response;
};




//getByObjectId


export const getAssignmentByObjectId = async (
  id: string
): Promise<IAssignment | null> => {
  return assignment.findOne({
    _id: new Types.ObjectId(id),
  }).lean();
};

// Update Assignments

export const updateAssignmentsAnswer = async (
  assignmentId: string,
  payloads: {
    _id: string;
    answer: string;
    updatedBy: string;
  }[]
): Promise<{
  updated: { _id: string; isCorrect: boolean; status: string }[];
  failed: { _id: string; reason: string }[];
}> => {
  const updatedResults: { _id: string; isCorrect: boolean; status: string }[] = [];
  const failedResults: { _id: string; reason: string }[] = [];

  for (const item of payloads) {
    const { _id, answer, updatedBy } = item;

    try {
      // ✅ Fetch the assignment by _id AND assignmentId
      const assignmentDoc = await assignment.findOne({ _id, assignmentId });

      if (!assignmentDoc) {
        failedResults.push({ _id, reason: "Assignment not found for provided assignmentId" });
        continue;
      }

      const isCorrect = assignmentDoc.answerValidation === answer;

      await assignment.findByIdAndUpdate(
        _id,
        {
          answer,
          updatedBy,
          updatedDate: new Date(),
          assignmentStatus: "Completed",
        },
        { new: true }
      );

      updatedResults.push({
        _id,
        isCorrect,
        status: "Updated",
      });
    } catch (error: any) {
      failedResults.push({ _id, reason: error.message });
    }
  }

  return {
    updated: updatedResults,
    failed: failedResults,
  };
};


export const getTeacherStudentsAssignmentCount = async ({
  teacherId
}: {
  teacherId: string;
}): Promise<{
  teacherId: string;
  teacherName: string;
  totalStudents: number;
  assignments: {
    total: number;
    assigned: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  students: Array<{
    studentId: string;
    studentName: string;
    assignments: {
      total: number;
      assigned: number;
      completed: number;
      pending: number;
      overdue: number;
    };
    performance: {
      completionRate: number;
      accuracy: number;
    };
  }>;
}> => {
  const trimmedId = teacherId.trim();

  // Get all assignments for this teacher
  const assignments = await assignment.aggregate([
    {
      $match: {
        assignedTeacherId: trimmedId
      }
    },
    {
      $group: {
        _id: "$studentId",
        studentName: { $first: "$studentName" },
        teacherName: { $first: "$assignedTeacher" },
        assignments: {
          $push: {
            status: "$assignmentStatus",
            dueDate: "$dueDate",
            isCorrect: { $cond: [{ $eq: ["$answer", "$answerValidation"] }, 1, 0] }
          }
        }
      }
    },
    {
      $project: {
        studentId: "$_id",
        studentName: 1,
        teacherName: 1,
        assignments: 1,
        _id: 0
      }
    }
  ]).exec();

  // Calculate statistics
  let totalAssigned = 0;
  let totalCompleted = 0;
  let totalPending = 0;
  let totalOverdue = 0;
  const now = new Date();

  const studentsWithStats = assignments.map((student: { assignments: { status: string; isCorrect: number; dueDate: string | number | Date; }[]; studentId: any; studentName: any; }) => {
    let studentAssigned = 0;
    let studentCompleted = 0;
    let studentPending = 0;
    let studentOverdue = 0;
    let correctAnswers = 0;
    let totalAnswered = 0;

    student.assignments.forEach((assignment: { status: string; isCorrect: number; dueDate: string | number | Date; }) => {
      if (assignment.status === "Assigned") {
        studentAssigned++;
        totalAssigned++;
      }
      if (assignment.status === "Completed") {
        studentCompleted++;
        totalCompleted++;
        totalAnswered++;
        correctAnswers += assignment.isCorrect;
      }
      if (assignment.status === "InProgress") {
        studentPending++;
        totalPending++;
        if (new Date(assignment.dueDate) < now) {
          studentOverdue++;
          totalOverdue++;
        }
      }
    });

    const studentTotal = studentAssigned + studentCompleted + studentPending;
    const completionRate = studentTotal > 0 ? (studentCompleted / studentTotal) * 100 : 0;
    const accuracy = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;

    return {
      studentId: student.studentId,
      studentName: student.studentName,
      assignments: {
        total: studentTotal,
        assigned: studentAssigned,
        completed: studentCompleted,
        pending: studentPending,
        overdue: studentOverdue
      },
      performance: {
        completionRate: parseFloat(completionRate.toFixed(2)),
        accuracy: parseFloat(accuracy.toFixed(2))
      }
    };
  });

  const teacherName = assignments.length > 0 
    ? assignments[0].teacherName 
    : "Unknown";

  return {
    teacherId: trimmedId,
    teacherName,
    totalStudents: studentsWithStats.length,
    assignments: {
      total: totalAssigned + totalCompleted + totalPending,
      assigned: totalAssigned,
      completed: totalCompleted,
      pending: totalPending,
      overdue: totalOverdue
    },
    students: studentsWithStats
  };
};
