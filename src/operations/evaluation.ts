import { badRequest } from "@hapi/boom";
import { IEvaluation, IEvaluationCreate, IStudents } from "../../types/models.types"
import EvaluationModel from "../models/evaluation"
import StudentModel from "../models/student"
import UserShiftSchedule from "../models/usershiftschedule"; // Add this import
import MeetingSchedule from "../models/calendar";
// import { Types } from "aws-sdk/clients/acm";
import SubscriptionModel from "../models/subscription"
import EmailTemplate from "../models/emailTemplate";
import { GetAllRecordsParams } from "../shared/enum";
import { commonMessages, evaluationMessages } from "../config/messages";
import { isNil } from "lodash";
import AppLogger from "../helpers/logging";
import { Types } from "mongoose";
import axios from "axios";
import { sendEmailClient } from "../shared/email";
import Course from "../models/course";
import { config } from "../config/env";
import User from "../models/users";
import StudentPortModel from "../models/alstudents";
import Stripe from 'stripe';
import PaymentDetailsModel from "../models/paymentDetails"





export interface EvaluationFilter {
  id(id: any): string;
  status: string;
  country?: string;
  course?: string;
  teacher?: string;
}


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
    let newStudent = new StudentModel(payload.student);

    if (payload.student.preferredDate?.toDateString() === new Date().toDateString()) {
        return {
            error: badRequest('Evaluation class is not allowed to current date. Select another date'),
        };
    }

    const loginUser = await User.findOne({userName: payload.createdBy,role : 'ACADEMICCOACH'}).exec();
   
    console.log("loginUser>>>>", loginUser);
    let teacherDetails: any = null;
      if(loginUser){
          newStudent.academicCoach = {

              academicCoachId: loginUser._id.toString(), // Provide a default value if undefined
              name: loginUser?.userName,                       // Provide a default value if undefined
              role: 'ACADEMICCOACH', // Provide a default value if undefined
              email: loginUser?.email // Provide a default value if undefined
          };
      }
    newStudent.firstName = payload.student.studentFirstName;
    newStudent.lastName = payload.student.studentLastName;
    newStudent.email =   payload.student.studentEmail;
    newStudent.phoneNumber = payload.student.studentPhone;
    newStudent.city = payload.student.studentCity;
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
    let createStudent;
if(!payload.student.studentId){
  createStudent = await newStudent.save()
  const id = createStudent._id
  console.log("id>>>>>>>>>", id);
  console.log("createStudent>>>>>>", createStudent);
}else if(payload.student.studentId){
  const updateInvoice = await StudentModel.findOneAndUpdate(
    { _id: new Types.ObjectId(payload.student.studentId) },
    { $set: payload.student },
    { new: true }
  ).lean();

  const updatedStudent = await updateInvoice as IStudents;
  console.log("id>>>>>>>>>", updatedStudent);
}

