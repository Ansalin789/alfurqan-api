import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { Status } from "../../shared/enum";
import {
  addParticipants,
  clearConversation,
  createGroup,
  createGroupMessage,
  removeParticipants,
  softDeleteGroup
} from "../../operations/groupmessage";
import { zodGroupMessageSchema } from "../../models/groupMessage";
import { zodGroupSchema } from "../../models/group";




const createGroupValidation = z.object({
  payload: zodGroupSchema.pick({
    groupId: true,
    GroupName: true,
    GroupNameDescription: true,
    CourseName: true,
    Designation: true,
    PreferredTeacher: true,
    groupMessageParticipant: true,
    groupMessageOrganizer: true,
  }),
});

const createMessageValidation = z.object({
  payload: zodGroupMessageSchema.pick({
    groupId: true,
    messages: true,
    isRead: true,
    groupMessageParticipant: true,
    groupMessageOrganizer: true,
    notificationStatus: true,
    status: true,
  }),
});


const AddParticipantsValidation = z.object({
  payload: z.object({
    groupId: z.string(),
    participants: z.array(
      z.object({
        participantId: z.string(),
        participantName: z.string(),
        participantEmail: z.string().optional(),
        role: z.enum(["teacher", "student", "admin", "supervisor", "academiccoach"]),
      })
    ),
    updatedBy: z.string(),
  }),
});

const RemoveParticipantsValidation = z.object({
  payload: z.object({
    participantIds: z.array(z.string()),
    updatedBy: z.string(),
  }),
});

const SoftDeleteGroupValidation = z.object({
  payload: z.object({
    groupId: z.string().min(1, "Group ID is required"),
    deletedBy: z.string().min(1, "Deleted by is required"),
  }),
});


export default {

  //  CREATE GROUP (NO MESSAGE)
 
  async createGroup(req: Request, h: ResponseToolkit) {
    const { payload } = createGroupValidation.parse({ payload: req.payload });

    const groupData = {
      groupId: payload.groupId,
      GroupName: payload.GroupName,
      GroupNameDescription: payload.GroupNameDescription,
      CourseName: payload.CourseName,
      Designation: payload.Designation,
      PreferredTeacher: payload.PreferredTeacher,

      groupMessageParticipant: payload.groupMessageParticipant,
      groupMessageOrganizer: payload.groupMessageOrganizer,

      status: Status.ACTIVE,

      createdDate: new Date(),
      createdBy: payload.groupMessageOrganizer?.organizerName ?? "SYSTEM",
      updatedDate: new Date(),
      updatedBy: payload.groupMessageOrganizer?.organizerName ?? "SYSTEM",

      isDeleted: false,
      isGroupDeleted: false,
    };

    const createdGroup = await createGroup(groupData);

    return h
      .response({
        message: "Group created successfully",
        group: createdGroup,
      })
      .code(201);
  },

 
  // SEND MESSAGE IN A GROUP
  
  async sendMessage(req: Request, h: ResponseToolkit) {
    const { payload } = createMessageValidation.parse({ payload: req.payload });

    const messageData = {
      groupId: payload.groupId,
      messages: payload.messages,
      isRead: payload.isRead,

      groupMessageParticipant: payload.groupMessageParticipant,
      groupMessageOrganizer: payload.groupMessageOrganizer,

      notificationStatus: payload.notificationStatus,
      status: Status.ACTIVE,

      createdDate: new Date(),
      createdBy: payload.groupMessageOrganizer?.organizerName ?? "SYSTEM",
      updatedDate: new Date(),
      updatedBy: payload.groupMessageOrganizer?.organizerName ?? "SYSTEM",

      isDeleted: false,
    };

    const createdMessage = await createGroupMessage(messageData);

    return h
      .response({
        message: "Message sent successfully",
        data: createdMessage,
      })
      .code(201);
  },

  //  ADD PARTICIPANTS

  async handleAddParticipants(req: Request, h: ResponseToolkit) {
    const { payload } = AddParticipantsValidation.parse({ payload: req.payload });

    const groupId = req.params.groupId; // <-- Path param
    const { participants, updatedBy } = payload;

    const result = await addParticipants(groupId, participants, updatedBy);

    return h.response({
      message: "Participants added successfully",
      data: result,
    }).code(200);
  },


  //  REMOVE PARTICIPANTS
  async handleRemoveParticipants(req: Request, h: ResponseToolkit) {
    const { payload } = RemoveParticipantsValidation.parse({ payload: req.payload });
    const groupId = req.params.groupId; // <-- Path param

    const { participantIds, updatedBy } = payload;

    const result = await removeParticipants(groupId, participantIds, updatedBy);

    return h
      .response({
        message: "Participants soft removed successfully",
        data: result,
      })
      .code(200);
  },

  //  CLEAR GROUP CONVERSATION
  async handleClearConversation(req: Request, h: ResponseToolkit) {
    const { groupId, deletedBy } = req.payload as any;

    const result = await clearConversation(groupId, deletedBy);

    return h
      .response({
        message: "Conversation cleared successfully",
        data: result,
      })
      .code(200);
  },

  //  SOFT DELETE GROUP

  async handleSoftDeleteGroup(req: Request, h: ResponseToolkit) {
    const { payload } = SoftDeleteGroupValidation.parse({ payload: req.payload });

    const { groupId, deletedBy } = payload;

    const result = await softDeleteGroup(groupId, deletedBy);

    return h
      .response({
        message: "Group soft deleted successfully",
        data: result,
      })
      .code(200);
  },





};
