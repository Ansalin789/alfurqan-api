
import { isNil } from "lodash";
import { IAlStudentCreate, IAlStudents } from "../../types/models.types";
import { alstudentsMessages, commonMessages } from "../config/messages";
import { GetAllRecordsParams } from "../shared/enum";
import AppLogger from "../helpers/logging";
import AlStudentsModel from "../models/alstudents"; // Ensure proper model import
import { Types } from "mongoose";
import  ClassScheduleModel  from "../models/classShedule"
import Evaluation from "../models/evaluation"; 

export const getAllalstudentsList = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; students: IAlStudents[] }> => {
  const { studentId, searchText, sortBy, sortOrder, offset, limit, filterValues } = params;

  // Construct query object based on filters
  const query: any = {};

  // Add searchText to the query if provided
  if (searchText) {
    query.$or = [
      { name: { $regex: searchText, $options: "i" } }, // Search by name
      { email: { $regex: searchText, $options: "i" } }, // Search by email (if applicable)
    ];
  }
   
    if (studentId) {
      query["student.studentId"] = Array.isArray(studentId) ? { $in: studentId } : studentId;
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


// Add classSchedule count to each student
const studentsWithClassScheduleCount = await Promise.all(
  students.map(async (student) => {
    const classScheduleCount = await ClassScheduleModel.countDocuments({
      'student.studentId': student._id.toString() // ✅ Correct based on how you store it
    }).exec();

    // Fetch teacher and sessionClassType using same logic
    const classSchedule = await ClassScheduleModel.findOne(
      { 'student.studentId': student._id.toString() },  // ✅ must match same way as countDocuments
      { 'teacher.teacherName': 1, 'sessionClassType': 1 }
    ).sort({ _id: -1 }).lean();

    // 2️⃣ fetch the matching evaluation(s)
    const evaluations = await Evaluation.find({
      'student.studentId': student.student.studentId  // or: stu._id.toString() if that’s your key
    })
    .lean()
    .exec();
    return {
      ...student.toObject(),
      classScheduleCount, // ✅ original logic
      teacherName: classSchedule?.teacher?.teacherName || "",  // Ensure string
      sessionClassType: classSchedule?.sessionClassType || "" , // Ensure string
      evaluation: evaluations                     // ← now non-empty if matches exist      // ← new field
    };
  })
);


  // Log successful retrieval
  AppLogger.info(alstudentsMessages.GET_ALL_LIST_SUCCESS, {
    totalCount: totalCount,
  });

  // Return total count and fetched students
  return { totalCount, students: studentsWithClassScheduleCount };
};


export const getalstudentsById = async (studentId: string): Promise<IAlStudents | null> => {
  if (!studentId) {
    console.log("Invalid student ID: ID is missing or undefined");
    return null;
  }

  console.log(`Searching for student with studentId: ${studentId}`);

  try {
    // Query using student.studentId
    const student = await AlStudentsModel.findOne({
      _id: studentId,
    }).lean();
const studentDetails = student as IAlStudents;
    console.log("Fetched student details:", student);
    return studentDetails;
  } catch (error) {
    console.error("Error fetching student by studentId:", error);
    return null;
  }
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


 

 export const getStudentRecordCount = async()=>{
 
   const alfStudentCount= await AlStudentsModel.aggregate([
     {
       $group: {
         _id: null,
         studentTotalCount: { $sum: 1 },
         activeStudent: { $sum: { $cond: [{ $eq: ["$status", "Active"] }, 1, 0] } },
         inActiveStudent: { $sum: { $cond: [{ $eq: ["$status", "InActive"] }, 1, 0] } },
         onHoldStudent: { $sum: { $cond: [{ $eq: ["$studentStatus", "HOLD"] }, 1, 0] } },
         studentOnBreak: { $sum: { $cond: [{ $eq: ["$studentStatus", "BREAKING"] }, 1, 0] } } 
       },
     },
     {
       $sort: { count: -1 }, // Optional: sort descending
     },
   ]);
   
   return  alfStudentCount ;
   
 };


 export const getStudentPercentage = async() =>{
     const studentTotalCount= await AlStudentsModel.aggregate([
      
       {
        $group: {
          _id: null,
          studentCount: { $sum: 1 },
          studentMaleCount: { $sum: { $cond: [{ $eq: ["$student.gender", "Male"] }, 1, 0] } },
          studentFemaleCount: { $sum: { $cond: [{ $eq: ["$student.gender", "Female"] }, 1, 0] } },
        },
      },
      ]);
      const studentPercentage = studentTotalCount[0].studentCount;
      const studentMalePercentage = ((studentTotalCount[0].studentMaleCount/ studentTotalCount[0].studentCount)*100).toFixed(2);
      const studentFemalePercentage = ((studentTotalCount[0].studentFemaleCount/ studentTotalCount[0].studentCount)*100).toFixed(2);
      
      return {studentPercentage, studentMalePercentage, studentFemalePercentage};
 };


export const getStudentCountriesCount = async() =>{

  const studentCountByCountry = await AlStudentsModel.aggregate([
    {
      $match: {
        status: "Active", // Optional filter
      },
    },
    {
      $group: {
        _id: "$student.country",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 }, // Optional: sort descending
    },
  ]);
  
  const studentCount = await AlStudentsModel.countDocuments({
    status: "Active",
  }).exec();
  
  const results: any[] = [];
  
  for (const studentCountry of studentCountByCountry) {
    let studentCountryPercentage = ((studentCountry.count / studentCount) * 100).toFixed(2);
    results.push({
      country: studentCountry._id,
      count: studentCountry.count,
      percentage: parseFloat(studentCountryPercentage),
    });
  }
  
  
  return { studentCount, studentCountByCountry: results };

};



export const getStudentlevel = async (studentId: string) => {
  const now = new Date();
  const firstDayOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const studentLevelData = await AlStudentsModel.aggregate([
    {
      $match: {
        status: "Active",
        createdDate: {
          $gte: firstDayOfPreviousMonth,
          $lt: firstDayOfCurrentMonth,
        },
        _id: new Types.ObjectId(studentId),
      },
    },
    {
      $project: {
        _id: 0,
        studentId: "$_id",
        level: "$level",
        monthLabel: {
          $dateToString: {
            format: "%b %Y", // "Jun 2025"
            date: "$createdDate"
          }
        }
      }
    }
  ]);

  return {
    studentCount: studentLevelData.length,
    studentCountByLevel: studentLevelData,
    fromDate: firstDayOfPreviousMonth.toISOString().split("T")[0],
    toDate: firstDayOfCurrentMonth.toISOString().split("T")[0],
  };
};





