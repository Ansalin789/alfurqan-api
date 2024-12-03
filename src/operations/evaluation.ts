import { badRequest } from "@hapi/boom";
import { IEvaluation, IEvaluationCreate } from "../../types/models.types"
import EvaluationModel from "../models/evaluation"
import StudentModel from "../models/student"
import UserShiftSchedule from "../models/usershiftschedule"; // Add this import
import MeetingSchedule from "../models/calendar";
import { Types } from "aws-sdk/clients/acm";
import SubscriptionModel from "../models/subscription"
import EmailTemplate from "../models/emailTemplate";




/**
 * Creates a new candidate record in the database.
 *
 * @param {IEvaluationCreate} payload - The data required to create a new candidate record.
 * @param {IStudentCreate} studentpayload - The course id
 * @returns {Promise<IEvaluation | null>} A promise that resolves to the created candidate record, or null if the creation fails.
 */
export const createEvaluationRecord = async (
    payload: IEvaluationCreate
  ): Promise<IEvaluation | { error: any }> => {
    const newStudent = new StudentModel(payload.student);

    if (payload.student.preferredDate?.toDateString() === new Date().toDateString()) {
        return {
            error: badRequest('Evaluation class is not allowed to current date. Select another date'),
        };
    }

    const shiftScheduleRecord = await UserShiftSchedule.find({
    });
    console.log(shiftScheduleRecord);
    let academicCoachDetails: any = null;

    if (shiftScheduleRecord.length > 0) {
        
        for (const shiftSchedule of shiftScheduleRecord) { // Use for...of instead of forEach
            if (payload.classStartDate >= shiftSchedule.startdate && payload.classStartDate <= shiftSchedule.enddate) {
             const meetingAvailability = await MeetingSchedule.findOne({
                academicCoachId: shiftSchedule.academicCoachId,
                startDate: shiftSchedule.startdate,
                endDate: shiftSchedule.enddate, 
                fromtime: shiftSchedule.fromtime,
                totime: shiftSchedule.totime,
             }) 
             if(!meetingAvailability){
              academicCoachDetails = {
                academicCoachId: shiftSchedule.academicCoachId,
                name: shiftSchedule.name,
                role: shiftSchedule.role,
                email: shiftSchedule.email
            };
            console.log("academicCoachDetails>>>>", academicCoachDetails);
             }
                break; // Exit the loop once a valid academic coach is found
            }
        }
    } else{
        return {error: badRequest('Academic coach not available')};
    }

    newStudent.firstName = payload.student.studentFirstName;
    newStudent.lastName = payload.student.studentLastName;
    newStudent.email =   payload.student.studentEmail;
    newStudent.phoneNumber = payload.student.studentPhone;
    newStudent.country = payload.student.studentCountry;
    newStudent.countryCode = payload.student.studentCountryCode;
    newStudent.learningInterest = payload.student.learningInterest; 
    newStudent.numberOfStudents = payload.student.numberOfStudents;
    newStudent.preferredTeacher = payload.student.preferredTeacher;
    newStudent.preferredFromTime = payload.student.preferredFromTime || " ";
    newStudent.preferredToTime = payload.student.preferredToTime || " ";
    newStudent.timeZone = payload.student.timeZone;
    newStudent.referralSource = payload.student.referralSource;
    newStudent.startDate = payload.student.preferredDate || new Date;
    newStudent.evaluationStatus = payload.student.evaluationStatus;
    newStudent.status = payload.student.status;
    newStudent.createdDate = new Date();
    newStudent.createdBy = payload.student.studentEmail || "Admin";

    newStudent.academicCoach = {
        academicCoachId: academicCoachDetails?.academicCoachId, // Provide a default value if undefined
        name: academicCoachDetails?.name,                       // Provide a default value if undefined
        role: academicCoachDetails?.role, // Provide a default value if undefined
        email: academicCoachDetails?.email // Provide a default value if undefined
    };

const createStudent = await newStudent.save()
    const id = createStudent._id
    console.log("id>>>>>>>>>", id);
    console.log("createStudent>>>>>>", createStudent);
const subscriptonDetaails = await SubscriptionModel.findOne({
    subscriptionName: payload.subscription.subscriptionName
}).exec();
console.log("subscriptonDetaails>>>>>>", subscriptonDetaails)

    const newEvaluation = new EvaluationModel(payload);
    if(createStudent){
        newEvaluation.student = {
        studentId: id.toString(),
        studentFirstName: createStudent.firstName,
        studentLastName: createStudent.lastName,
        studentEmail: createStudent.email,
        studentPhone: createStudent.phoneNumber,
        studentCountry: createStudent.country,
        studentCountryCode: createStudent.countryCode,
        learningInterest: createStudent.learningInterest,
        numberOfStudents: createStudent.numberOfStudents,
        preferredTeacher: createStudent.preferredTeacher,
        preferredFromTime: createStudent.preferredFromTime,
        preferredToTime: createStudent.preferredToTime,
        timeZone: createStudent.timeZone,
        referralSource: createStudent.referralSource,
        preferredDate: createStudent.startDate,
        evaluationStatus: createStudent.evaluationStatus,
        status: createStudent.status,
        createdDate: new Date(),
        createdBy: createStudent.createdBy
        }
    }
    if (subscriptonDetaails) {
        newEvaluation.subscription = {
            subscriptionId: subscriptonDetaails?.id.toString(),
            subscriptionName: subscriptonDetaails?.subscriptionName,
            subscriptionPricePerHr: subscriptonDetaails?.subscriptionPricePerHr,
            subscriptionDays: subscriptonDetaails?.subscriptionDays,
            subscriptionStartDate: new Date() ,
            subscriptionEndDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000) 
        };
    }
    const price = payload.hours* newEvaluation.subscription.subscriptionPricePerHr
   const totalHrs = payload.hours* 28;
   const hrsPerWeek = payload.hours;
    newEvaluation.planTotalPrice = price;
    newEvaluation.accomplishmentTime = totalHrs.toString();
    newEvaluation.studentRate = hrsPerWeek;
    newEvaluation.expectedFinishingDate = 28

    if(newEvaluation.studentStatus == "Joined" && newEvaluation.classStatus == "Completed" ){
      //  await trialClassAssigned(newEvaluation)
    }
   

    return newEvaluation.save();
  };


