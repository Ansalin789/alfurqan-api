


import { IRecruitment, IRecruitmentCreate } from "../../types/models.types";
import RecruitModel from "../models/recruitment"
import { GetAllApplicationsRecordsParams, GetAllTeachersRecordsParams } from "../shared/enum";
import { forEach, isNil } from "lodash";
import { applicationStatus, commonMessages, recruitmentMessages } from "../config/messages";
import AppLogger from "../helpers/logging";
import { Types } from "mongoose";
import User from "../models/users";
import EmailTemplate from "../models/emailTemplate";
import { sendEmailClient } from "../shared/email";

export interface IRecruitmentUpdate{
  supervisor:{
    supervisorId?: string;
  };
comments?: string,
applicationStatus: any,
level?: string,
quranReading?: string,
tajweed?: string,
arabicWriting?: string,
arabicSpeaking?: string,
englishSpeaking?: string,
preferedWorkingDays?: string,
overallRating?: number,
status: string,
updatedDate?: Date,
}


export interface IRecruitmentAdminUpdate{
  supervisor:{
    supervisorId?: string;
  };
    applicationStatus: string,
    status:string,
    updatedDate?: Date
 }

/**
 * Creates a new user.
 *
 * @param {IRecruitmentCreate} payload - The data of the user to be created.
 */
export const createRecruitment = async (  payload: IRecruitmentCreate
): Promise<IRecruitment | { error: any }> => {

     const newRecruit = new RecruitModel(payload);

        // if (newRecruit.applicationDate?.toDateString() === new Date().toDateString()) {
        //      return {
        //          error: badRequest('Evaluation class is not allowed to current date. Select another date'),
        //      };
        //  }
       

     // Convert file to string (Base64 encoding)
      const savedUser = await newRecruit.save();
    
      return savedUser;
}

export const getAllApplicantsRecords = async (
  params: GetAllApplicationsRecordsParams
): Promise<{ totalCount: number; applicants: IRecruitment[] }> => {
  const { searchText, offset, limit, filterValues } = params;
  const query: any = {};

 if (searchText?.trim()) {
  const escapedSearch = searchText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const searchRegex = new RegExp(escapedSearch, 'i');
  const isDate = !isNaN(Date.parse(searchText));
  const orConditions: any[] = [
    { candidateFirstName: searchRegex },
    { candidateLastName: searchRegex },
    { candidateEmail: searchRegex },
    { candidateCity: searchRegex },
    { positionApplied: searchRegex }
  ];

  // Only add phone number if searchText is a number
  if (!isNaN(Number(searchText))) {
    orConditions.push({ candidatePhoneNumber: Number(searchText) });
  }

  if (isDate) {
    const date = new Date(searchText);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);
    orConditions.push({ applicationDate: { $gte: date, $lt: nextDay } });
  }

  query.$or = orConditions;
}

// --- Application Status ---
if (filterValues?.applicationStatus) {
  const values = Array.isArray(filterValues.applicationStatus)
    ? filterValues.applicationStatus
    : [filterValues.applicationStatus];
  if (values.length > 0) {
    query.applicationStatus = { $in: values.map(v => new RegExp(`^${v}$`, "i")) };
  }
}

// --- Position Applied ---
if (filterValues?.positionApplied) {
  const values = Array.isArray(filterValues.positionApplied)
    ? filterValues.positionApplied
    : [filterValues.positionApplied];
  if (values.length > 0) {
    query.positionApplied = { $in: values.map(v => new RegExp(`^${v}$`, "i")) };
  }
}

 // Date Range
  if (
    filterValues?.dateRange?.from &&
    filterValues?.dateRange?.to &&
    !isNaN(Date.parse(filterValues.dateRange.from)) &&
    !isNaN(Date.parse(filterValues.dateRange.to))
  ) {
    const fromDate = new Date(filterValues.dateRange.from);
    const toDate = new Date(filterValues.dateRange.to);
    toDate.setHours(23, 59, 59, 999); // End of day
    query.applicationDate = {
      $gte: fromDate,
      $lte: toDate
    };
  }

  // --- Pagination ---
  const safeOffset = Math.max(1, Number(offset) || 1);
  const safeLimit = Math.max(1, Math.min(Number(limit) || 10, 100)); // Max 100/page
  const skip = (safeOffset - 1) * safeLimit;

  // --- Query Execution ---
  const [applicants, totalCount] = await Promise.all([
    RecruitModel.find(query)
      .sort({ applicationDate: -1 })
      .skip(skip)
      .limit(safeLimit)
      .lean()
      .exec(),
    RecruitModel.countDocuments(query).exec()
  ]);

  return {
    totalCount,
    applicants: applicants as IRecruitment[]
  };
};







export const getApplicantRecordById = async (
  id: string
): Promise<IRecruitment | null> => {
  return RecruitModel.findOne({
    _id: new Types.ObjectId(id),
  }).lean();
};

/**
 * Updates a candidate record in the database by its ID.
 *
 * @param {string} id - The unique ID of the candidate to update.
 * @param {Partial<IRecruitmentCreate>} payload - The fields to update in the candidate record. Only provided fields will be updated.
 * @returns {Promise<IRecruitment | null>} A promise that resolves to the updated candidate record, or null if no candidate was found.
 */
