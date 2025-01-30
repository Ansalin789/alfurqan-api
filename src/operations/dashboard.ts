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
    //  const count = await classShedule.countDocuments( {'teacher.teacherId': teacherId }).exec();
    //  const students = await classShedule.distinct('student.studentId', { 'teacher.teacherId': teacherId }).exec();

      // console.log("students",students.length);
    
const totalhours = await   usershiftschedule.aggregate([
  { $match: { 'teacher.teacherId': teacherId  } },
  { 
    $project: { 
      totalWorkingHours: { 
        $multiply: [ 
          { 
            $subtract: [ 
              { 
                $toDate: { 
                  $concat: [ 
                    { $substr: ["$startdate", 0, 10] }, 
                    " ", 
                    "$fromtime" 
                  ] 
                } 
              }, 
              { 
                $toDate: { 
                  $concat: [ 
                    { $substr: ["$startdate", 0, 10] }, 
                    " ", 
                    "$totime" 
                  ] 
                } 
              }
            ] 
          },
          { 
            $divide: [ 
              { $subtract: ["$enddate", "$startdate"] }, 
              86400000 
            ] 
          }
        ] 
      }
    }
  },
  
  { $group: { _id: null, totalHours: { $sum: "$duration" } } }
]).exec();
 console.log(totalhours)


      // Execute all count queries in parallel
      const [
        classesCount,
        studentsCount,
        hoursCount,
        earnings
      ] = await Promise.all([
        // Count total classes conducted by the teacher
        classShedule.countDocuments({ 'teacher.teacherId': teacherId }).exec(),
  
        // Count unique students taught by the teacher
     classShedule.distinct('student.studentId', { 'teacher.teacherId': teacherId}).then(students => {
          return students.length; // Return the length of unique students
        }),
  
        // Calculate total hours taught by the teacher (sum of 'duration' field)
        usershiftschedule.aggregate([
          { $match: { 'teacher.teacherId': teacherId  } },
          {
            $project: { 
              totalWorkingHours: { 
                $multiply: [ 
                  { 
                    $subtract: [ 
                      { 
                        $toDate: { 
                          $concat: [ 
                            { $substr: ["$startdate", 0, 10] }, 
                            " ", 
                            "$fromtime" 
                          ] 
                        } 
                      }, 
                      { 
                        $toDate: { 
                          $concat: [ 
                            { $substr: ["$startdate", 0, 10] }, 
                            " ", 
                            "$totime" 
                          ] 
                        } 
                      }
                    ] 
                  },
                  { 
                    $divide: [ 
                      { $subtract: ["$enddate", "$startdate"] }, 
                      86400000 
                    ] 
                  }
                ] 
              }
            }
          },
          { $group: { _id: null, totalHours: { $sum: "$duration" } } }
        ]).exec(),
  
        // Calculate total earnings (sum of 'earnings' field)
        classShedule.aggregate([
          { $match: { teacherId: teacherId } },
          { $group: { _id: null, totalEarnings: { $sum: "$earnings" } } }
        ]).exec()
      ]);
  
      // Ensure valid values from aggregation (if no result, set to 0)
      const totalHoursValue = hoursCount?.[0]?.totalHours || 0;
      const totalEarningsValue = earnings?.[0]?.totalEarnings || 0;
  
      // Log results for debugging purposes
      console.log("totalclasses:", classesCount);
      console.log("totalstudents:", studentsCount);
      console.log("totalhours:", totalHoursValue);
      console.log("totalearnings:", totalEarningsValue);
  
      return {
        totalclasses: classesCount, // Total number of classes
        totalstudents: studentsCount, // Total number of unique students
        totalhours: totalHoursValue, // Total hours taught by the teacher
        totalearnings: totalEarningsValue || 0 // Total earnings (default to 0 if no earnings)
      };
    } catch (error) {
      console.error("Error calculating teacher dashboard data:", error);
      throw new Error("Unable to fetch teacher dashboard data.");
    }
  };
  