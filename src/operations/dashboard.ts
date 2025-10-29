import EvaluationModel from "../models/evaluation"
import classShedule from "../models/classShedule"
import recruitment from "../models/recruitment"
// import feedback from "../models/feedback"
import alstudents from "../models/alstudents"
import tenantUser from "../models/users"
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  format,
  eachDayOfInterval,
  eachMonthOfInterval,
} from "date-fns"
import { Types } from "mongoose"
import meetingschedule from "../models/calendar"
import { PipelineStage } from "mongoose";
import evaluation from "../models/evaluation";
import StudentModel from "../models/student";

export interface EvaluationDetails {
  academicCoach: {
    academicCoachId: string
    name: string
    email: string
  }
  student: {
    studentId: string
    name: string
    email: string
    meetingLink: string
  }
  _id: string
  classType: string
  scheduledStartDate: string
  scheduledEndDate: string
  scheduledFrom: string
  scheduledTo: string
  timeZone: string
}

export const dashboardWidgetCounts = async (
  academicId: string,
): Promise<{
  trialAssigned: number
  evaluationCompleted: number
  evaluationPending: number
  totalPending: number
}> => {
  let totalPendingClasses
  const totaltrialpending = await EvaluationModel.aggregate([
    {
      $match: {
        academicCoachId: academicId,
        trialClassStatus: "PENDING",
      },
    },
    {
      $group: {
        _id: { trialClassStatus: "$trialClassStatus" },
        count: { $sum: 1 },
      },
    },
  ])

  const totalclasspending = await StudentModel.aggregate([
    {
      $match: {
       "academicCoach.academicCoachId": academicId,
        "evaluationStatus": "PENDING",
      },
    },
    {
      $group: {
        _id: { evaluationStatus: "$evaluationStatus" },
        count: { $sum: 1 },
      },
    },
  ])

  if (totaltrialpending.length != 0 && totalclasspending.length != 0) {
    totalPendingClasses = totaltrialpending[0].count + totalclasspending[0].count || 0
  }

  // Execute all count queries in parallel
  const [trialclassAssigned, evaluationCompletedCount, evaluationPendingCount, totalPendingCount] = await Promise.all([
    // Count candidates with meeting status
    await EvaluationModel.countDocuments({
      academicCoachId: academicId,
      trialClassStatus: "PENDING",
    }).exec(),

    // Count candidates with evaluation status
    EvaluationModel.countDocuments({
      academicCoachId: academicId,
      "student.evaluationStatus": "COMPLETED", // Changed to uppercase if that's how it's stored in DB
    }).exec(),

    StudentModel.countDocuments({
      "academicCoach.academicCoachId": academicId,
      "evaluationStatus": "PENDING", // Changed to uppercase if that's how it's stored in DB
    }).exec(),

    // Count active candidates
    totalPendingClasses,
  ])
console.log("evaluationPendingCount>>>", evaluationPendingCount);
  return {
    trialAssigned: trialclassAssigned,
    evaluationCompleted: evaluationCompletedCount,
    evaluationPending: evaluationPendingCount,
    totalPending: totalPendingClasses || 0,
  }
}

