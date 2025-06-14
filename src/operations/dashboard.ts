import EvaluationModel from "../models/evaluation";
import classShedule from "../models/classShedule";
import usershiftschedule from "../models/usershiftschedule";
import recruitment from "../models/recruitment";
import feedback from "../models/feedback";
import alstudents from "../models/alstudents";
import tenantUser from "../models/users";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format, eachDayOfInterval, eachMonthOfInterval } from "date-fns";
import { Types } from "mongoose";
import meetingschedule from "../models/calendar"


// export interface Dashboard {
//   status: string;
//   Status: string;
//   evaluationStatus: string;
//   totalPending: number;    
// }

export interface EvaluationDetails{
  academicCoach:{
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
export const dashboardWidgetCounts = async (academicId: string
): Promise<{
    trialAssigned: number;
    evaluationCompleted: number;
    evaluationPending: number;
    totalPending: number;
  }> => {

let totalPendingClasses;
    let totaltrialpending  = await EvaluationModel.aggregate([
  {
    $match: {
    academicCoachId: academicId,
      trialClassStatus: "PENDING",
    }
  },
  {
    $group: {
      _id: { trialClassStatus: "$trialClassStatus" },
      count: { $sum: 1 }
    }
  }
]);

 let totalclasspending  = await EvaluationModel.aggregate([
  {
    $match: {
      academicCoachId: academicId,
      classStatus: "Pending"
    }
  },
  {
    $group: {
      _id: { classStatus: "$classStatus" },
      count: { $sum: 1 }
    }
  }
]);


if(totaltrialpending.length != 0 && totalclasspending.length !=0){
 totalPendingClasses = totaltrialpending[0].count + totalclasspending[0].count || 0
}
    // Execute all count queries in parallel
    const [
      trialclassAssigned,
      evaluationCompletedCount,
      evaluationPendingCount,
      totalPendingCount
    ] = await Promise.all([
      // Count candidates with meeting status
   await EvaluationModel.countDocuments({
      academicCoachId: academicId,
      trialClassStatus: "PENDING"
    }).exec(),
      // Count candidates with evaluation status
      EvaluationModel.countDocuments({
        academicCoachId: academicId,
        "student.evaluationStatus": "COMPLETED"  // Changed to uppercase if that's how it's stored in DB
      }).exec(),

       EvaluationModel.countDocuments({
        academicCoachId: academicId,
        "student.evaluationStatus": "PENDING"  // Changed to uppercase if that's how it's stored in DB
      }).exec(),
      // Count active candidates
      totalPendingClasses
    ]);

    return {
      trialAssigned: trialclassAssigned,
      evaluationCompleted: evaluationCompletedCount,
      evaluationPending: evaluationPendingCount,
      totalPending: totalPendingClasses || 0
    };
  };



  //Teacher dashboard
  export const dashboardWidgetTeacherCounts = async (teacherId: string): Promise<{
    totalclasses: number;
    totalstudents: number;
    totalhours: number;
    totalearnings: number;
  }> => {
    try {
      // Execute all count queries in parallel
      const [classesCount, studentsCount, hoursCount, earnings] = await Promise.all([
        // Count total classes conducted by the teacher
        classShedule.countDocuments({ "teacher.teacherId": teacherId }).exec(),
  
        // Count unique students taught by the teacher
        classShedule.distinct("student.studentId", { "teacher.teacherId": teacherId }).then(
          (students) => students.length
        ),
  
        // Find total hours taught by the teacher
        usershiftschedule.findOne({ teacherId: teacherId }).then((totalhours) => {
          if (!totalhours) return 0;
  
          const fromTime = totalhours.fromtime; // e.g., "09:00"
          const toTime = totalhours.totime; // e.g., "12:30"
  
          // Convert time string to minutes
          const timeToMinutes = (timeStr: string) => {
            const [hours, minutes] = timeStr.split(":").map(Number);
            return hours * 60 + minutes;
          };
  
          // Calculate work hours per day
          const workMinutes = timeToMinutes(toTime) - timeToMinutes(fromTime);
          let workHours = workMinutes / 60;
  
          console.log(`Total Work Hours: ${workHours} hours`);
  
          // Calculate total working days
          const fromDate = new Date(totalhours.startdate);
          const toDate = new Date(totalhours.enddate);
  
          const totalDays =
            Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
          console.log("Total Working Days:", totalDays);
  
          return workHours * totalDays; // Return total working hours
        }),
  
        // Calculate total earnings (sum of 'earnings' field)
        classShedule
          .aggregate([
            { $match: { teacherId: teacherId } },
            { $group: { _id: null, totalEarnings: { $sum: "$earnings" } } },
          ])
          .then((result) => (result.length > 0 ? result[0].totalEarnings : 0)),
      ]);
  
      // Ensure valid values from aggregation (if no result, set to 0)
      const totalHoursValue = hoursCount || 0;
      const totalEarningsValue = earnings || 0;
  
      return {
        totalclasses: classesCount,
        totalstudents: studentsCount,
        totalhours: totalHoursValue,
        totalearnings: totalEarningsValue,
      };
    } catch (error) {
      console.error("Error calculating teacher dashboard data:", error);
      throw new Error("Unable to fetch teacher dashboard data.");
    }
  };


  export const dashboardWidgetStudentCounts = async (studentId: string): Promise<{
    totalLevel: number;
    totalAttendance: number;
    totalClasses: number;
    totalDuration: number;
  }> => {
    // Fetch counts in parallel
    const [levelCount, attendanceCount, classCount, totalHours] = await Promise.all([
      feedback.countDocuments({ studentId: studentId }).exec(), // Fetch level count from feedback
      classShedule.countDocuments({ studentId: studentId }).exec(),
      classShedule.countDocuments({ 'studentId.studentId': studentId }).exec(),
      classShedule.aggregate([
        { $match: { studentId: studentId } }, 
        { $group: { _id: null, totalHourse: { $sum: '$totalHourse' } } } // Summing totalHourse instead of duration
      ]).exec(),
    ]);
  
    // Extract total hours value (fallback to 0 if undefined)
    const totalHoursValue = totalHours?.[0]?.totalHourse || 0;
  
    // Compute total sum of all categories
    const totalSum = levelCount + attendanceCount + classCount + totalHoursValue;
  
    // Avoid division by zero
    const calculatePercentage = (value: number) => (totalSum > 0 ? (value / totalSum) * 100 : 0);
  
    return {
      totalLevel: calculatePercentage(levelCount),
      totalAttendance: calculatePercentage(attendanceCount),
      totalClasses: calculatePercentage(classCount),
      totalDuration: calculatePercentage(totalHoursValue),
    };
  };


export const dashboardWidgetSupervisorCounts = async (supervisorId: string): Promise<{
  totalApplication: number;
  shortlisted: number;
  rejected: number;
  waiting:number;
  shortlistedPercentage: number;
  rejectedPercentage: number;
  waitingPercentage:number

}> => {
  // Fetch counts in parallel
  const [shortlisted, rejected,waiting ,totalApplication] = await Promise.all([
    recruitment.countDocuments({ 'supervisor.supervisorId': new Types.ObjectId(supervisorId), applicationStatus: "SHORTLISTED" }).exec(),
    recruitment.countDocuments({ 'supervisor.supervisorId': new Types.ObjectId(supervisorId), applicationStatus: "REJECTED" }).exec(),
    recruitment.countDocuments({ 'supervisor.supervisorId': new Types.ObjectId(supervisorId), applicationStatus: "WAITING" }).exec(),
    recruitment.countDocuments({ 'supervisor.supervisorId': new Types.ObjectId(supervisorId) }).exec(),
  ]);

  const shortlistedPercentage=(shortlisted/totalApplication) * 100;
  const rejectedPercentage=(rejected/totalApplication) * 100;
  const waitingPercentage=(waiting/totalApplication) * 100;


  return {
    totalApplication,
    shortlisted,
    rejected,
    waiting,
    shortlistedPercentage,
    rejectedPercentage,
    waitingPercentage
  };
};

export const dashboardCardCount = async (): Promise<{
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  totalTeachers: number;
  maleTeachers: number;
  femaleTeachers: number;
  totalStaffs: number;
  maleStaffs: number;
  femaleStaffs: number;
}> => {
  // Fetch active students
  const students = await alstudents.find({ status: 'Active' });
  const totalStudents = students.length;
  const maleStudents = students.filter(student => student.student.gender === 'Male').length;
  const femaleStudents = students.filter(student => student.student.gender === 'Female').length;

  // Fetch active teachers from tenantUser
  const teachers = await tenantUser.find({ role: 'TEACHER', status: 'Active' });
  const totalTeachers = teachers.length;
  const maleTeachers = teachers.filter(teacher => teacher.gender === 'Male').length;
  const femaleTeachers = teachers.filter(teacher => teacher.gender === 'Female').length;

  // Fetch other staff members from tenantUser
  const staffs = await tenantUser.find({ 
    role: { $in: ['SUPERVISOR', 'ACADEMICCOACH'] }, 
    status: 'Active' 
  });
  const totalStaffs = staffs.length;
  const maleStaffs = staffs.filter(staff => staff.gender === 'Male').length;
  const femaleStaffs = staffs.filter(staff => staff.gender === 'Female').length;

  return {
    totalStudents,
    maleStudents,
    femaleStudents,
    totalTeachers,
    maleTeachers,
    femaleTeachers,
    totalStaffs,
    maleStaffs,
    femaleStaffs
  };
};

export const totalTrialRequestCount = async (): Promise<{
  totalTrialRequest: number;
  pendingRequest: number;
  pendingRequestPercentage: number;
  joinedStudents: number;
  joinedStudentsPercentage: number;
  notJoinedStudents: number;
  notJoinedrequestPercentage: number;

}> => {

const totalTrialRequestCount = await EvaluationModel.find({ status: 'Active' }).exec();

const totalTrialRequest = totalTrialRequestCount.length;
const pendingRequest = totalTrialRequestCount.filter(trialClass => trialClass.trialClassStatus === 'PENDING').length;
const joinedStudents = totalTrialRequestCount.filter(trialClass => trialClass.studentStatus === 'JOINED').length;
const notJoinedStudents = totalTrialRequestCount.filter(trialClass => trialClass.studentStatus === 'NOTJOINED').length;

const pendingRequestPercentage=(pendingRequest/totalTrialRequest) * 100;
const joinedStudentsPercentage=(joinedStudents/totalTrialRequest) * 100;
const notJoinedrequestPercentage=(notJoinedStudents/totalTrialRequest) * 100;
  return {
    totalTrialRequest,
    pendingRequest,
    pendingRequestPercentage,
    joinedStudents,
    joinedStudentsPercentage,
    notJoinedStudents,
    notJoinedrequestPercentage,
  }
};

export const totalClassCount = async (
  dateRange: string
): Promise<
  { date: string; classCompleted: number; classPending: number; classReschedule: number; classCancelled: number }[]
> => {
  let startDate: Date;
  let endDate: Date = new Date(); // Default to today
  let dateFormat: string;
  let intervalFn: (interval: { start: Date; end: Date }) => Date[];
  let outputFormat: string;

  // Determine start and end dates based on dateRange
  switch (dateRange.toLowerCase()) {
    case "yearly":
      startDate = startOfYear(new Date());
      endDate = endOfYear(new Date());
      dateFormat = "%Y-%m"; // MongoDB format for months
      intervalFn = eachMonthOfInterval;
      outputFormat = "MMM-yyyy"; // Output format for months
      break;
    case "monthly":
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(new Date());
      dateFormat = "%Y-%m-%d"; // MongoDB format for days
      intervalFn = eachDayOfInterval;
      outputFormat = "yyyy-MM-dd"; // Output format for days
      break;
    case "weekly":
      startDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start
      endDate = endOfWeek(new Date(), { weekStartsOn: 1 }); // Sunday end
      dateFormat = "%Y-%m-%d";
      intervalFn = eachDayOfInterval;
      outputFormat = "yyyy-MM-dd";
      break;
    default:
      throw new Error("Invalid dateRange value. Use 'weekly', 'monthly', or 'yearly'.");
  }

  console.log(`Fetching results from ${startDate.toISOString()} to ${endDate.toISOString()}`);

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
  ]);

