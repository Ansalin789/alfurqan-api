import { Types } from "mongoose";
import { IClassSchedule, IClassScheduleCreate } from "../../types/models.types";
import  ClassScheduleModel  from "../models/classShedule"
import StudentModel from "../models/alstudents";
import UserModel from "../models/users"
/**
 * Creates a new candidate record in the database.
 *
 * @param {IClassScheduleCreate} payload - The data required to create a new candidate record.
 * @returns {Promise<IClassSchedule | null>} A promise that resolves to the created candidate record, or null if the creation fails.
 */


export const updateStudentClassSchedule = async (
    id: string,
    payload: Partial<IClassScheduleCreate>
  ): Promise<(IClassSchedule | { error: any })[]> => {
    const { classDay, startTime, endTime } = payload;
  
    const results: (IClassSchedule | { error: any })[] = [];
  
    // Check if all arrays are of the same length
    if (!classDay || !startTime || !endTime || classDay.length !== startTime.length || startTime.length !== endTime.length) {
      throw new Error("classDay, startTime, and endTime arrays must be provided and have the same length.");
    }
  
    for (let i = 0; i < classDay.length; i++) {
      const day = classDay[i];
      const start = startTime[i];
      const end = endTime[i];
  
      try {

          let studentDetails = await StudentModel.findOne({
            _id: new Types.ObjectId(id)
          }).exec();
console.log("studentDetails>>>", studentDetails);
console.log("Teacher>>>",payload);
          let teacherDetails = await UserModel.findOne({
            role: "TEACHER",
            userName: payload.teacher?.teacherName
          }).exec();
          console.log("teacherDetails>>>", teacherDetails);

          const newClassSchedule = new ClassScheduleModel({
            student: {
                studentId: studentDetails?._id,
                studentFirstName: studentDetails?.username,
                studentLastName: studentDetails?.username,
                studentEmail: studentDetails?.student.studentEmail
              },
              teacher:{
                teacherId: teacherDetails?._id,
                teacherName: teacherDetails?.userName,
                teacherEmail: teacherDetails?.email
              },
            classDay: day,
            startTime: start,
            endTime: end,
            package: payload.package,
            startDate:payload.startDate,
            endDate: payload.startDate,
            createdBy: new Date(),
            status: "Active",
            scheduleStatus: "Active",
            totalHourse: payload.totalHourse,
            course: payload.course,
            preferedTeacher:payload.preferedTeacher,
           
          });
          const savedClassSchedule = await newClassSchedule.save();
          console.log("savedClassSchedule>>>>", savedClassSchedule);
          results.push(savedClassSchedule);
       // }
      } catch (error) {
        results.push({ error });
      }
    }
  console.log("results>>>",results);
    return results;
  };
  
// export const updateStudentClassSchedule = async (
//     id: string,
//     payload: Partial<IClassScheduleCreate>
//   ): Promise<IClassSchedule | { error: any }> => {
//     let updateInvoice: any
//     if(id){
//         updateInvoice = await ClassScheduleModel.findOneAndUpdate(
//             { _id: new Types.ObjectId(id) },
//             { $set: payload },
//             { new: true }
//           ).lean();
//     }
//  if(!id){
//     const newUser = new ClassScheduleModel(payload);

//     updateInvoice = await newUser.save();
//  }

//   return updateInvoice;
//   }