export async function dashboardWidgetTeacherCounts(teacherId: string) {
  try {
    if (!teacherId) {
      throw new Error("Invalid teacher ID");
    }

    if (!Types.ObjectId.isValid(teacherId)) {
      throw new Error("Invalid teacher ID format");
    }

    // Shared match stage
    const matchStage = {
      $match: {
        "teacher.teacherId": teacherId,
        $or: [
          { deletedAt: { $exists: false } },
          { deletedAt: null }
        ]
      }
    };

    // Total Aggregation Pipeline
    const totalPipeline = [
      matchStage,
      {
        $group: {
          _id: null,
          totalClasses: { $sum: 1 },
          uniqueStudents: {
            $addToSet: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$student.studentId", null] },
                    { $ne: ["$student.studentId", ""] }
                  ]
                },
                "$student.studentId",
                "$$REMOVE"
              ]
            }
          },
          totalHours: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $gt: ["$totalHourse", 0] }, then: "$totalHourse" },
                  { case: { $gt: ["$totalHours", 0] }, then: "$totalHours" }
                ],
                default: 1
              }
            }
          },
         totalEarnings: {
  $sum: {
    $let: {
      vars: {
        cleanAmount: {
          $toDouble: {
            $replaceAll: {
              input: {
                $replaceAll: {
                  input: "$amount",
                  find: ",",
                  replacement: ""
                }
              },
              find: { $literal: "$" }, // ✅ FIXED HERE
              replacement: ""
            }
          }
        }
      },
      in: { $ifNull: ["$$cleanAmount", 0] }
    }
  }
}

        }
      },
      {
        $project: {
          _id: 0,
          totalclasses: "$totalClasses",
          totalstudents: { $size: "$uniqueStudents" },
          totalhours: { $round: ["$totalHours", 0] },
          totalearnings: { $round: ["$totalEarnings", 0] }
        }
      }
    ];

const totalResult = await classShedule.aggregate(totalPipeline as PipelineStage[]);

    // Monthly Aggregation Pipeline
    const monthlyPipeline = [
      matchStage,
      {
        $addFields: {
          createdAtSafe: { $ifNull: ["$createdAt", new Date()] },
        }
      },
      {
        $addFields: {
          year: { $year: "$createdAtSafe" },
          month: { $month: "$createdAtSafe" }
        }
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalClasses: { $sum: 1 },
          uniqueStudents: {
            $addToSet: {
              $cond: [
                {
                  $and: [
                    { $ne: ["$student.studentId", null] },
                    { $ne: ["$student.studentId", ""] }
                  ]
                },
                "$student.studentId",
                "$$REMOVE"
              ]
            }
          },
          totalHours: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $gt: ["$totalHourse", 0] }, then: "$totalHourse" },
                  { case: { $gt: ["$totalHours", 0] }, then: "$totalHours" }
                ],
                default: 1
              }
            }
          },
        totalEarnings: {
  $sum: {
    $let: {
      vars: {
        cleanAmount: {
          $toDouble: {
            $replaceAll: {
              input: {
                $replaceAll: {
                  input: "$amount",
                  find: ",",
                  replacement: ""
                }
              },
              find: { $literal: "$" }, // ✅ FIXED HERE
              replacement: ""
            }
          }
        }
      },
      in: { $ifNull: ["$$cleanAmount", 0] }
    }
  }
}

        }
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          totalclasses: "$totalClasses",
          totalstudents: { $size: "$uniqueStudents" },
          totalhours: { $round: ["$totalHours", 0] },
          totalearnings: { $round: ["$totalEarnings", 0] }
        }
      },
      {
        $sort: { year: 1, month: 1 }
      }
    ];

const monthlyResult = await classShedule.aggregate(monthlyPipeline as PipelineStage[]);

    return {
      ...(totalResult[0] || {
        totalclasses: 0,
        totalstudents: 0,
        totalhours: 0,
        totalearnings: 0,
      }),
      monthlyData: monthlyResult
    };
  } catch (error) {
    console.error("Error in dashboardWidgetTeacherCounts:", error);
    throw error;
  }
}



// export const dashboardWidgetStudentCounts = async (
//   studentId: string,
//   courseName: string // Pass course name dynamically from query
// ): Promise<{
//   totalLevel: number
//   totalAttendance: number
//   totalClasses: number
//   totalDuration: number
// }> => {
//   // Step 1: Get student record from alstudents
//   const studentRecord = await alstudents.findOne({
//     _id: studentId,
//     "course.courseName": courseName,
//   }).exec();

//   // Step 2: Calculate attendance: present and total class counts
//   const [presentCount, totalClassCount] = await Promise.all([
//     classShedule.countDocuments({
//       "student.studentId": studentId,
//       "course.courseName": courseName,
//       "studentAttendee": "present",
//     }).exec(),

//     classShedule.countDocuments({
//       "student.studentId": studentId,
//       "course.courseName": courseName,
//     }).exec(),
//   ]);

