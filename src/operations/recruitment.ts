


import { IRecruitment, IRecruitmentCreate } from "../../types/models.types";
import RecruitModel from "../models/recruitment"
import { GetAllApplicationsRecordsParams } from "../shared/enum";
import { isNil } from "lodash";
import { commonMessages, recruitmentMessages, studentMessages } from "../config/messages";
import AppLogger from "../helpers/logging";
import { Types } from "mongoose";


export interface IRecruitmentUpdate{
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
updatedDate?: Date,
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
