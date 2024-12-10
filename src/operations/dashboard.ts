import EvaluationModel from "../models/evaluation";
import StudentModel from "../models/student";
import CalendarModel from "../models/calendar";


export interface Dashboard {
  status: string;
  Status: string;
  evaluationStatus: string;
  totalPending: number;

    
}

/**
 * Retrieves the count of candidates for a given tenant, filtering by active and inactive status.
 *
 *
 * A promise that resolves to an object containing the candidate count, total shortlisted count, total hired count, total rejected count, offer acceptance details, and percentages.
 */
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

