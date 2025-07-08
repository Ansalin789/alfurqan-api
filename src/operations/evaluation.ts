import { badRequest } from "@hapi/boom";
import { IEvaluation, IEvaluationCreate, IMeetingSchedule, IStudents } from "../../types/models.types"
import EvaluationModel from "../models/evaluation"
import StudentModel from "../models/student"
import UserShiftSchedule from "../models/usershiftschedule"; // Add this import
import MeetingSchedule from "../models/calendar";
import SubscriptionModel from "../models/subscription"
import EmailTemplate from "../models/emailTemplate";
import { GetAllRecordsParams } from "../shared/enum";
import { commonMessages, evaluationMessages, learningInterest, teacherPosition } from "../config/messages";
import { isNil } from "lodash";
import AppLogger from "../helpers/logging";
import { Types } from "mongoose";
import axios from "axios";
import { sendEmailClient } from "../shared/email";
import Course from "../models/course";
import { config } from "../config/env";
import User from "../models/users";
import teacherAvaliableSlots from "../models/teacheravaliableslots"
import { academicAvailableTeachers } from "../kafka/producers/academicProducer";
import { teacherAvailableTimeList } from "./auth";
import { types } from "joi";
import { sendNotification } from "./notification";
import { evaluationTeacherSlotBook } from "../redis/handler/teacherSlotHander";





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

    // if (payload.student.preferredDate?.toDateString() === new Date().toDateString()) {
    //     return {
    //         error: badRequest('Evaluation class is not allowed to current date. Select another date'),
    //     };
    // }

    const loginUser = await User.findOne({_id: new Types.ObjectId(payload.academicCoachId) ,role : 'ACADEMICCOACH'}).exec();
    const teacherDetails = await User.findOne({userId: payload.teacher.teacherId,role : 'TEACHER'}).exec();

      if(loginUser){
          newStudent.academicCoach = {

              academicCoachId: loginUser.userId || " ", // Provide a default value if undefined
              name: loginUser?.userName,                       // Provide a default value if undefined
              role: 'ACADEMICCOACH', // Provide a default value if undefined
              email: loginUser?.email // Provide a default value if undefined
          };
      }
    newStudent.firstName = payload.student.studentFirstName;
    newStudent.lastName = payload.student.studentLastName;
    newStudent.email =   payload.student.studentEmail;
    newStudent.gender = payload.student.studentGender;
    newStudent.phoneNumber = payload.student.studentPhone;
    newStudent.city = payload.student.studentCity;
    newStudent.country = payload.student.studentCountry;
    newStudent.countryCode = payload.student.studentCountryCode;
    newStudent.learningInterest = payload.student.learningInterest; 
    newStudent.numberOfStudents = payload.student.numberOfStudents;
    newStudent.preferredTeacher = payload.student.preferredTeacher;
    newStudent.preferredFromTime = payload.student.preferredFromTime ?? " ";
    newStudent.preferredToTime = payload.student.preferredToTime ?? " ";
    newStudent.timeZone = payload.student.timeZone;
    newStudent.referralSource = payload.student.referralSource;
    newStudent.startDate = payload.student.preferredDate ?? new Date;
    newStudent.evaluationStatus = payload.student.evaluationStatus;
    newStudent.status = payload.student.status;
    newStudent.createdDate = new Date();
    newStudent.createdBy = payload.student.studentEmail ?? "Admin";
    let createStudent;
if(!payload.student.studentId){
  createStudent = await newStudent.save()
}else if(payload.student.studentId){
  const updateInvoice = await StudentModel.findOneAndUpdate(
    { _id: new Types.ObjectId(payload.student.studentId) },
    { $set: payload.student },
    { new: true }
  ).lean();

  await updateInvoice as IStudents;
}

