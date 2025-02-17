import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { zodAddMeetingSchema } from "../../models/addmeeting";
import { createMeeting, getAllMeetingRecords } from "../../operations/addmeeting";

const createInputValidation = z.object({
  payload: zodAddMeetingSchema.pick({
    meetingName: true,
    selectedDate: true,
    startTime: true,
    endTime: true,
    teacher: true,
    description: true,
    status: true,
    createdDate: true,
    createdBy: true,
    updatedDate: true,
  }),
});

export default {
  async createMeeting(req: Request, h: ResponseToolkit) {
    try {
      const { payload } = createInputValidation.parse({ payload: req.payload });

      const meeting = await createMeeting({
        meetingName: payload.meetingName,
        selectedDate: new Date(payload.selectedDate),
        startTime: payload.startTime,
        endTime: payload.endTime,
        teacher: payload.teacher,
        description: payload.description,
        status: payload.status ?? "Scheduled",
        createdDate: payload.createdDate || new Date(),
        createdBy: payload.createdBy,
        updatedDate: payload.updatedDate || new Date(),
      });

      return h.response({ message: "Meeting created successfully", data: meeting }).code(201);
    } catch (error) {
      return h.response({ error }).code(400);
    }
  },

  async getAllMeetings(req: Request, h: ResponseToolkit) {
    try {
      const meetings = await getAllMeetingRecords();
      return h.response({ message: "Meetings retrieved successfully", data: meetings }).code(200);
    } catch (error) {
      return h.response({ error }).code(500);
    }
  },
};