export const updateApplicantById = async (
  id: string,
  payload: Partial<IRecruitmentUpdate>
): Promise<IRecruitment | null> => {

  return RecruitModel.findOneAndUpdate(
    { _id: new Types.ObjectId(id) },
    { $set: payload },
    { new: true }
  ).lean();
};



/**
 * Updates a candidate record in the database by its ID.
 *
 * @param {string} id - The unique ID of the candidate to update.
 * @param {Partial<IRecruitmentCreate>} payload - The fields to update in the candidate record. Only provided fields will be updated.
 * @returns {Promise<IRecruitment | null>} A promise that resolves to the updated candidate record, or null if no candidate was found.
 */
export const updateApplicantByAdminId = async (
  id: string,
  payload: Partial<IRecruitmentAdminUpdate>
): Promise<IRecruitment | null> => {

let getSupervisor = await User.findOne({
_id: payload.supervisor?.supervisorId,
}).exec();

  let approvalData = await RecruitModel.findOne(
    { _id: new Types.ObjectId(id) },
  ).lean();
  let approvedData;
if(getSupervisor &&approvalData && approvalData.applicationStatus == applicationStatus.NEWAPPLICATION){
  approvalData = {
    ...approvalData,
    supervisor: {
      supervisorId: getSupervisor._id.toString(),
      supervisorName: getSupervisor.userName,
      supervisorEmail: getSupervisor.email,
      supervisorRole: getSupervisor.role[0]
    },
    status: "Active"
  }
  approvedData = await RecruitModel.findOneAndUpdate(
    { _id: new Types.ObjectId(id) },
    { $set: approvalData },
    { new: true }
  ).lean();
  
}
else if(approvalData &&  approvalData.applicationStatus == applicationStatus.SHORTLISTED || applicationStatus.SENDAPPROVAL){
    approvedData = await RecruitModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $set: payload },
      { new: true }
    ).lean();
  } 
  const updateData = approvedData as IRecruitment;
  if(updateData.applicationStatus == "APPROVED"){
    await createTeacherPortalPortal(updateData)
  }
  console.log("updateData", updateData);
  return updateData;
};

 async function createTeacherPortalPortal(updateData:any) {
 console.log("updateData>>", updateData);
    const specialChars = '@#$%&*!';
    const randomNum = Math.floor(Math.random() * 1000); // Random number between 0-999
    const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)]; // Random special character
  
    // Generate password
    const firstThreeChars = updateData.candidateFirstName.substring(0, 3); // First 3 characters of the username
    const reversedUsername = updateData.candidateFirstName.split('').reverse().join(''); // Reverse the username
  
    const password = `${firstThreeChars}${randomSpecial}${randomNum}${reversedUsername}`;

  let createStudentPortal = await User.create({
    userName: updateData.candidateFirstName,
    email:updateData.candidateEmail,
    password: password,
    profileImage: null,
    role: "TEACHER",
    gender: updateData.gender,
    status: "Active",
    createdBy: "Admin",
    createdDate: new Date,
    lastUpdatedBy: "Admin" ,   
    updatedDate: new Date
  }
   )

    const emailTemplate = await EmailTemplate.findOne({
           templateKey: 'Teacher Portal',
       }).exec();
       if(emailTemplate){
           const emailTo = [
               { email: createStudentPortal.email }
           ];
           const subject = "Welcome To Alfurqan Team";
           const htmlPart = emailTemplate.templateContent.replace('<username>', createStudentPortal.userName).replace('<password>',createStudentPortal.password );
           console.log("emailTemplate>>>>",emailTemplate);
           sendEmailClient(emailTo, subject,htmlPart);
       }

const saveStudent = createStudentPortal.save()
console.log("Student portal",saveStudent )
  return saveStudent;
};

export const getTeacherCountriesCountDetails = async() =>{

  const teacherCountByCountry = await RecruitModel.aggregate([
    {
      $match: {
        status: "Active", // Optional filter
        applicationStatus: "APPROVED"
      },
    },
    {
      $group: {
        _id: "$candidateCountry",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 }, // Optional: sort descending
    },
  ]);
  
  const teacherCount = await RecruitModel.countDocuments({
     status: "Active", // Optional filter
    applicationStatus: "APPROVED"
  }).exec();
  
  const results: any[] = [];
  
  for (const teacherCountry of teacherCountByCountry) {
    let studentCountryPercentage = ((teacherCountry.count / teacherCount) * 100).toFixed(2);
    results.push({
      country: teacherCountry._id,
      count: teacherCountry.count,
      percentage: parseFloat(studentCountryPercentage),
    });
  }
  
  
  return { teacherCount, studentCountByCountry: results };

};

export const getAllTeacherRecords  = async( params: GetAllTeachersRecordsParams
) =>{
 const { teacherGroup, supervisorId } = params;

  // Construct query object based on filters
  const query: any = {};
if(teacherGroup){
  query.positionApplied = teacherGroup
}

const teacherQuery = await RecruitModel.find({
  'supervisor.supervisorId': supervisorId,
   applicationStatus: "APPROVED",
  ...query
}).exec();

const teachers = teacherQuery.map((teacherDetails) => ({
  teacherId: teacherDetails._id,
  teacherName: `${teacherDetails.candidateFirstName} ${teacherDetails.candidateLastName}`,
  teacherEmail: teacherDetails.candidateEmail
}));

  return  { teachers };
};