const subscriptonDetaails = await SubscriptionModel.findOne({
    subscriptionName: payload.subscription.subscriptionName
}).exec();

    const newEvaluation = new EvaluationModel(payload);
    if(createStudent){
        newEvaluation.student = {
        studentId: createStudent.id.toString(),
        studentFirstName: createStudent.firstName,
        studentLastName: createStudent.lastName,
        studentEmail: createStudent.email,
        studentGender: createStudent.gender,
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
newEvaluation.teacher = {
  teacherId: teacherDetails?.userId || " ",
  teacherName: teacherDetails?.userName || " ",
  teacherEmail: teacherDetails?.email || " ",

}
newEvaluation.joiningDate = payload.joiningDate ?? new Date
newEvaluation.expectedFinishingDate = 28
newEvaluation.assignedTeacher =teacherDetails?.userName || " ";
newEvaluation.studentStatus = payload.studentStatus;
newEvaluation.classStatus = payload.classStatus;
newEvaluation.trialClassStatus = payload.trialClassStatus;
newEvaluation.assignedTeacherId = teacherDetails?.userId || " ";
newEvaluation.assignedTeacherEmail = teacherDetails?.email || " ";
newEvaluation.teacherStatus = newEvaluation.teacher.teacherName ? "Assigned": "Not Assigned";
const createEvaluation = await newEvaluation.save();
console.log("createEvaluation>>>",createEvaluation)




    if(newEvaluation.studentStatus == "JOINED" && newEvaluation.classStatus == "COMPLETED" ){

      await trialClassAssigned(createEvaluation, teacherDetails)
    }
    if (
  payload.classType === 'REGULARCLASS' &&
  newEvaluation.studentStatus === "JOINED" &&
  newEvaluation.classStatus === "COMPLETED" &&
  payload.joiningDate !== undefined &&
  payload.weeklySlots !== undefined && 
  teacherDetails?.userId !== undefined 
) {
  await evaluationTeacherSlotBook(
    payload.joiningDate.toISOString(),  
    payload.weeklySlots,               
    teacherDetails?.userId
  );
}

  
    return createEvaluation;
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

  if(payload.trialClassStatus == "COMPLETED"){
    payload.amount = "2.00"
  }

  let updateEvaluations = await EvaluationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
     { $set: payload },
      { new: true }
    ).lean();

    console.log("updateEvaluations>>>", updateEvaluations);

    const shiftScheduleRecord = await UserShiftSchedule.find({
      role: 'TEACHER'
}).exec();

// if (shiftScheduleRecord.length > 0) {
//   for (const shiftSchedule of shiftScheduleRecord) { // Use for...of instead of forEach
//        const meetingAvailability = await MeetingSchedule.findOne({
//         teacherId: shiftSchedule.teacherId,
//        }) 

//        if(!meetingAvailability){
//         teacherDetails = {
//         teacherId: shiftSchedule.teacherId,
//         name: shiftSchedule.name,
//         role: shiftSchedule.role,
//         email: shiftSchedule.email
//     };
//      }

//        if(meetingAvailability && shiftSchedule.startdate>=meetingAvailability.scheduledStartDate 
//           && shiftSchedule.startdate>=meetingAvailability.scheduledStartDate ){
//             if(meetingAvailability.scheduledFrom != shiftSchedule.fromtime || meetingAvailability.scheduledFrom != shiftSchedule.totime ){
//               teacherDetails = {
//                 teacherId: shiftSchedule.teacherId,
//                 name: shiftSchedule.name,
//                 role: shiftSchedule.role,
//                 email: shiftSchedule.email
//             };
//             }
//           }       
//   }
// } 

const evaluation = await EvaluationModel.findOne({
 _id: new Types.ObjectId(id)
}).exec();

const updatedEvaluation = await updateEvaluations as IEvaluation; // Cast to expected type
if(payload.trialClassStatus == "COMPLETED" && payload.studentStatus == "JOINED"){
  const emailTemplate = await EmailTemplate.findOne({
    templateKey: 'Invoice',
}).exec();

if(emailTemplate && payload.student && payload.subscription && evaluation ){
    const emailTo = [
        { email: payload.student.studentEmail }
    ];
    

    const subject = "Invoice";
    const htmlPart = emailTemplate.templateContent.replace('<studentname>', payload.student.studentFirstName + ' ' + payload.student.studentLastName)
    .replace('<address>', payload.student.studentCity? payload.student.studentCity: " ").replace('<phonenumber>', payload.student.studentPhone.toString())
    .replace('<email>', payload.student.studentEmail ).replace('<plan>', payload.subscription.subscriptionName).replace('<coursename>', payload.student.learningInterest)
    .replace('<amount>', evaluation.planTotalPrice.toString()).replace('<adjustamount>', evaluation.planTotalPrice.toString()).replace('<subtotal>',evaluation.planTotalPrice.toString())
    .replace('<total>',evaluation.planTotalPrice.toString()).replace('<paymentLink>',updatedEvaluation.paymentLink
  );
   const email = await sendEmailClient(emailTo, subject,htmlPart);
   console.log(">>>>>>>>>>>>",email);

}
}

    return updatedEvaluation;
   
};