//   const totalAttendance =
//     totalClassCount > 0 ? (presentCount / totalClassCount) * 100 : 0;

//   // Step 3: Get totalDuration (accomplished hours from EvaluationModel)
//   // let totalDuration = 0;
//   // if (internalStudentId) {
//   //   const accomplishedHours = await EvaluationModel.aggregate([
//   //     {
//   //       $match: {
//   //         "student.studentId": internalStudentId,
//   //       },
//   //     },
//   //     {
//   //       $group: {
//   //         _id: null,
//   //         totalAccomplishedHours: {
//   //           $sum: "$student.accomplishedHours", // Update if the field is different
//   //         },
//   //       },
//   //     },
//   //   ]);

//   //   totalDuration = accomplishedHours[0]?.totalAccomplishedHours || 0;
//   // }

//   const totalLevel = studentRecord?.level || 1; 

//   // Step 5: Return final metrics
//   return {
//     totalLevel,
//     totalAttendance: parseFloat(totalAttendance.toFixed(2)),
//     totalClasses: totalClassCount,
//     // totalDuration,
//   };
// };


//pass the studentId and course from query
export const dashboardWidgetStudentCounts = async (
  studentId: string,
  courseName: string
): Promise<{
  totalLevel: string;
  totalAttendance: number;
  totalClasses: number;
  totalDuration: number;
}> => {
  console.log(`Fetching dashboard widget counts for studentId: ${studentId}, courseName: ${courseName}`);

  // Step 1: Get student record from alstudents
  const studentRecord = await alstudents.findOne({ _id: studentId }).exec();
  console.log("Student Record:", studentRecord);

  // Step 2: Get attendance counts from classShedule
  const presentCount = await classShedule.countDocuments({
    "student.studentId": studentId,
    "course.courseName": courseName,
    "student.attendee": "present",
  }).exec();
  console.log("Present Count:", presentCount);

  const totalClassCount = await classShedule.countDocuments({
    "student.studentId": studentId,
    "course.courseName": courseName,
  }).exec();
  console.log("Total Class Count:", totalClassCount);

  const attendancePercentage =
    totalClassCount > 0 ? (presentCount / totalClassCount) * 100 : 0;
  console.log("Attendance Percentage:", attendancePercentage);

  // Step 3: Get accomplishmentTime from evaluation
  let totalDuration = 0;

  if (studentRecord?.student?.studentId) {
    const innerStudentId = studentRecord.student.studentId;
    console.log("Inner Student ID for evaluation lookup:", innerStudentId);

    const evaluationRecord = await evaluation.findOne({
      "student.studentId": innerStudentId,
    }).exec();

    console.log("Evaluation Record:", evaluationRecord);

    totalDuration = Number(evaluationRecord?.accomplishmentTime) || 0;
  } else {
    console.log("No valid studentRecord.student.studentId found");
  }

  // Step 4: Return all the values
  const totalLevel = studentRecord?.level || "1";
  console.log("Total Level:", totalLevel);
  console.log("Total Duration:", totalDuration);

  return {
    totalLevel,
    totalAttendance: attendancePercentage,
    totalClasses: totalClassCount,
    totalDuration,
  };
};


/*
totalLevel: get the level from alstudents collection "_id" == "studentId"
totalAttendance: step 1: pass the studentid and cours to the classShedule collection - "student.studentId": studentId,
step 2: from using this list collection get the student attendee == 'present' count
step3: get toal classchedule count and present count and calculate the percentage
totalAttendance = (presentCount / totalClassCount) * 100
totalClasses: get the total class count from classShedule collection using studentId and course
totalDuration: get the total hours from get student record from alstudents collection "_id" == "studentId" by using studentId and course
               then pass the alstudent "student.studentId" to evaluation "student.studentId",
               get evaluation record then get the accomblished hours from evaluation collection
*/