const subscriptonDetaails = await SubscriptionModel.findOne({
    subscriptionName: payload.subscription.subscriptionName
}).exec();
console.log("subscriptonDetaails>>>>>>", subscriptonDetaails)

    const newEvaluation = new EvaluationModel(payload);
    if(createStudent){
        newEvaluation.student = {
        studentId: createStudent.id.toString(),
        studentFirstName: createStudent.firstName,
        studentLastName: createStudent.lastName,
        studentEmail: createStudent.email,
        studentPhone: createStudent.phoneNumber,
        studentCity: createStudent.city,
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
        },
        newEvaluation.academicCoachId = createStudent.academicCoach.academicCoachId
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
   // newEvaluation.planTotalPrice = price;
   // newEvaluation.accomplishmentTime = totalHrs.toString();
   // newEvaluation.studentRate = hrsPerWeek;
    newEvaluation.expectedFinishingDate = 28
    const shiftScheduleRecord = await UserShiftSchedule.find({
      role: 'TEACHER'
}).exec();

if (shiftScheduleRecord.length > 0) {
        
  for (const shiftSchedule of shiftScheduleRecord) { // Use for...of instead of forEach
       const meetingAvailability = await MeetingSchedule.findOne({
          teacherId: shiftSchedule.teacherId,
       }) 

       if(!meetingAvailability){
        teacherDetails = {
        teacherId: shiftSchedule.teacherId,
        name: shiftSchedule.name,
        role: shiftSchedule.role,
        email: shiftSchedule.email
    };
     }

       if(meetingAvailability && shiftSchedule.startdate>=meetingAvailability.scheduledStartDate 
          && shiftSchedule.startdate>=meetingAvailability.scheduledStartDate ){
            if(meetingAvailability.scheduledFrom != shiftSchedule.fromtime || meetingAvailability.scheduledFrom != shiftSchedule.totime ){
              teacherDetails = {
                teacherId: shiftSchedule.teacherId,
                name: shiftSchedule.name,
                role: shiftSchedule.role,
                email: shiftSchedule.email
            };
           }
          }

      
  }
} 

newEvaluation.assignedTeacher = teacherDetails.name
newEvaluation.studentStatus = payload.studentStatus,
newEvaluation.classStatus = payload.classStatus,
newEvaluation.trialClassStatus = payload.trialClassStatus,
 newEvaluation.assignedTeacherId = teacherDetails.teacherId,
 newEvaluation.assignedTeacherEmail = teacherDetails.email,
console.log("studentStatus", newEvaluation.studentStatus);
console.log("class status", newEvaluation.classStatus);

const createEvaluation = await newEvaluation.save();
console.log("createEvaluation>>>",createEvaluation)

    if(newEvaluation.studentStatus == "Joined" && newEvaluation.classStatus == "Completed" ){
      await trialClassAssigned(createEvaluation, teacherDetails)
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
  id: string,
  payload: Partial<IEvaluationCreate>
): Promise<IEvaluation |  null> => {


  let updateEvaluations = EvaluationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
     { $set: payload },
      { new: true }
    ).lean();

    console.log("updateEvaluations>>>", updateEvaluations);

    const shiftScheduleRecord = await UserShiftSchedule.find({
      role: 'TEACHER'
}).exec();
let teacherDetails: any = null;
if (shiftScheduleRecord.length > 0) {
  for (const shiftSchedule of shiftScheduleRecord) { // Use for...of instead of forEach
       const meetingAvailability = await MeetingSchedule.findOne({
        teacherId: shiftSchedule.teacherId,
       }) 

       if(!meetingAvailability){
        teacherDetails = {
        teacherId: shiftSchedule.teacherId,
        name: shiftSchedule.name,
        role: shiftSchedule.role,
        email: shiftSchedule.email
    };
     }

       if(meetingAvailability && shiftSchedule.startdate>=meetingAvailability.scheduledStartDate 
          && shiftSchedule.startdate>=meetingAvailability.scheduledStartDate ){
            if(meetingAvailability.scheduledFrom != shiftSchedule.fromtime || meetingAvailability.scheduledFrom != shiftSchedule.totime ){
              teacherDetails = {
                teacherId: shiftSchedule.teacherId,
                name: shiftSchedule.name,
                role: shiftSchedule.role,
                email: shiftSchedule.email
            };
            }
          }       
  }
} 

const evaluation = await EvaluationModel.findOne({
 _id: new Types.ObjectId(id)
}).exec();

console.log("evaluation>>>", evaluation);
const updatedEvaluation = await updateEvaluations as IEvaluation; // Cast to expected type
if(payload.trialClassStatus == "COMPLETED" && payload.studentStatus == "JOINED"){
  const emailTemplate = await EmailTemplate.findOne({
    templateKey: 'Invoice',
}).exec();
console.log("emailTemplate>>>", emailTemplate);

if(emailTemplate && payload.student && payload.subscription && evaluation ){
    const emailTo = [
        { email: payload.student.studentEmail, name: payload.student.studentFirstName + ' ' + payload.student.studentLastName }
    ];
    const subject = "Invoice";
    const htmlPart = emailTemplate.templateContent.replace('<studentname>', payload.student.studentFirstName + ' ' + payload.student.studentLastName)
    .replace('<address>', payload.student.studentCity? payload.student.studentCity: " ").replace('<phonenumber>', payload.student.studentPhone.toString())
    .replace('<email>', payload.student.studentEmail ).replace('<plan>', payload.subscription.subscriptionName).replace('<coursename>', payload.student.learningInterest)
    .replace('<amount>', evaluation.planTotalPrice.toString()).replace('<adjustamount>', evaluation.planTotalPrice.toString()).replace('<subtotal>',evaluation.planTotalPrice.toString())
    .replace('<total>',evaluation.planTotalPrice.toString()).replace('<paymentLink>',updatedEvaluation.paymentLink
  );
   await sendEmailClient(emailTo, subject,htmlPart);
  const email = await sendEmailClient(emailTo, subject,htmlPart);
console.log("email>>>>",email);
}
}

    console.log("updatedEvaluation>>>",updatedEvaluation);
    return updatedEvaluation;
   
};