async function trialClassAssigned(createEvaluation: any, teacherDetails: any) {

//const meetingTiming = await getTeacherAvaialbleTime()

const today = new Date();
const nextDay = new Date(today);
nextDay.setDate(today.getDate() + 1);
const formattedDate = nextDay.toISOString().split('T')[0];
let alfTeacherPosition;

if(createEvaluation.student.learningInterest == learningInterest.QURAN ){
  alfTeacherPosition = teacherPosition.QURANTEACHER
}else if(createEvaluation.student.learningInterest == learningInterest.ISLAMIC){
  alfTeacherPosition = teacherPosition.ISLAMICTEACHER
}else{
  alfTeacherPosition = teacherPosition.ARABICTEACHER
}
 let availableTeacher;
 console.log(">>>>",createEvaluation.teacher.teacherId );
  console.log("formattedDate",formattedDate );
  console.log("alfTeacherPosition",alfTeacherPosition );
let availableTeacherId; 
let teacherEmail;
if(createEvaluation.teacher.teacherId == " "){
 availableTeacher = await teacherAvailableTimeList(formattedDate,alfTeacherPosition );
 availableTeacherId = availableTeacher[0].teacherId;
 teacherEmail = await User.findOne({userId: availableTeacherId})
}else{
  availableTeacherId = createEvaluation.teacher.teacherId;
  teacherEmail = teacherDetails;
}

console.log("availableTeacher>>>", availableTeacher? availableTeacher[0] : " " );

const getTrailclass = await teacherAvaliableSlots.find({
teacherId: availableTeacherId,
isStatus: true,
date: formattedDate.toString()
}).exec();

console.log("getTrailclass>>", getTrailclass[0]);
  const meetingDetails = await zoomMeetingInvite(createEvaluation, getTrailclass);
  const zoomMailTemplate = await EmailTemplate.findOne({
    templateKey: 'trailmanagement',
}).exec();

  const subject = 'Trail class';
      const htmlPart = zoomMailTemplate?.templateContent.replace('<date>', getTrailclass[0].date).replace('<meetingTime>', getTrailclass[0].from).replace('<zoomlink>', meetingDetails.join_url);
      const emailTo = [
        { email: teacherEmail.email}, { email: createEvaluation.student.studentEmail }
    ];
      if(htmlPart){
          sendEmailClient(emailTo, subject,htmlPart);
     }
      const course = await Course.findOne({
        courseName: createEvaluation.student.learningInterest,
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
          teacherId: teacherEmail.userId,
          name: teacherEmail.userName,
          email: teacherEmail.email,
        },
        student: {
          studentId: createEvaluation.student.studentId,
          name: createEvaluation.student.studentFirstName + ' ' + createEvaluation.student.studentLastName,
          email: createEvaluation.student.studentEmail,
          city : createEvaluation.student.studentCity,
          country: createEvaluation.student.studentCountry,
          phonenumber: createEvaluation.student.studentPhone
        },
        trialId: createEvaluation._id,
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
        scheduledFrom: getTrailclass[0].from,
        scheduledTo: getTrailclass[0].to,
        timeZone: createEvaluation.student.timeZone,
        description: 'Test Description',
        meetingStatus: 'Scheduled',
        studentResponse: 'PENDING',
        status: 'Active',
        createdDate: new Date(),
        createdBy: createEvaluation.createdBy,
        lastUpdatedDate: new Date(),
        lastUpdatedBy: "Admin",
  });
 await CreatemeetingDetails.save();

 
await sendNotification({
  messages: `${createEvaluation.student.studentFirstName} ${createEvaluation.student.studentLastName} has been assigned to you for a trial class.`,
  senderId: createEvaluation.academicCoachId?.toString() ?? "system",
  senderName: createEvaluation.academicCoachName ?? "system",
  senderEmail: createEvaluation.createdBy,
  isRead: false,
  receiverId: [teacherDetails.userId],
  receiverName: [teacherDetails.userName],
  receiverEmail: [teacherDetails.email],
  notificationType: "TEACHER_NOTIFICATION",
  notificationStatus: "Unseen",
  status: "active",
  createdBy: "system",
  updatedBy: "system",
});


  if(CreatemeetingDetails){
    const teacherId = CreatemeetingDetails.teacher.teacherId;
    const from = CreatemeetingDetails.scheduledFrom;
    const to = CreatemeetingDetails.scheduledTo;
    await academicAvailableTeachers({event : "update" , data : {nextDay, teacherId, from , to}});
  }
}