export const dashboardWidgetSupervisorCounts = async (
): Promise<{
  totalApplication: number
  shortlisted: number
  rejected: number
  waiting: number
  shortlistedPercentage: number
  rejectedPercentage: number
  waitingPercentage: number
}> => {
  // Fetch counts in parallel
  const [shortlisted, rejected, waiting, totalApplication] = await Promise.all([
    recruitment
      .countDocuments({ applicationStatus: "SHORTLISTED" })
      .exec(),
    recruitment
      .countDocuments({ applicationStatus: "REJECTED" })
      .exec(),
    recruitment
      .countDocuments({ applicationStatus: "WAITING" })
      .exec(),
    recruitment.countDocuments().exec(),
  ])

  const shortlistedPercentage = (shortlisted / totalApplication) * 100
  const rejectedPercentage = (rejected / totalApplication) * 100
  const waitingPercentage = (waiting / totalApplication) * 100

  return {
    totalApplication,
    shortlisted,
    rejected,
    waiting,
    shortlistedPercentage,
    rejectedPercentage,
    waitingPercentage,
  }
}

export const dashboardCardCount = async (): Promise<{
  totalStudents: number
  maleStudents: number
  femaleStudents: number
  totalTeachers: number
  maleTeachers: number
  femaleTeachers: number
  totalStaffs: number
  maleStaffs: number
  femaleStaffs: number
}> => {
  // Fetch active students
  const students = await alstudents.find({ status: "Active" })
  const totalStudents = students.length
  const maleStudents = students.filter((student) => student.student.gender === "Male").length
  const femaleStudents = students.filter((student) => student.student.gender === "Female").length

  // Fetch active teachers from tenantUser
  const teachers = await tenantUser.find({ role: "TEACHER", status: "Active" })
  const totalTeachers = teachers.length
  const maleTeachers = teachers.filter((teacher) => teacher.gender === "Male").length
  const femaleTeachers = teachers.filter((teacher) => teacher.gender === "Female").length

  // Fetch other staff members from tenantUser
  const staffs = await tenantUser.find({
    role: { $in: ["SUPERVISOR", "ACADEMICCOACH"] },
    status: "Active",
  })
  const totalStaffs = staffs.length
  const maleStaffs = staffs.filter((staff) => staff.gender === "Male").length
  const femaleStaffs = staffs.filter((staff) => staff.gender === "Female").length

  return {
    totalStudents,
    maleStudents,
    femaleStudents,
    totalTeachers,
    maleTeachers,
    femaleTeachers,
    totalStaffs,
    maleStaffs,
    femaleStaffs,
  }
}

export const totalTrialRequestCount = async (): Promise<{
  totalTrialRequest: number
  pendingRequest: number
  pendingRequestPercentage: number
  joinedStudents: number
  joinedStudentsPercentage: number
  notJoinedStudents: number
  notJoinedrequestPercentage: number
}> => {
  const totalTrialRequestCount = await EvaluationModel.find({ status: "Active" }).exec()
  const totalTrialRequest = totalTrialRequestCount.length
  const pendingRequest = totalTrialRequestCount.filter((trialClass) => trialClass.trialClassStatus === "PENDING").length
  const joinedStudents = totalTrialRequestCount.filter((trialClass) => trialClass.studentStatus === "JOINED").length
  const notJoinedStudents = totalTrialRequestCount.filter(
    (trialClass) => trialClass.studentStatus === "NOTJOINED",
  ).length

  const pendingRequestPercentage = (pendingRequest / totalTrialRequest) * 100
  const joinedStudentsPercentage = (joinedStudents / totalTrialRequest) * 100
  const notJoinedrequestPercentage = (notJoinedStudents / totalTrialRequest) * 100

  return {
    totalTrialRequest,
    pendingRequest,
    pendingRequestPercentage,
    joinedStudents,
    joinedStudentsPercentage,
    notJoinedStudents,
    notJoinedrequestPercentage,
  }
}

