import { isNil } from "lodash";
import { IFeedbackCreate } from "../../types/models.types";
import feedback from "../models/feedback";
import { GetAllRecordsParams } from "../shared/enum";
import { commonMessages } from "../config/messages";
import AppLogger from "../helpers/logging";

export const createFeedback = async (
  payload: IFeedbackCreate
): Promise<{ totalCount: number; feedback: IFeedbackCreate } | { error: any }> => {
  try {
    const newFeedback = new feedback({
        sessionId:payload.sessionId!,
        student: payload.student!,
        teacher: payload.teacher || {},
        classDay: payload.classDay || "",
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
        startTime: payload.startTime || "",
        endTime: payload.endTime || "",
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
        sessionId:payload.sessionId!,      
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


export const getcreateAllTeacherFeedback = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; students: IFeedbackCreate[] }> => {
  const { searchText, sortBy, sortOrder, offset, limit, filterValues } = params;

  // Construct query object based on filters
  const query: any = {};

  // Add searchText to the query if provided
  if (searchText) {
    query.$or = [
      { name: { $regex: searchText, $options: "i" } }, // Search by name
      { email: { $regex: searchText, $options: "i" } }, // Search by email (if applicable)
    ];
  }



  console.log("Constructed Query:", JSON.stringify(query, null, 2)); // Log the constructed query

  // Sorting options
  const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // Create the query with sorting
  const studentQuery = feedback.find(query).sort(sortOptions);

  // Apply pagination (offset and limit)
  if (!isNil(offset) && !isNil(limit)) {
    const skip = Math.max(
      0,
      ((Number(offset) ?? Number(commonMessages.OFFSET)) - 1) *
      (Number(limit) ?? Number(commonMessages.LIMIT))
    );
    studentQuery.skip(skip).limit(Number(limit) ?? Number(commonMessages.LIMIT));
  }

  // Execute the query and count concurrently
  const [students, totalCount] = await Promise.all([
    studentQuery.exec(), // Fetch students with pagination
   feedback.countDocuments(query).exec(), // Count total records
  ]);
  //console.log("students>>>>>>>>", students);


// Add classSchedule count to each student
const studentsWithLevelCount = await Promise.all(
  students.map(async (student) => {
    const levelCount = await feedback.countDocuments({
      'student.studentId': student._id.toString()
    }).exec();
      return {
      ...student.toObject(),
      levelCount
      ,
      
    };
  })
);
console.log("studentsWithLevelCount>>>>",studentsWithLevelCount);

  // Log successful retrieval
  AppLogger.info(commonMessages.GET_ALL_LIST_SUCCESS, {
    totalCount: totalCount,
  });

  // Return total count and fetched students
  return { totalCount, students: studentsWithLevelCount };
};




////////////////////////////SUPERVISOR///////////////////////////

export const createSupervisorFeedback = async (
  payload: IFeedbackCreate
): Promise<{ totalCount: number; feedback: IFeedbackCreate } | { error: any }> => {
  try {
    const newFeedback = new feedback({
      sessionId:payload.sessionId!,
      supervisor: payload.supervisor!,
      teacher: payload.teacher || {},
      classDay: payload.classDay || "",
      preferedTeacher: payload.preferedTeacher!,
      course: payload.course!,
      
      // Fix: Access supervisorRating correctly
      supervisorRating: {
        knowledgeofstudentsandcontent: payload.supervisorRating?.knowledgeofstudentsandcontent ?? 0,
        assessmentofstudents: payload.supervisorRating?.assessmentofstudents ?? 0,
        communicationandcollaboration: payload.supervisorRating?.communicationandcollaboration ?? 0,
        professionalism: payload.supervisorRating?.professionalism ?? 0,
      },
      
      startDate: new Date(payload.startDate!),
      endDate: new Date(payload.endDate!),
      startTime: payload.startTime || "",
      endTime: payload.endTime || "",
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
    return { error };
  }
};


// ✅ Ensure this function correctly filters by supervisorId
export const getAllSupervisorRecords = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; applicants: IFeedbackCreate[] }> => {
  const {
    supervisorId,
    searchText,
    sortBy,
    sortOrder,
    offset,
    limit,
  } = params;

  // ✅ Ensure supervisorId is always included in the query
  const query: any = { 'supervisor.supervisorId': supervisorId };

  // ✅ Allow searching by student name or email
  if (searchText) {
    query.$or = [
      { 'supervisor.supervisorFirstName': { $regex: searchText, $options: "i" } },
      { 'supervisor.supervisorLastName': { $regex: searchText, $options: "i" } },
      { 'supervisor.supervisorEmail': { $regex: searchText, $options: "i" } },
    ];
  }

  console.log("Constructed Query:", JSON.stringify(query, null, 2)); // ✅ Log the constructed query

  // ✅ Sorting options
  const sortOptions: any = { [sortBy || "createdDate"]: sortOrder === "asc" ? 1 : -1 };

  const studentQuery = feedback.find(query).sort(sortOptions);

  // ✅ Apply pagination if provided
  if (offset !== undefined && limit !== undefined) {
    const skip = Math.max(
      0,
      ((Number(offset) ?? Number(commonMessages.OFFSET)) - 1) *
        (Number(limit) ?? Number(commonMessages.LIMIT))
    );
    studentQuery.skip(skip).limit(Number(limit) ?? Number(commonMessages.LIMIT));
  }

  // ✅ Execute both query and count concurrently
  const [applicants, totalCount] = await Promise.all([
    studentQuery.exec(),
    feedback.countDocuments(query).exec(),
  ]);

  // ✅ Log success
  AppLogger.info(commonMessages.GET_ALL_LIST_SUCCESS, { totalCount });

  return { totalCount, applicants };
};


export const getAllFeedbackRecords = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; feedbackRecords: IFeedbackCreate[] }> => {
  const {
    searchText,
    sortBy,
    sortOrder,
    offset,
    limit,
  } = params;

  // ✅ Construct a query object that EXCLUDES supervisors
  const query: any = {
    supervisor: { $exists: false } // ✅ Ensures records with supervisors are excluded
  };

  // ✅ Allow searching by student or teacher name/email
  if (searchText) {
    query.$or = [
      { 'student.studentFirstName': { $regex: searchText, $options: "i" } },
      { 'student.studentLastName': { $regex: searchText, $options: "i" } },
      { 'student.studentEmail': { $regex: searchText, $options: "i" } },
      { 'teacher.teacherName': { $regex: searchText, $options: "i" } },
      { 'teacher.teacherEmail': { $regex: searchText, $options: "i" } },
    ];
  }

  console.log("Constructed Query:", JSON.stringify(query, null, 2)); // ✅ Log the constructed query

  // ✅ Sorting options (default: createdDate descending)
  const sortOptions: any = { [sortBy || "createdDate"]: sortOrder === "asc" ? 1 : -1 };

  // ✅ Create query to fetch feedback (excluding supervisors)
  const feedbackQuery = feedback.find(query).sort(sortOptions);

  // ✅ Apply pagination if provided
  if (offset !== undefined && limit !== undefined) {
    const skip = Math.max(
      0,
      ((Number(offset) ?? Number(commonMessages.OFFSET)) - 1) *
        (Number(limit) ?? Number(commonMessages.LIMIT))
    );
    feedbackQuery.skip(skip).limit(Number(limit) ?? Number(commonMessages.LIMIT));
  }

  // ✅ Execute both query and count concurrently
  const [feedbackRecords, totalCount] = await Promise.all([
    feedbackQuery.exec(),
    feedback.countDocuments(query).exec(),
  ]);

  // ✅ Log success
  AppLogger.info(commonMessages.GET_ALL_LIST_SUCCESS, { totalCount });

  return { totalCount, feedbackRecords };
};
