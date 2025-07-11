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
// import { result } from "lodash"
import evaluation from "../models/evaluation"

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

  const totalclasspending = await EvaluationModel.aggregate([
    {
      $match: {
        academicCoachId: academicId,
        classStatus: "Pending",
      },
    },
    {
      $group: {
        _id: { classStatus: "$classStatus" },
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

    EvaluationModel.countDocuments({
      academicCoachId: academicId,
      "student.evaluationStatus": "PENDING", // Changed to uppercase if that's how it's stored in DB
    }).exec(),

    // Count active candidates
    totalPendingClasses,
  ])

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

 const pipeline = [
  // Fixed $match stage
  {
    $match: {
      "teacher.teacherId": teacherId,
      $or: [
        { deletedAt: { $exists: false } },
        { deletedAt: null }
      ]
    }
  },
  {
    $group: {
      _id: null,
      totalClasses: { $sum: 1 },
      // Fixed student count
      uniqueStudents: {
        $addToSet: {
          $cond: [
            { $and: [
              { $ne: ["$student.studentId", null] },
              { $ne: ["$student.studentId", ""] }
            ]},
            "$student.studentId",
            "$$REMOVE"
          ]
        }
      },
      // Fixed hours calculation
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
      // Fixed earnings calculation
      totalEarnings: {
        $sum: {
          $let: {
            vars: {
              cleanAmount: {
                $toDouble: {
                  $replaceAll: {
                    input: { $replaceAll: { input: "$amount", find: ",", replacement: "" } },
                    find: { $literal: "$" },
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
      totalhours: "$totalHours",
      totalearnings: "$totalEarnings"
    }
  }
];

   

    const result = await classShedule.aggregate(pipeline);

    return result[0] || {
      totalclasses: 0,
      totalstudents: 0,
      totalhours: 0,
      totalearnings: 0,
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
  courseName: string // Needed to filter course-specific data
): Promise<{
  totalLevel: string
  totalAttendance: number
  totalClasses: number
  totalDuration: number
}> => {

  const levelCount = await alstudents.findOne({
     _id: studentId,
     }).exec();

  const presentCount = await classShedule.countDocuments({
    "student.studentId": studentId,
    "course.courseName": courseName,
    "student.attendee": "present"
  }).exec();

  const totalClassCount = await classShedule.countDocuments({
    "student.studentId": studentId,
    "course.courseName": courseName,
  }).exec();

  const attendancePercentage =
    totalClassCount > 0 ? (presentCount / totalClassCount) * 100 : 0;

  const evaluationRecord = await evaluation.findOne({
    "student.studentId": levelCount?.student.studentId,
    "course.courseName": courseName,
  }).exec();

  const totalDuration = typeof evaluationRecord?.accomplishmentTime === 'number'
    ? evaluationRecord.accomplishmentTime
    : 0;

 return {
    totalLevel: levelCount?.level || "1", 
    totalAttendance: attendancePercentage,
    totalClasses: totalClassCount,
    totalDuration: totalDuration,
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
  supervisorId: string,
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
      .countDocuments({ "supervisor.supervisorId": new Types.ObjectId(supervisorId), applicationStatus: "SHORTLISTED" })
      .exec(),
    recruitment
      .countDocuments({ "supervisor.supervisorId": new Types.ObjectId(supervisorId), applicationStatus: "REJECTED" })
      .exec(),
    recruitment
      .countDocuments({ "supervisor.supervisorId": new Types.ObjectId(supervisorId), applicationStatus: "WAITING" })
      .exec(),
    recruitment.countDocuments({ "supervisor.supervisorId": new Types.ObjectId(supervisorId) }).exec(),
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

export const totalClassCount = async (
  dateRange: string,
): Promise<
  { date: string; classCompleted: number; classPending: number; classReschedule: number; classCancelled: number }[]
> => {
  let startDate: Date
  let endDate: Date = new Date() // Default to today
  let dateFormat: string
  let intervalFn: (interval: { start: Date; end: Date }) => Date[]
  let outputFormat: string

  // Determine start and end dates based on dateRange
  switch (dateRange.toLowerCase()) {
    case "yearly":
      startDate = startOfYear(new Date())
      endDate = endOfYear(new Date())
      dateFormat = "%Y-%m" // MongoDB format for months
      intervalFn = eachMonthOfInterval
      outputFormat = "MMM-yyyy" // Output format for months
      break
    case "monthly":
      startDate = startOfMonth(new Date())
      endDate = endOfMonth(new Date())
      dateFormat = "%Y-%m-%d" // MongoDB format for days
      intervalFn = eachDayOfInterval
      outputFormat = "yyyy-MM-dd" // Output format for days
      break
    case "weekly":
      startDate = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday start
      endDate = endOfWeek(new Date(), { weekStartsOn: 1 }) // Sunday end
      dateFormat = "%Y-%m-%d"
      intervalFn = eachDayOfInterval
      outputFormat = "yyyy-MM-dd"
      break
    default:
      throw new Error("Invalid dateRange value. Use 'weekly', 'monthly', or 'yearly'.")
  }

  console.log(`Fetching results from ${startDate.toISOString()} to ${endDate.toISOString()}`)

  // Aggregation query to count class statuses per date/month
  const result = await classShedule.aggregate([
    {
      $match: {
        status: "Active",
        startDate: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { date: { $dateToString: { format: dateFormat, date: "$startDate" } }, status: "$scheduleStatus" },
        count: { $sum: 1 },
      },
    },
  ])

  let finalResult: any

  // Convert aggregation results into a structured object
  const groupedResults: Record<string, any> = {}
  result.forEach(({ _id, count }) => {
    const date = format(new Date(_id.date), outputFormat) // Convert to correct format safely
    if (!groupedResults[date]) {
      groupedResults[date] = {
        date,
        classCompleted: 0,
        classPending: 0,
        classReschedule: 0,
        classCancelled: 0,
      }
    }
    if (_id.status === "Complete") groupedResults[date].classCompleted += count
    if (_id.status === "Pending") groupedResults[date].classPending += count
    if (_id.status === "Reschedule") groupedResults[date].classReschedule += count
    if (_id.status === "Cancelled") groupedResults[date].classCancelled += count
  })

  // Ensure all intervals are included (fill missing values with 0)
  const allDates = intervalFn({ start: startDate, end: endDate }).map((d) => format(d, outputFormat))
  // eslint-disable-next-line prefer-const
  finalResult = allDates.map(
    (date) =>
      groupedResults[date] || { date, classCompleted: 0, classPending: 0, classReschedule: 0, classCancelled: 0 },
  )

  return finalResult
}

export const acUpcomingClassList = async (academicCoachId: string) => {
  const currentDate = new Date()
  const formattedDate = currentDate.toISOString().split("T")[0]

  const startOfDayIST = `${formattedDate}T00:00:00.000+00:00`
  const endOfDayIST = `${formattedDate}T23:59:59.999+00:00`

  const getUpcomingClass = await meetingschedule
    .find({
      ["academicCoach.academicCoachId"]: academicCoachId,
      scheduledStartDate: {
        $gte: startOfDayIST,
        $lte: endOfDayIST,
      },
    })
    .sort({ scheduledFrom: 1 })

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
