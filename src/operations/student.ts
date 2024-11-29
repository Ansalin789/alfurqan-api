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
import MeetingSchedule from "../models/calendar";
import Course from "../models/course";

/**
 * Creates a new user.
 *
 * @param {IStudentCreate} payload - The data of the user to be created.
 * @returns {Promise<Omit<IUser, 'password'>>} - A promise that resolves to the created user document.
 */
export const createStudent = async (
    payload: IStudentCreate
): Promise<IStudents | { error: any }> => {
    const newUser = await new StudentModel(payload);
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
        
        for (const shiftSchedule of shiftScheduleRecord) { // Use for...of instead of forEach
            if (payload.startDate >= shiftSchedule.startdate && payload.startDate <= shiftSchedule.enddate) {
                await validateHours(shiftSchedule.startdate, shiftSchedule.enddate, shiftSchedule.fromtime, shiftSchedule.totime, payload);
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

    newUser.academicCoach = {
        academicCoachId: academicCoachDetails?.academicCoachId, // Provide a default value if undefined
        name: academicCoachDetails?.name,                       // Provide a default value if undefined
        role: academicCoachDetails?.role, // Provide a default value if undefined
        email: academicCoachDetails?.email // Provide a default value if undefined
    };
console.log("newUser academicCoach>>>>",newUser);
    const savedUser = await newUser.save();
  
    const emailTemplate = await EmailTemplate.findOne({
        templateKey: 'welcome_email',
    }).exec();
    if(emailTemplate){
        const emailTo = [
            { email: payload.email, name: payload.firstName + ' ' + payload.lastName }
        ];
        const subject = "Welcome To Alfurqan";
        const htmlPart = emailTemplate.templateContent.replace('<username>', payload.firstName + ' ' + payload.lastName);
      //  console.log("emailTemplate>>>>",emailTemplate);
        sendEmailClient(emailTo, subject,htmlPart);
    }

    const meetingDetails = await zoomMeetingInvite(savedUser);
    const zoomMailTemplate = await EmailTemplate.findOne({
      templateKey: 'evaluation',
  }).exec();
  //console.log("emailTemplate>>>>",zoomMailTemplate);
    const subject = 'Evaluation Zoom Meeting';
        const htmlPart = zoomMailTemplate?.templateContent.replace('<date>', payload.startDate.toDateString()).replace('<meetingtime>', payload.preferredFromTime).replace('<zoomlink>', meetingDetails.join_url);
        const emailTo = [
          { email: payload.email, name: payload.firstName + ' ' + payload.lastName }, { email: savedUser.academicCoach.email, name: savedUser.academicCoach.name }
      ];

      
        if(htmlPart){
            sendEmailClient(emailTo, subject,htmlPart);
        }
        const course = await Course.findOne({
          courseName: payload.learningInterest,
        });
        const CreatemeetingDetails = await MeetingSchedule.create(
          {
            academicCoach: {
            academicCoachId: academicCoachDetails?.academicCoachId,
            name: academicCoachDetails?.name,
            role: academicCoachDetails?.role,
            email: academicCoachDetails?.email
            },
          teacher: {
            teacherId: null,
            name: null,
            email: null,
          },
          student: {
            studentId: savedUser._id,
            name: savedUser.firstName + ' ' + savedUser.lastName,
            email: savedUser.email
          },
          subject: "Student Evaluation",
          meetingLocation: 'Zoom',
          course: {
            courseId: course?._id,
            courseName: course?.courseName,
          },
          classType: 'Evaluation',
          meetingType: 'Online',
          meetingLink: meetingDetails.join_url,
          isScheduledMeeting: true,
          scheduledStartDate: savedUser.startDate,
          scheduledEndDate: savedUser.startDate,
          scheduledFrom: savedUser.preferredFromTime,
          scheduledTo: savedUser.preferredToTime,
          timeZone: savedUser.timeZone,
          description: 'Test Description',
          meetingStatus: 'Scheduled',
          studentResponse: 'Pending',
          status: 'Active',
          createdDate: new Date(),
          createdBy: savedUser.firstName + ' ' + savedUser.lastName,
          lastUpdatedDate: new Date(),
          lastUpdatedBy: savedUser.firstName + ' ' + savedUser.lastName,
    });
    const userObject = savedUser.toObject();
    await CreatemeetingDetails.save();
    return userObject;
};


async function validateHours(shiftstartdate: Date, shiftenddate: Date, fromtime: string, totime: string, payload: IStudentCreate): Promise<any> {
        const result = await calculateHours(payload);
        if(result>1){
            throw new Error('Evaluation class duration is more than 1 hour');
        }
        if((payload.preferredFromTime>= fromtime && payload.preferredFromTime<=totime) && (payload.preferredToTime>= fromtime && payload.preferredToTime<=totime)){
            return true;
        }
        return false;
}
function calculateHours(payload: IStudentCreate) {
  // Function to convert time string to Date objec
  const fromTime = parseTimeToDate(payload.preferredFromTime);
  const toTime = parseTimeToDate(payload.preferredToTime);
  
  // Check if the dates are valid
  if (isNaN(fromTime.getTime()) || isNaN(toTime.getTime())) {
      throw new Error('Invalid date format for preferredFromTime or preferredToTime');
  }

  const hours = (toTime.getTime() - fromTime.getTime()) / 3600000; // Convert milliseconds to hours
  return hours;
}

function parseTimeToDate(timeString: string): Date {
  const [time, modifier] = timeString.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'PM' && hours < 12) {
      hours += 12; // Convert PM hours to 24-hour format
  } else if (modifier === 'AM' && hours === 12) {
      hours = 0; // Convert 12 AM to 0 hours
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0); // Set hours, minutes, seconds, and milliseconds
  return date;
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






