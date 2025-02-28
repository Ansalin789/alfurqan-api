


import { IRecruitment, IRecruitmentCreate } from "../../types/models.types";
import RecruitModel from "../models/recruitment"
import { GetAllApplicationsRecordsParams } from "../shared/enum";
import { isNil } from "lodash";
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
  const { searchText,  sortBy,
    sortOrder,offset, limit, filterValues } = params;

  // Construct query object based on filters
  const query: any = {};


  // Add searchText to the query if provided
  if (searchText) {
    query.$or = [
      { name: { $regex: searchText, $options: "i" } }, // Search by name
      { email: { $regex: searchText, $options: "i" } }, // Search by email (if applicable)
    ];
  }

  // Add filters to the query
  if (filterValues) {
    console.log("Filter Values:", filterValues); // Log filter values
    if (filterValues.applicationStatus) {
      query.applicationStatus = { $in: filterValues.applicationStatus }; // Filter by course
    }
  }
  
  console.log("Constructed Query:", JSON.stringify(query, null, 2)); // Log the constructed query

  const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const studentQuery = RecruitModel.find(query).sort(sortOptions);

  
  if (!isNil(offset) && !isNil(limit)) {
    const skip = Math.max(
      0,
      ((Number(offset) ?? Number(commonMessages.OFFSET)) - 1) *
      (Number(limit) ?? Number(commonMessages.LIMIT))
    );
    studentQuery
      .skip(skip)
      .limit(Number(limit) ?? Number(commonMessages.LIMIT));
  }

  // Use Promise.all to perform both query and count operations concurrently
  const [applicants, totalCount] = await Promise.all([
    // Fetch students with pagination
    studentQuery.exec(),
    // Count total records for the query
    RecruitModel.countDocuments(query).exec(),
  ]);

  // Log successful retrieval
  AppLogger.info(recruitmentMessages.GET_ALL_LIST_SUCCESS, {
    totalCount: totalCount,
  });

  // Return total count and fetched students
  return { totalCount, applicants };
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
    role: "SUPERVISOR",
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
               { email: createStudentPortal.email, name: createStudentPortal.userName  }
           ];
           const subject = "Welcome To Alfurqan Team";
           const htmlPart = emailTemplate.templateContent.replace('<username>', createStudentPortal.userName).replace('<password>',createStudentPortal.password );
         //  console.log("emailTemplate>>>>",emailTemplate);
           sendEmailClient(emailTo, subject,htmlPart);
       }

const saveStudent = createStudentPortal.save()
console.log("Student portal",saveStudent )
  return saveStudent;
}