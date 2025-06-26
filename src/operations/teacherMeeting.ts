import {TeacherMeetingCreate, TeacherMeeting} from '../../types/models.types'
import teacherMeeting from '../models/teachermeeting';

export const createTeacherMeeting = async (payload : TeacherMeetingCreate): Promise<TeacherMeeting | {error : any}> => {
    try {
        const teacher = {
            teacherId: payload.teacher?.teacherId ?? "",
            teacherName: payload.teacher?.teacherName ?? "",
            teacherEmail: payload.teacher?.teacherEmail ?? "",
          };
          const meetingDate = new Date(payload.meetingDate);
          const {fromTime, toTime} = payload;

          const conflictingMeeting = await teacherMeeting.findOne({
            selectedDate : meetingDate,
            $or:[
                {
                    fromTime : {$lt : toTime}, toTime : {$gt : fromTime}
                },
            ]
          });
          if (conflictingMeeting) {
            return {
              error:
                "A meeting is already scheduled at this time. Please choose a different time slot.",
            };
          }
          const meetingId = `participants-${teacher.teacherId || "unknown"}`;
          if (meetingDate < new Date()) {
            return { error: "Meeting date cannot be in the past. Please select a future date." };
          }

          const newMeeting = new teacherMeeting({
            ...payload,
            teacher,
            meetingId   
          })

          const savedMeeting = await newMeeting.save();
          return savedMeeting;


    } catch (error) {
        console.error("Error creating meeting:", error);
        return { error };
      }
}