async function trialClassAssigned(newEvaluation: any, teacherDetails: any) {
console.log("newEvaluation>>>>", newEvaluation);
console.log("teacherDetails>>>>", teacherDetails);

  const meetingDetails = await zoomMeetingInvite();
  const zoomMailTemplate = await EmailTemplate.findOne({
    templateKey: 'trailmanagement',
}).exec();

const today = new Date();
const nextDay = new Date(today);
nextDay.setDate(today.getDate() + 1);

console.log("emailTemplate>>>>",zoomMailTemplate);
  const subject = 'Trail class';
      const htmlPart = zoomMailTemplate?.templateContent.replace('<date>', nextDay.toString()).replace('<meetingTime>', "10.00 AM").replace('<zoomlink>', meetingDetails.join_url);
      const emailTo = [
        { email: teacherDetails.email, name: teacherDetails.name}, { email: newEvaluation.student.studentEmail, name: newEvaluation.student.firstName }
    ];
    console.log("emailTo>>>>",emailTo);

      if(htmlPart){
          sendEmailClient(emailTo, subject,htmlPart);
     }
      const course = await Course.findOne({
        courseName: newEvaluation.student.learningInterest,
      });
      const CreatemeetingDetails = await MeetingSchedule.create(
        {
          academicCoach: {
          academicCoachId: null,
          name: null,
          role: null,
          email: null
          },
        teacher: {
          teacherId: teacherDetails.teacherId,
          name: teacherDetails.name,
          email: teacherDetails.email,
        },
        student: {
          studentId: newEvaluation.student.studentId,
          name: newEvaluation.student.studentFirstName + ' ' + newEvaluation.student.studentLastName,
          email: newEvaluation.student.email,
          city : newEvaluation.student.studentCity,
          country: newEvaluation.student.studentCountry
        },
        trialId: newEvaluation._id,
        subject: "Student First class",
        meetingLocation: 'Zoom',
        course: {
          courseId: course?._id,
          courseName: course?.courseName,
        },
        classType: 'Trail class',
        meetingType: 'Online',
        meetingLink: meetingDetails.join_url,
        isScheduledMeeting: true,
       scheduledStartDate: nextDay,
        scheduledEndDate: nextDay,
        scheduledFrom: "10.00 AM",
        scheduledTo: "10.30 AM",
        timeZone: newEvaluation.student.timeZone,
        description: 'Test Description',
        meetingStatus: 'Scheduled',
        studentResponse: 'Pending',
        status: 'Active',
        createdDate: new Date(),
        createdBy: newEvaluation.createdBy,
        lastUpdatedDate: new Date(),
        lastUpdatedBy: "Admin",
  });
  await CreatemeetingDetails.save();
}
async function zoomMeetingInvite() {
const token = await getZoomAccessToken();
const response = await axios.post(
 'https://api.zoom.us/v2/users/me/meetings',
  {
   topic: 'Evaluation Meeting',
    type: 2,
    start_time: "10.00", // Start in 10 minutes
    duration: 60,
    timezone: 'Asia/Kolkata',
    settings: {
      join_before_host: true,
      participant_video: true,
    },
  },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }
);
console.log("response.data.join_url>>", response.data.join_url);
console.log("response.data.start_url>>", response.data.start_url);
return {
  join_url: response.data.join_url,
  start_url: response.data.start_url,
};
}