/**
 * Creates a new user.
 *
 * @param {IEvaluationCreate} payload - The data of the user to be created.
 * @returns {Promise<IEvaluation>} - A promise that resolves to the created user document.
 */
export const updateStudentEvaluation = async (
    payload: IEvaluationCreate
): Promise<IEvaluation | { error: any }> => {
    
    const evaluation = await EvaluationModel.findOneAndUpdate({
    }, payload, { new: true });
    return { error: "Not implemented" }; // Placeholder return value

}

// async function trialClassAssigned(newEvaluation: any) {
//     const meetingDetails = await zoomMeetingInvite(newEvaluation);
//     const zoomMailTemplate = await EmailTemplate.findOne({
//       templateKey: 'evaluation',
//   }).exec();
//   //console.log("emailTemplate>>>>",zoomMailTemplate);
//     const subject = 'Evaluation Zoom Meeting';
//         const htmlPart = zoomMailTemplate?.templateContent.replace('<date>', payload.startDate.toDateString()).replace('<meetingtime>', payload.preferredFromTime).replace('<zoomlink>', meetingDetails.join_url);
//         const emailTo = [
//           { email: payload.email, name: payload.firstName + ' ' + payload.lastName }, { email: savedUser.academicCoach.email, name: savedUser.academicCoach.name }
//       ];

      
//         if(htmlPart){
//             sendEmailClient(emailTo, subject,htmlPart);
//         }
//         const course = await Course.findOne({
//           courseName: payload.learningInterest,
//         });
//         const CreatemeetingDetails = await MeetingSchedule.create(
//           {
//             academicCoach: {
//             academicCoachId: academicCoachDetails?.academicCoachId,
//             name: academicCoachDetails?.name,
//             role: academicCoachDetails?.role,
//             email: academicCoachDetails?.email
//             },
//           teacher: {
//             teacherId: null,
//             name: null,
//             email: null,
//           },
//           student: {
//             studentId: savedUser._id,
//             name: savedUser.firstName + ' ' + savedUser.lastName,
//             email: savedUser.email
//           },
//           subject: "Student Evaluation",
//           meetingLocation: 'Zoom',
//           course: {
//             courseId: course?._id,
//             courseName: course?.courseName,
//           },
//           classType: 'Evaluation',
//           meetingType: 'Online',
//           meetingLink: meetingDetails.join_url,
//           isScheduledMeeting: true,
//           scheduledStartDate: savedUser.startDate,
//           scheduledEndDate: savedUser.startDate,
//           scheduledFrom: savedUser.preferredFromTime,
//           scheduledTo: savedUser.preferredToTime,
//           timeZone: savedUser.timeZone,
//           description: 'Test Description',
//           meetingStatus: 'Scheduled',
//           studentResponse: 'Pending',
//           status: 'Active',
//           createdDate: new Date(),
//           createdBy: savedUser.firstName + ' ' + savedUser.lastName,
//           lastUpdatedDate: new Date(),
//           lastUpdatedBy: savedUser.firstName + ' ' + savedUser.lastName,
//     });
//     const userObject = savedUser.toObject();
//     await CreatemeetingDetails.save();
// }
// function zoomMeetingInvite(newEvaluation: any) {
//     throw new Error("Function not implemented.");
// }

