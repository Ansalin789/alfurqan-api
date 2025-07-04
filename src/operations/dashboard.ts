import EvaluationModel from "../models/evaluation";
import classShedule from "../models/classShedule";
import usershiftschedule from "../models/usershiftschedule";
import recruitment from "../models/recruitment";
import feedback from "../models/feedback";
import alstudents from "../models/alstudents";
import tenantUser from "../models/users";
import meetingschedule from "../models/calendar";
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
} from "date-fns";
import { Types } from "mongoose";

export interface EvaluationDetails {
  academicCoach: {
    academicCoachId: string;
    name: string;
    email: string;
  };
  student: {
    studentId: string;
    name: string;
    email: string;
    meetingLink: string;
  };
  _id: string;
  classType: string;
  scheduledStartDate: string;
  scheduledEndDate: string;
  scheduledFrom: string;
  scheduledTo: string;
  timeZone: string;
}

export const dashboardWidgetCounts = async (academicId: string) => {
  const [trialPending, classPending] = await Promise.all([
    EvaluationModel.countDocuments({ academicCoachId: academicId, trialClassStatus: "PENDING" }),
    EvaluationModel.countDocuments({ academicCoachId: academicId, classStatus: "Pending" })
  ]);

  const totalPendingClasses = trialPending + classPending;

  const [evaluationCompleted, evaluationPending] = await Promise.all([
    EvaluationModel.countDocuments({ academicCoachId: academicId, "student.evaluationStatus": "COMPLETED" }),
    EvaluationModel.countDocuments({ academicCoachId: academicId, "student.evaluationStatus": "PENDING" })
  ]);

  return {
    trialAssigned: trialPending,
    evaluationCompleted,
    evaluationPending,
    totalPending: totalPendingClasses
  };
};

export const dashboardWidgetTeacherCounts = async (teacherId: string) => {
  try {
    const objectId = new Types.ObjectId(teacherId); // 🔁 Ensure proper ObjectId format

    // 1. Get unique students for this teacher
    const studentIds = await classShedule.distinct("student.studentId", {
      "teacher.teacherId": objectId,
    });

    // 2. Get total classes, total earnings, total hours
    const [classesCount, earningsAgg, hoursAgg] = await Promise.all([
      classShedule.countDocuments({ "teacher.teacherId": objectId }),

      classShedule.aggregate([
        { $match: { "teacher.teacherId": objectId } },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: { $toDouble: "$amount" } },
          },
        },
      ]),

      classShedule.aggregate([
        { $match: { "teacher.teacherId": objectId } },
        {
          $project: {
            startTimeStr: { $arrayElemAt: ["$startTime", 0] },
            endTimeStr: { $arrayElemAt: ["$endTime", 0] },
          },
        },
        {
          $addFields: {
            duration: {
              $divide: [
                {
                  $subtract: [
                    { $toDate: { $concat: ["1970-01-01T", "$endTimeStr", ":00Z"] } },
                    { $toDate: { $concat: ["1970-01-01T", "$startTimeStr", ":00Z"] } },
                  ],
                },
                1000 * 60 * 60, // ms → hours
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            totalHours: { $sum: "$duration" },
          },
        },
      ]),
    ]);

    // 3. Format response safely
    return {
      totalclasses: classesCount,
      totalstudents: studentIds.length,
      totalhours: hoursAgg?.[0]?.totalHours || 0,
      totalearnings: earningsAgg?.[0]?.totalEarnings || 0,
    };
  } catch (error) {
    console.error("Error in dashboardWidgetTeacherCounts:", error);
    throw error;
  }
};

export const dashboardWidgetStudentCounts = async (studentId: string) => {
  const [levelCount, attendanceCount, classCount, totalHoursAgg] = await Promise.all([
    feedback.countDocuments({ studentId }),
    classShedule.countDocuments({ studentId }),
    classShedule.countDocuments({ "student.studentId": studentId }),
    classShedule.aggregate([
      { $match: { "student.studentId": studentId } },
      { $group: { _id: null, totalHourse: { $sum: "$totalHourse" } } },
    ]),
  ]);

  const totalHourse = totalHoursAgg?.[0]?.totalHourse || 0;
  const totalSum = levelCount + attendanceCount + classCount + totalHourse;

  const percent = (val: number) => (totalSum > 0 ? (val / totalSum) * 100 : 0);

  return {
    totalLevel: percent(levelCount),
    totalAttendance: percent(attendanceCount),
    totalClasses: percent(classCount),
    totalDuration: percent(totalHourse),
  };
};

export const dashboardWidgetSupervisorCounts = async (supervisorId: string) => {
  const [shortlisted, rejected, waiting, totalApplication] = await Promise.all([
    recruitment.countDocuments({ "supervisor.supervisorId": new Types.ObjectId(supervisorId), applicationStatus: "SHORTLISTED" }),
    recruitment.countDocuments({ "supervisor.supervisorId": new Types.ObjectId(supervisorId), applicationStatus: "REJECTED" }),
    recruitment.countDocuments({ "supervisor.supervisorId": new Types.ObjectId(supervisorId), applicationStatus: "WAITING" }),
    recruitment.countDocuments({ "supervisor.supervisorId": new Types.ObjectId(supervisorId) }),
  ]);

  return {
    totalApplication,
    shortlisted,
    rejected,
    waiting,
    shortlistedPercentage: (shortlisted / totalApplication) * 100,
    rejectedPercentage: (rejected / totalApplication) * 100,
    waitingPercentage: (waiting / totalApplication) * 100,
  };
};