async function getZoomAccessToken() {
let accessToken: any = null;
if (accessToken) return accessToken; // Use cached token if available
const clientId = config.zoomConfig.zoom_client_id;
const clientSecret = config.zoomConfig.zoom_client_secret;
const accountId = config.zoomConfig.zoom_account_id;
const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
const response = await axios.post(
  `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
  {},
  {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  }
);
accessToken = response.data.access_token;
console.log(">>>>",accessToken);
// Token is valid for 1 hour, so you may want to set up caching accordingly
setTimeout(() => { accessToken = null; }, response.data.expires_in * 1000);

return accessToken;
}


/**
 * Retrieves a list of all evaluation records with filters, sorting, and pagination.
 *
 * @param {GetAllRecordsParams} params - Parameters for filtering, sorting, and pagination.
 * @returns {Promise<{ totalCount: number; evaluation: IEvaluation[] }>} - The total count and list of evaluations.
 */
export const getAllEvaluationRecords = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; evaluation: IEvaluation[] }> => {
  const { academicCoachId, searchText, sortBy, sortOrder, offset, limit, filterValues } = params;

  const query: any = {
    academicCoachId,
  };

   

  if (searchText) {
    query.$or = [
      { name: { $regex: searchText, $options: "i" } },
      { email: { $regex: searchText, $options: "i" } },
    ];
  }

  if (filterValues) {
    if (filterValues.course) {
      query.course = { $in: filterValues.course };
    }
    if (filterValues.country) {
      query.country = { $in: filterValues.country };
    }
    if (filterValues.teacher) {
      query.teacher = { $in: filterValues.teacher };
    }
    if (filterValues.status) {
      query.status = { $in: filterValues.status };
    }
  }

  const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const evaluationQuery = EvaluationModel.find(query).sort(sortOptions);

  if (!isNil(offset) && !isNil(limit)) {
    const skip = Math.max(
      0,
      ((Number(offset) ?? Number(commonMessages.OFFSET)) - 1) *
      (Number(limit) ?? Number(commonMessages.LIMIT))
    );
    evaluationQuery
      .skip(skip)
      .limit(Number(limit) ?? Number(commonMessages.LIMIT));
  }
  const [evaluation, totalCount] = await Promise.all([
    evaluationQuery.exec(),
    EvaluationModel.countDocuments(query).exec(),
  ]);

 // Log successful retrieval
 AppLogger.info(evaluationMessages.GET_ALL_LIST_SUCCESS, {
  totalCount: totalCount,
});

  return { totalCount, evaluation };
};


  export const getEvaluationRecordById = async (
    id: string
  ): Promise<IEvaluation | null> => {
    return EvaluationModel.findOne({
      _id: new Types.ObjectId(id),
    }).lean();
  };
  export interface EvaluationUpdate{
    invoiceStatus: string,
    paymentStatus: string,
   

  }
  
export const updateStudentInvoice = async (  
  id: string,
  payload: Partial<EvaluationUpdate>
): Promise<IEvaluation | null> => {

  const updateInvoice = await EvaluationModel.findOneAndUpdate(
    { _id: new Types.ObjectId(id) },
    { $set: payload },
    { new: true }
  ).lean();
  const updatedEvaluation = await updateInvoice as IEvaluation; // Cast to expected type
  const savePaymentDetails = await PaymentDetailsModel.create

  console.log("updatedEvaluation>>>>>>>>>",updatedEvaluation);
  if(updatedEvaluation.invoiceStatus == "Completed" && updatedEvaluation.paymentStatus == "Paid"){
  //  createStudentPortal(updatedEvaluation);
  }

  return updatedEvaluation
}

//  async function createStudentPortal(updatedEvaluation:any) {
 
//     const specialChars = '@#$%&*!';
//     const randomNum = Math.floor(Math.random() * 1000); // Random number between 0-999
//     const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)]; // Random special character
  
//     // Generate password
//     const firstThreeChars = updatedEvaluation.student.studentFirstName.substring(0, 3); // First 3 characters of the username
//     const reversedUsername = updatedEvaluation.student.studentFirstName.split('').reverse().join(''); // Reverse the username
  
//     const password = `${firstThreeChars}${randomSpecial}${randomNum}${reversedUsername}`;

//   const createStudentPortal = await StudentPortModel.create({
//     student : {
//       studentId : updatedEvaluation.student.studentId,
//       studentEmail: updatedEvaluation.student.studentEmail,
//       studentPhone: updatedEvaluation.student.studentPhone
//     },
//     username: updatedEvaluation.student.studentFirstName,
//     password: password,
//     role: "Student",
//     status: "Active",
//     createdDate: new Date,
//     createdBy: updatedEvaluation.createdBy,
//     updatedDate: new Date
//   }
//    )

// const saveStudent = createStudentPortal.save()
//   return saveStudent;
// }
  