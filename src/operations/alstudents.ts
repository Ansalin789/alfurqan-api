
import { isNil } from "lodash";
import { IAlStudentCreate, IAlStudents } from "../../types/models.types";
import { alstudentsMessages, commonMessages } from "../config/messages";
import { GetAllRecordsParams } from "../shared/enum";
import AppLogger from "../helpers/logging";
import AlStudentsModel from "../models/alstudents"; // Ensure proper model import
import { Types } from "mongoose";
import  ClassScheduleModel  from "../models/classShedule"


export const getAllalstudentsList = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; students: IAlStudents[] }> => {
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

  // Add filters to the query
  if (filterValues) {
    if (filterValues.course) {
      query.course = { $in: filterValues.course }; // Filter by course
    }
    if (filterValues.country) {
      query.country = { $in: filterValues.country }; // Filter by country
    }
    if (filterValues.teacher) {
      query.teacher = { $in: filterValues.teacher }; // Filter by teacher IDs
    }
    if (filterValues.status) {
      query.status = { $in: filterValues.status }; // Filter by status
    }
  }

  console.log("Constructed Query:", JSON.stringify(query, null, 2)); // Log the constructed query

  // Sorting options
  const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // Create the query with sorting
  const studentQuery = AlStudentsModel.find(query).sort(sortOptions);

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
    AlStudentsModel.countDocuments(query).exec(), // Count total records
  ]);
  //console.log("students>>>>>>>>", students);


// Add classSchedule count to each student
const studentsWithClassScheduleCount = await Promise.all(
  students.map(async (student) => {
    const classScheduleCount = await ClassScheduleModel.countDocuments({
      'student.studentId': student._id.toString()
    }).exec();
      return {
      ...student.toObject(),
      classScheduleCount,
      
    };
  })
);
console.log("studentsWithClassScheduleCount>>>>",studentsWithClassScheduleCount);

  // Log successful retrieval
  AppLogger.info(alstudentsMessages.GET_ALL_LIST_SUCCESS, {
    totalCount: totalCount,
  });

  // Return total count and fetched students
  return { totalCount, students: studentsWithClassScheduleCount };
};

 export const getalstudentsById = async (
    id: string
  ): Promise<IAlStudents | null> => {
    return AlStudentsModel.findOne({
      _id: new Types.ObjectId(id),
    }).lean();
  };
  
  /**
 * Retrieves all user records for a given tenant, with support for search, pagination, sorting, role filtering, and excluding passwords.
 *
 *  @param {Partial<{ id: string; username: string; role: string }>}  query - The parameters for fetching user records, including role filtering.
 *
 * @returns {Promise<IStudent | null>} - A promise that resolves to an object containing:
 *  - `users`: An array of user records for the given tenant, with passwords excluded.
 *  - `totalCount`: The total number of user records matching the query.
 */
 export const getActiveStudentRecord = async (
   query: Partial<{ id: string; username: string; role: string }>
 ): Promise<IAlStudents | null> => {
   const { id, username, role } = query;
 
   const dbQuery: any = {
     status: "Active",
   };
 
   if (!isNil(id)) dbQuery._id = new Types.ObjectId(id);
   if (!isNil(username)) dbQuery.username = username;
   if (!isNil(role)) dbQuery.role = role;
 
   const result = await AlStudentsModel.findOne(dbQuery).lean();
   console.log("result>>",result);

   return AlStudentsModel.findOne(dbQuery).lean();
 };

  /**
 * Creates a new user.
 *
 * @param {IAlStudentCreate} payload - The data of the user to be created.
 */
 export const createAlStudent = async (
   payload: IAlStudentCreate
 ): Promise<IAlStudents | null> => {
   const newStudent = new AlStudentsModel(payload);
   const specialChars = '@#$%&*!';
    const randomNum = Math.floor(Math.random() * 1000); // Random number between 0-999
    const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)]; // Random special character
  
    // Generate password
    const firstThreeChars = newStudent.username.substring(0, 3); // First 3 characters of the username
    const reversedUsername = newStudent.username.split('').reverse().join(''); // Reverse the username
  
    const studentPassword = `${firstThreeChars}${randomSpecial}${randomNum}${reversedUsername}`;
   newStudent.password = studentPassword

   const savedUser = await newStudent.save();

   return savedUser
 };