export const totalClassCount = async (dateRange: string) => {
  let startDate: Date;
  let endDate: Date = new Date();

  switch (dateRange.toLowerCase()) {
    case "yearly":
      startDate = startOfYear(new Date());
      endDate = endOfYear(new Date());
      break;
    case "monthly":
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(new Date());
      break;
    case "weekly":
      startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
      break;
    default:
      throw new Error("Invalid dateRange value. Use 'weekly', 'monthly', or 'yearly'.");
  }

  console.log(`Fetching results from ${startDate.toISOString()} to ${endDate.toISOString()}`);

  const result = await classShedule.aggregate([
    {
      $match: {
        status: "Active",
        startDate: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$scheduleStatus",
        count: { $sum: 1 },
      },
    },
  ]);

  console.log("Aggregation Result:", result);

  const finalResult = {
    classCompleted: 0,
    classScheduled: 0,
    classRescheduled: 0,
    classCancelled: 0,
  };

  result.forEach(({ _id, count }) => {
    if (_id === "Completed") finalResult.classCompleted += count;
    if (_id === "Scheduled") finalResult.classScheduled += count;
    if (_id === "Rescheduled") finalResult.classRescheduled += count;
    if (_id === "Cancelled") finalResult.classCancelled += count;
  });

  console.log("Final Result:", finalResult);
  return finalResult;
};

export const acUpcomingClassList = async (academicCoachId: string) => {
  // All upcoming classes from the start of today (inclusive) and beyond
  const startOfTodayUTC = new Date()
  startOfTodayUTC.setUTCHours(0, 0, 0, 0)

  const getUpcomingClass = await meetingschedule
    .find({
      ["academicCoach.academicCoachId"]: academicCoachId,
      scheduledStartDate: { $gte: startOfTodayUTC },
    })
    .sort({ scheduledStartDate: 1, scheduledFrom: 1 })

  const upcomingClass: EvaluationDetails[] = getUpcomingClass.map((item: any) => ({
    academicCoach: {
      academicCoachId: item.academicCoach?.academicCoachId || "",
      name: item.academicCoach?.name || "",
      email: item.academicCoach?.email || "",
    },
    student: {
      studentId: item.student?.studentId || "",
      name: item.student?.name || "",
      email: item.student?.email || "",
      meetingLink: item.meetingLink || "",
    },
    _id: item._id?.toString(),
    classType: item.classType || "",
    scheduledStartDate: item.scheduledStartDate || "",
    scheduledEndDate: item.scheduledEndDate || "",
    scheduledFrom: item.scheduledFrom || "",
    scheduledTo: item.scheduledTo || "",
    timeZone: item.timeZone || "",
  }))

  return upcomingClass
}

export const getTeacherAttendanceGet = async () => {
const teachers = await tenantUser.find({ role: "TEACHER", status: "Active" }).lean();
const maleTeachers = teachers.filter(t => t.gender === "Male");
const femaleTeachers = teachers.filter(t => t.gender === "Female");


const currentDate = new Date();
const formattedDate = currentDate.toISOString().split("T")[0];
const startOfDayIST = `${formattedDate}T00:00:00.000+00:00`;
const endOfDayIST = `${formattedDate}T23:59:59.999+00:00`;

const todaySessions = await classShedule.find({
  startDate: { $gte: startOfDayIST, $lte: endOfDayIST },
  sessionStatus: "Completed",
}).lean();


const presentTeacherIds = todaySessions
  .filter(s => s.teacherAttendee == "present")
  .map(s => s.teacher.teacherId);

const malePresentCount = maleTeachers.filter(
  t => t.userId && presentTeacherIds.includes(t.userId)
).length;

const femalePresentCount = femaleTeachers.filter(
  t => t.userId && presentTeacherIds.includes(t.userId)
).length;

const maleAbsentCount = maleTeachers.length - malePresentCount;
const femaleAbsentCount = femaleTeachers.length - femalePresentCount;

return {
  totalTeachers: teachers.length,
  maleTeachers: maleTeachers.length,
  femaleTeachers: femaleTeachers.length,
  maleAttendancePresent: malePresentCount,
  maleAttendanceAbsent: maleAbsentCount,
  femaleAttendancePresent: femalePresentCount,
  femaleAttendanceAbsent: femaleAbsentCount,
};

}