async function zoomMeetingInvite(newEvaluation: any, getTrailclass: any) {
const token = await getZoomAccessToken();
const response = await axios.post(
 'https://api.zoom.us/v2/users/me/meetings',
  {
   topic: 'Teacher Meeting',
    type: 2,
    start_time: getTrailclass[0].from, // Start in 10 minutes
    duration: 60,
    timezone: newEvaluation.student.timeZone,
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

  const query: any = {};

  // ✅ Only add academicCoachId to query if it is provided
  if (academicCoachId) {
    query.academicCoachId = academicCoachId;
  }

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

  AppLogger.info(evaluationMessages.GET_ALL_LIST_SUCCESS, {
    totalCount: totalCount,
  });

  return { totalCount, evaluation };
};

//evaluationRecordBYId
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
  return updatedEvaluation
};

export const getTotalTrialClassRequestCount = async() => {
  const evaluationStats = await EvaluationModel.aggregate([
    {
      $match: {
        status: "Active",
      },
    },
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        maleCount: { $sum: { $cond: [{ $eq: ["$student.studentGender", "male"] }, 1, 0] } },
        femaleCount: { $sum: { $cond: [{ $eq: ["$student.studentGender", "female"] }, 1, 0] } },
        completedCount: { $sum: { $cond: [{ $eq: ["$trialClassStatus", "COMPLETED"] }, 1, 0] } },
        pendingCount: { $sum: { $cond: [{ $eq: ["$trialClassStatus", "PENDING"] }, 1, 0] } },
        studentJointCount: { $sum: { $cond: [{ $eq: ["$studentStatus", "JOINED"] }, 1, 0] } },
        studentNotJointCount: { $sum: { $cond: [{ $eq: ["$studentStatus", "NOTJOINED"] }, 1, 0] } },

      },
    },
  ]);
  
  return evaluationStats;
  
};

export const getTeacherStatusCount = async() =>{
  const evaluationStats = await EvaluationModel.aggregate([
    {
      $match: {
        status: "Active",
      },
    },
    {
      $group: {
        _id: null,
        totalClassCount: { $sum: 1 },
        assignedTeacherCount: { $sum: { $cond: [{ $eq: ["$teacherStatus", "Assigned"] }, 1, 0] } },
        notAssinedCount: { $sum: { $cond: [{ $eq: ["$teacherStatus", "Not Assigned"] }, 1, 0] } },
      },
    },
  ]);
   const assignedTeacherPercentage = ((evaluationStats[0].assignedTeacherCount/ evaluationStats[0].totalClassCount)*100).toFixed(2);
   const notAssignedTeacherPercentage = ((evaluationStats[0].notAssinedCount/ evaluationStats[0].totalClassCount)*100).toFixed(2);
   const total = evaluationStats[0].totalClassCount;

  return {total, assignedTeacherPercentage, notAssignedTeacherPercentage};

};

export const getPreferedTeacherPercentage = async() =>{
    const preferedTeahcer= await EvaluationModel.aggregate([
      {
        $match: {
          status: "Active",
        },
      },
      {
        $group: {
          _id: null,
          preferedTeacherCount: { $sum: 1 },
          preferedTeacherMaleCount: { $sum: { $cond: [{ $eq: ["$student.preferredTeacher", "Male"] }, 1, 0] } },
          preferedTeacherFemaleCount: { $sum: { $cond: [{ $eq: ["$student.preferredTeacher", "Female"] }, 1, 0] } },
        },
      },
    ]);
     const preferedTeacherPercentage = preferedTeahcer[0].preferedTeacherCount;
     const preferedTeacherMalePercentage = ((preferedTeahcer[0].preferedTeacherMaleCount/ preferedTeahcer[0].preferedTeacherCount)*100).toFixed(2);
     const preferedTeacherFemalePercentage = ((preferedTeahcer[0].preferedTeacherFemaleCount/ preferedTeahcer[0].preferedTeacherCount)*100).toFixed(2);

    return {preferedTeacherPercentage, preferedTeacherMalePercentage, preferedTeacherFemalePercentage};
};