  let finalResult: any;
    // Convert aggregation results into a structured object
    const groupedResults: Record<string, any> = {};
    result.forEach(({ _id, count }) => {
      const date = format(new Date(_id.date), outputFormat); // Convert to correct format safely
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

    // Ensure all intervals are included (fill missing values with 0)
    const allDates = intervalFn({ start: startDate, end: endDate }).map((d) => format(d, outputFormat));
    finalResult = allDates.map((date) => groupedResults[date] || { date, classCompleted: 0, classPending: 0, classReschedule: 0, classCancelled: 0 });


    return finalResult;
 
 
};

 export const acUpcomingClassList = async (
  academicCoachId: string
)=>{

const currentDate = new Date();
const formattedDate = currentDate.toISOString().split('T')[0];  
      const startOfDayIST = `${formattedDate}T00:00:00.000+00:00`;
      const endOfDayIST = `${formattedDate}T23:59:59.999+00:00`;

 const getUpcomingClass = await meetingschedule.find({
  ['academicCoach.academicCoachId']: academicCoachId,
     scheduledStartDate: {
          $gte: startOfDayIST,
          $lte: endOfDayIST
        }
}).sort({ scheduledFrom: 1 });

const upcomingClass: EvaluationDetails[] = getUpcomingClass.map((item: any) => ({
  academicCoach: {
    academicCoachId: item.academicCoach?.academicCoachId || '',
    name: item.academicCoach?.name || '',
    email: item.academicCoach?.email || ''
  },
  student: {
    studentId: item.student?.studentId || '',
    name: item.student?.name || '',
    email: item.student?.email || '',
    meetingLink: item.student?.meetingLink || ''
  },
  _id: item._id?.toString(),
  classType: item.classType || '',
  scheduledStartDate: item.scheduledStartDate || '',
  scheduledEndDate: item.scheduledEndDate || '',
  scheduledFrom: item.scheduledFrom || '',
  scheduledTo: item.scheduledTo || '',
  timeZone: item.timeZone || ''
}));

return upcomingClass
}
