import EvaluationModel from "../models/evaluation";
import StudentModel from "../models/student";
import CalendarModel from "../models/calendar";
import classShedule from "../models/classShedule";
import usershiftschedule from "../models/usershiftschedule";


export interface Dashboard {
  status: string;
  Status: string;
  evaluationStatus: string;
  totalPending: number;    
}

export const dashboardWidgetCounts = async (p0: string
): Promise<{
    classtype: number;
    status: number;
    totalPending: number;
    totalActive: number;
  }> => {
    // Execute all count queries in parallel
    const [
      classtype,
      evaluationStatusCount,
      pendingCount,
      activeCount
    ] = await Promise.all([
      // Count candidates with meeting status
      CalendarModel.countDocuments({
        classType: 'Trail class'  // Changed from 'Trail class' to 'Trial class' and classtype to classType
      }).exec(),
      // Count candidates with evaluation status
      EvaluationModel.countDocuments({
        status: 'active'  // Changed to uppercase if that's how it's stored in DB
      }).exec(),
      // Count pending candidates from job profiling
      StudentModel.countDocuments({
        evaluationStatus: 'PENDING'  // adjust status as per your enum
      }).exec(),

      // Count active candidates
      StudentModel.countDocuments({
        status: { $in: ['ACTIVE', 'INACTIVE'] }  // Changed to uppercase if that's how it's stored in DB
      }).exec()
    ]);
    console.log( 'meetingStatusCount',classtype);
    console.log( 'evaluationStatusCount',evaluationStatusCount);
    console.log( 'pendingCount',pendingCount);
    console.log( 'activeCount',activeCount);  
    return {
      classtype: classtype,
      status: evaluationStatusCount,
      totalPending: pendingCount,
      totalActive: 10
    };
  };





 //Student dashboard
export const dashboardWidgetStudentCounts = async (studentId: string): Promise<{
  totalLevel: number;
  totalAttendance: number;
  totalClasses: number;
  totalDuration: number;
}> => {
  // Fetch counts in parallel
  const [levelCount, attendanceCount, classCount, totalDuration] = await Promise.all([
    classShedule.countDocuments({ studentId: studentId }).exec(),
    classShedule.countDocuments({ studentId: studentId }).exec(),
    classShedule.countDocuments({ 'studentId.studentId': studentId }).exec(),
    classShedule.aggregate([
      { $match: { studentId: studentId } }, 
      { $group: { _id: null, totalDuration: { $sum: '$duration' } } }
    ]).exec(),
  ]);

  // Extract total duration value
  const totalDurationValue = totalDuration?.[0]?.totalDuration || 0;

  // Total sum excluding levelCount (since we fix it at 10%)
  const remainingTotal = attendanceCount + classCount + totalDurationValue;

  // Avoid division by zero
  const distributePercentage = (value: number) => (remainingTotal > 0 ? (value / remainingTotal) * 90 : 0);

  return {
    totalLevel: 10, // Fixed at 10%
    totalAttendance: distributePercentage(attendanceCount),
    totalClasses: distributePercentage(classCount),
    totalDuration: 20,
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
  
      // Log results for debugging purposes
      console.log("totalclasses:", classesCount);
      console.log("totalstudents:", studentsCount);
      console.log("totalhours:", totalHoursValue);
      console.log("totalearnings:", totalEarningsValue);
  
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
  