export const dashboardCardCount = async () => {
  const students = await alstudents.find({ status: "Active" });
  const totalStudents = students.length;
  const maleStudents = students.filter(s => s.student.gender === "Male").length;
  const femaleStudents = students.filter(s => s.student.gender === "Female").length;

  const teachers = await tenantUser.find({ role: "TEACHER", status: "Active" });
  const totalTeachers = teachers.length;
  const maleTeachers = teachers.filter(t => t.gender === "Male").length;
  const femaleTeachers = teachers.filter(t => t.gender === "Female").length;

  const staffs = await tenantUser.find({
    role: { $in: ["SUPERVISOR", "ACADEMICCOACH"] },
    status: "Active",
  });
  const totalStaffs = staffs.length;
  const maleStaffs = staffs.filter(s => s.gender === "Male").length;
  const femaleStaffs = staffs.filter(s => s.gender === "Female").length;

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
  };
};

export const totalTrialRequestCount = async () => {
  const trials = await EvaluationModel.find({ status: "Active" });
  const total = trials.length;
  const pending = trials.filter(t => t.trialClassStatus === "PENDING").length;
  const joined = trials.filter(t => t.studentStatus === "JOINED").length;
  const notJoined = trials.filter(t => t.studentStatus === "NOTJOINED").length;

  return {
    totalTrialRequest: total,
    pendingRequest: pending,
    pendingRequestPercentage: (pending / total) * 100,
    joinedStudents: joined,
    joinedStudentsPercentage: (joined / total) * 100,
    notJoinedStudents: notJoined,
    notJoinedrequestPercentage: (notJoined / total) * 100,
  };
};

export const totalClassCount = async (dateRange: string) => {
  let startDate: Date;
  let endDate = new Date();
  let dateFormat: string;
  let intervalFn;
  let outputFormat: string;

  switch (dateRange.toLowerCase()) {
    case "yearly":
      startDate = startOfYear(new Date());
      endDate = endOfYear(new Date());
      dateFormat = "%Y-%m";
      intervalFn = eachMonthOfInterval;
      outputFormat = "MMM-yyyy";
      break;
    case "monthly":
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(new Date());
      dateFormat = "%Y-%m-%d";
      intervalFn = eachDayOfInterval;
      outputFormat = "yyyy-MM-dd";
      break;
    case "weekly":
      startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
      endDate = endOfWeek(new Date(), { weekStartsOn: 1 });
      dateFormat = "%Y-%m-%d";
      intervalFn = eachDayOfInterval;
      outputFormat = "yyyy-MM-dd";
      break;
    default:
      throw new Error("Invalid dateRange value. Use 'weekly', 'monthly', or 'yearly'.");
  }

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
  ]);

  const groupedResults: Record<string, any> = {};
  result.forEach(({ _id, count }) => {
    const date = format(new Date(_id.date), outputFormat);
    if (!groupedResults[date]) {
      groupedResults[date] = {
        date,
        classCompleted: 0,
        classPending: 0,
        classReschedule: 0,
        classCancelled: 0,
      };
    }
    if (_id.status === "Complete") groupedResults[date].classCompleted += count;
    if (_id.status === "Pending") groupedResults[date].classPending += count;
    if (_id.status === "Reschedule") groupedResults[date].classReschedule += count;
    if (_id.status === "Cancelled") groupedResults[date].classCancelled += count;
  });

  const allDates = intervalFn({ start: startDate, end: endDate }).map((d) => format(d, outputFormat));
  return allDates.map((date) => groupedResults[date] || { date, classCompleted: 0, classPending: 0, classReschedule: 0, classCancelled: 0 });
};

export const acUpcomingClassList = async (academicCoachId: string) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0];
  const startOfDay = `${formattedDate}T00:00:00.000+00:00`;
  const endOfDay = `${formattedDate}T23:59:59.999+00:00`;

  const upcoming = await meetingschedule.find({
    "academicCoach.academicCoachId": academicCoachId,
    scheduledStartDate: { $gte: startOfDay, $lte: endOfDay },
  }).sort({ scheduledFrom: 1 });

  return upcoming.map((item: any) => ({
    academicCoach: {
      academicCoachId: item.academicCoach?.academicCoachId || '',
      name: item.academicCoach?.name || '',
      email: item.academicCoach?.email || ''
    },
    student: {
      studentId: item.student?.studentId || '',
      name: item.student?.name || '',
      email: item.student?.email || '',
      meetingLink: item.meetingLink || ''
    },
    _id: item._id?.toString(),
    classType: item.classType || '',
    scheduledStartDate: item.scheduledStartDate || '',
    scheduledEndDate: item.scheduledEndDate || '',
    scheduledFrom: item.scheduledFrom || '',
    scheduledTo: item.scheduledTo || '',
    timeZone: item.timeZone || ''
  }));
};
