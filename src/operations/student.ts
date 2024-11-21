import { IStudentCreate, IStudents } from "../../types/models.types";
import StudentModel from "../models/student";
import { studentMessages } from "../config/messages";
import { badRequest, Boom } from "@hapi/boom";
import UserShiftSchedule from "../models/usershiftschedule"; // Add this import
import { forEach } from "lodash";
import EmailTemplate from "../models/emailTemplate";
import { sendEmailClient } from "../shared/email";
import { role } from "../config/messages";
import axios from "axios";
import { config } from "../config/env";


/**
 * Creates a new user.
 *
 * @param {IStudentCreate} payload - The data of the user to be created.
 * @returns {Promise<Omit<IUser, 'password'>>} - A promise that resolves to the created user document.
 */
export const createStudent = async (
    payload: IStudentCreate
): Promise<IStudents | { error: any }> => {
    // Create a new instance of the UserModel with the provided data
    const newUser = await new StudentModel(payload);
    console.log("newUser>>>>",newUser);
    if (newUser.startDate?.toDateString() === new Date().toDateString()) {
        return {
            error: badRequest('Evaluation class is not allowed to current date. Select another date'),
        };
    }

    const shiftScheduleRecord = await UserShiftSchedule.find({
    });
    console.log(shiftScheduleRecord);
    let academicCoachDetails: any = null;

    if (shiftScheduleRecord.length > 0) {
        console.log(">>>>>", payload.startDate);
        console.log("<<<<<<<<<", shiftScheduleRecord);
        
        for (const shiftSchedule of shiftScheduleRecord) { // Use for...of instead of forEach
            if (payload.startDate >= shiftSchedule.startdate && payload.startDate <= shiftSchedule.enddate) {
                await validateHours(shiftSchedule.startdate, shiftSchedule.enddate, shiftSchedule.fromtime, shiftSchedule.totime, payload);
                academicCoachDetails = {
                    academicCoachId: shiftSchedule.academicCoachId,
                    name: shiftSchedule.name,
                    role: shiftSchedule.role,
                    email: shiftSchedule.email
                };
                console.log("academicCoachDetails>>>>", academicCoachDetails);
                break; // Exit the loop once a valid academic coach is found
            }
        }
    } else{
        return {error: badRequest('Academic coach not available')};
    }

    newUser.academicCoach = {
        academicCoachId: academicCoachDetails?.academicCoachId, // Provide a default value if undefined
        name: academicCoachDetails?.name,                       // Provide a default value if undefined
        role: academicCoachDetails?.role, // Provide a default value if undefined
        email: academicCoachDetails?.email // Provide a default value if undefined
    };
console.log("newUser academicCoach>>>>",newUser);
    // Ensure lastName meets the minimum length requirement
     // Set a default if invalid
    // Save the new user to the database
    const savedUser = await newUser.save();
  //   const emailTemplate = await EmailTemplate.findOne({
  //       templateKey: 'welcome_email',
  //   }).exec();
  //  console.log("emailTemplate>>>>",emailTemplate);

  //   if(emailTemplate){
  //       const emailTo = [
  //           { email: payload.email, name: payload.firstName + ' ' + payload.lastName }
  //       ];
  //       const subject = "Welcome To Alfurqan";
  //       const htmlPart = emailTemplate.templateContent.replace('<username>', payload.firstName + ' ' + payload.lastName);
  //       console.log("emailTemplate>>>>",emailTemplate);
  //       sendEmailClient(emailTo, subject,htmlPart);
  //   }

    const meetingDetails = await zoomMeetingInvite(savedUser);
    const zoomMailTemplate = await EmailTemplate.findOne({
      templateKey: 'evaluation',
  }).exec();
  console.log("emailTemplate>>>>",zoomMailTemplate);
    const subject = 'Evaluation Zoom Meeting';
        const htmlPart = zoomMailTemplate?.templateContent.replace('<date>', payload.startDate.toDateString()).replace('<meetingtime>', payload.preferredFromTime).replace('<zoomlink>', meetingDetails.join_url);
        const emailTo = [
          { email: payload.email, name: payload.firstName + ' ' + payload.lastName }, { email: savedUser.academicCoach.email, name: savedUser.academicCoach.name }
      ];

      
        if(htmlPart){
            sendEmailClient(emailTo, subject,htmlPart);
        }

    // Convert the savedUser to a plain object
    const userObject = savedUser.toObject();
    return userObject;
};


async function validateHours(shiftstartdate: Date, shiftenddate: Date, fromtime: string, totime: string, payload: IStudentCreate): Promise<any> {
        console.log(fromtime, totime, payload.startDate);

    if (!(payload.preferredFromTime >= fromtime.toString() || payload.preferredFromTime <= totime.toString()) 
    ||!(payload.preferredToTime >= fromtime.toString() || payload.preferredToTime <= totime.toString())) {
        throw new Error('Student time does not fall within the academic coach shift time');
    }
    return true;
}



async function zoomMeetingInvite(savedUser: import("mongoose").Document<unknown, {}, IStudents> & IStudents & { _id: import("mongoose").Types.ObjectId; }) {
    const token = await getZoomAccessToken();
    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        topic: 'Evaluation Meeting',
        type: 2,
        start_time: savedUser.preferredFromTime, // Start in 10 minutes
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
console.log("accountId>>>>",accountId);
console.log("clientId>>>>",clientId);
console.log("clientSecret>>>>",clientSecret);
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    console.log("auth>>>>",auth);
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