export const getStudentCourseCount  = async() =>{
  const studentCourseCount= await EvaluationModel.aggregate([
    {
      $match: {
        status: "Active",
      },
    },
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        quranCount: { $sum: { $cond: [{ $eq: ["$student.learningInterest", "Quran"] }, 1, 0] } },
        arabicCount: { $sum: { $cond: [{ $eq: ["$student.learningInterest", "Islamic Studies"] }, 1, 0] } },
        islamicCount: { $sum: { $cond: [{ $eq: ["$student.learningInterest", "Arabic"] }, 1, 0] } },

      },
    },
  ]);
   const totalPercentage = studentCourseCount[0].totalCount;
   const quranPercentage = ((studentCourseCount[0].quranCount/ studentCourseCount[0].totalCount)*100).toFixed(2);
   const arabicPercentage = ((studentCourseCount[0].arabicCount/ studentCourseCount[0].totalCount)*100).toFixed(2);
   const islamicPercentage = ((studentCourseCount[0].islamicCount/ studentCourseCount[0].totalCount)*100).toFixed(2);

  return {totalPercentage, quranPercentage, arabicPercentage, islamicPercentage};
};

export const getCountriesCount = async() =>{

  const studentCountByCountry = await EvaluationModel.aggregate([
    {
      $match: {
        status: "Active", // Optional filter
      },
    },
    {
      $group: {
        _id: "$student.studentCountry",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 }, // Optional: sort descending
    },
  ]);
  
  const evaluationCount = await EvaluationModel.countDocuments({
    status: "Active",
  }).exec();
  
  const results: any[] = [];
  
  for (const studentCountry of studentCountByCountry) {
    let studentCountryPercentage = ((studentCountry.count / evaluationCount) * 100).toFixed(2);
    results.push({
      country: studentCountry._id,
      count: studentCountry.count,
      percentage: parseFloat(studentCountryPercentage),
    });
  }
  
  
  return { evaluationCount, studentCountByCountry: results };

};

export const getTrialbyTeacherCount = async()=>{

  const studentCountByCountry = await EvaluationModel.aggregate([
    {
      $match: {
        status: "Active", // Optional filter
      },
    },
    {
      $group: {
        _id: "$teacher.teacherName",
        trialCount: { $sum: 1 },
        joined: { $sum: { $cond: [{ $eq: ["$trialClassStatus", "PENDING"] }, 1, 0] } },
      },
    },
    {
      $sort: { count: -1 }, // Optional: sort descending
    },
  ]);
  
  return  studentCountByCountry ;
  
};


export const getTrialClassCount = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; evaluation: IEvaluation[] }> => {
  const {trialClassStatus, searchText, sortBy, sortOrder, offset, limit, filterValues } = params;

  const query: any = {};

  if (searchText) {
    query.$or = [
      { name: { $regex: searchText, $options: "i" } },
      { email: { $regex: searchText, $options: "i" } },
    ];
  }

  if(trialClassStatus){
    query.trialClassStatus = { $in: trialClassStatus };
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

  AppLogger.info(evaluationMessages.GET_ALL_LIST_SUCCESS, {
    totalCount: totalCount,
  });

  return { totalCount, evaluation };
};

//evaluationRecordBYId
  export const getTrialClassRecordById = async (
    teacherId : string
  ) => {

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];  
    console.log("formattedDate", formattedDate);
      const startOfDayIST = `${formattedDate}T00:00:00.000+00:00`;
      const endOfDayIST = `${formattedDate}T23:59:59.999+00:00`;
   const trialClass = await MeetingSchedule.find({
      ['teacher.teacherId']:teacherId ,
      scheduledStartDate:  {
          $gte: startOfDayIST,
          $lte: endOfDayIST
        }
    }).sort({ scheduledFrom: 1 });
    let getTrialsClassstatus;
    for (const trialClassUpdateDetails of trialClass){
     getTrialsClassstatus  = await EvaluationModel.findOne({_id: new Types.ObjectId(trialClassUpdateDetails.trialId)});
    }
if(getTrialsClassstatus && getTrialsClassstatus.trialClassStatus == ""){
     const trialClass = await MeetingSchedule.find({
     trialId: getTrialsClassstatus._id.toString() ,
      scheduledStartDate:  {
          $gte: startOfDayIST,
          $lte: endOfDayIST
        }
    }).sort({ scheduledFrom: 1 });
    return trialClass || "";
}else{
return {result: "No data found"};
}
  };

// async function getTeacherAvaialbleTime() {
 
// const getAvailableTime = await MeetingSchedule.find({
//   classType: "Trail class"
// }).exec();


// }

