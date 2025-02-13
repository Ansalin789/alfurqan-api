


import { badRequest } from "@hapi/boom";
import { IRecruitment, IRecruitmentCreate } from "../../types/models.types";
import RecruitModel from "../models/recruitment"
import UserShiftSchedule from "../models/usershiftschedule"; // Add this import
import MeetingSchedule from "../models/calendar";

/**
 * Creates a new user.
 *
 * @param {IRecruitmentCreate} payload - The data of the user to be created.
 */
export const createRecruitment = async (  payload: IRecruitmentCreate
): Promise<IRecruitment | { error: any }> => {

     const newRecruit = new RecruitModel(payload);

        if (newRecruit.applicationDate?.toDateString() === new Date().toDateString()) {
             return {
                 error: badRequest('Evaluation class is not allowed to current date. Select another date'),
             };
         }
       

     // Convert file to string (Base64 encoding)
      const savedUser = await newRecruit.save();
    
      return savedUser;
}

function validateHours(startdate: Date, enddate: Date, fromtime: string, totime: string, payload: IRecruitmentCreate) {
  throw new Error("Function not implemented.");
}
