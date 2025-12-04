import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { Status } from "../../shared/enum";
import {
  addParticipants,
  clearConversation,
  createGroup,
  createGroupMessage,
  getGroupChatMessages,
  removeParticipants,
  softDeleteGroup
} from "../../operations/groupmessage";
import { zodGroupMessageSchema } from "../../models/groupMessage";
import { zodGroupSchema } from "../../models/group";
import GroupModel from "../../models/group";
import { getIO } from "../../shared/socket";
import AppLogger from "../../helpers/logging";
import { uploadFileToSharePoint } from "../../shared/sharepoint";



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
    uploadedFormat: true,
    uploadedFile: true,
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

    // Get socket instance
    const io = getIO();

    // Emit to all participants
    if (createdGroup.groupMessageParticipant?.length) {
      createdGroup.groupMessageParticipant.forEach((p) => {
        if (p.participantId) {
          io.to(p.participantId.toString()).emit("newgroup", createdGroup);
          AppLogger.info(`Group created emitted to participant ${p.participantId}`);
        }
      });
    }

    // Emit to organizer
    if (createdGroup.groupMessageOrganizer?.organizerId) {
      io.to(createdGroup.groupMessageOrganizer.organizerId.toString())
        .emit("newgroup", createdGroup);
      AppLogger.info(
        `Group created emitted to organizer ${createdGroup.groupMessageOrganizer.organizerId}`
      );
    }

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
    let uploadFileBuffer: Buffer | null = null;

    if (payload.uploadedFile) {

      // CASE 1: Hapi gives buffer inside _data
      if (payload.uploadedFile._data) {
        uploadFileBuffer = payload.uploadedFile._data;
      }
      // CASE 2: Already a Buffer
      else if (Buffer.isBuffer(payload.uploadedFile)) {
        uploadFileBuffer = payload.uploadedFile;
      }
      // CASE 3: Base64 string
      else if (typeof payload.uploadedFile === "string") {
        uploadFileBuffer = Buffer.from(payload.uploadedFile, "base64");
      }
      else {
        throw new Error("Invalid file format received");
      }
    }
    const fileName = `${Date.now()}_knowledgebase_file`;
    const shareLink = await uploadFileToSharePoint(
      uploadFileBuffer as Buffer,
      fileName
    );
    const messageData = {
      groupId: payload.groupId,
      messages: payload.messages,
      isRead: false,
      uploadedFormat: payload.uploadedFormat,
      uploadedFile: shareLink.fileId || '',
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

    // Save message
    const savedMessage = await createGroupMessage(messageData);

    // Get socket instance
    const io = getIO();

    // Emit to all participants
    if (payload.groupMessageParticipant?.length) {
      payload.groupMessageParticipant.forEach((p) => {
        if (p.participantId) {
          io.to(p.participantId.toString()).emit("newmessage", savedMessage);
          AppLogger.info(`Message emitted to participant ${p.participantId}`);
        }
      });
    }

    // Emit to organizer
    if (payload.groupMessageOrganizer?.organizerId) {
      io.to(payload.groupMessageOrganizer.organizerId.toString())
        .emit("newmessage", savedMessage);
      AppLogger.info(
        `Message emitted to organizer ${payload.groupMessageOrganizer.organizerId}`
      );
    }

    return h
      .response({
        message: "Message sent successfully",
        data: savedMessage,
      })
      .code(201);
  }

  ,

  //  ADD PARTICIPANTS

  async handleAddParticipants(req: Request, h: ResponseToolkit) {
    const { payload } = AddParticipantsValidation.parse({ payload: req.payload });

    const groupId = req.params.groupId; // <-- Path param
    const { participants, updatedBy } = payload;

    const result = await addParticipants(groupId, participants, updatedBy);

    // Get socket instance
    const io = getIO();

    // Emit to all participants
    if (result.groupMessageParticipant?.length) {
      result.groupMessageParticipant.forEach((p) => {
        if (p.participantId) {
          io.to(p.participantId.toString()).emit("groupupdated", result);
          AppLogger.info(`Group updated emitted to participant ${p.participantId}`);
        }
      });
    }

    // Emit to organizer
    if (result.groupMessageOrganizer?.organizerId) {
      io.to(result.groupMessageOrganizer.organizerId.toString())
        .emit("groupupdated", result);
      AppLogger.info(
        `Group updated emitted to organizer ${result.groupMessageOrganizer.organizerId}`
      );
    }

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

    // Get socket instance
    const io = getIO();

    // Emit to all participants
    if (result.groupMessageParticipant?.length) {
      result.groupMessageParticipant.forEach((p) => {
        if (p.participantId) {
          io.to(p.participantId.toString()).emit("groupupdated", result);
          AppLogger.info(`Group updated emitted to participant ${p.participantId}`);
        }
      });
    }

    // Emit to organizer
    if (result.groupMessageOrganizer?.organizerId) {
      io.to(result.groupMessageOrganizer.organizerId.toString())
        .emit("groupupdated", result);
      AppLogger.info(
        `Group updated emitted to organizer ${result.groupMessageOrganizer.organizerId}`
      );
    }

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

    const group = await GroupModel.findOne({ groupId });

    if (group) {
      // Get socket instance
      const io = getIO();

      // Emit to all participants
      if (group.groupMessageParticipant?.length) {
        group.groupMessageParticipant.forEach((p) => {
          if (p.participantId) {
            io.to(p.participantId.toString()).emit("groupupdated", group);
            AppLogger.info(`Group updated emitted to participant ${p.participantId}`);
          }
        });
      }

      // Emit to organizer
      if (group.groupMessageOrganizer?.organizerId) {
        io.to(group.groupMessageOrganizer.organizerId.toString())
          .emit("groupupdated", group);
        AppLogger.info(
          `Group updated emitted to organizer ${group.groupMessageOrganizer.organizerId}`
        );
      }
    }

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

    // Get socket instance
    const io = getIO();

    // Emit to all participants
    if (result.groupMessageParticipant?.length) {
      result.groupMessageParticipant.forEach((p) => {
        if (p.participantId) {
          io.to(p.participantId.toString()).emit("groupdeleted", result);
          AppLogger.info(`Group deleted emitted to participant ${p.participantId}`);
        }
      });
    }

    // Emit to organizer
    if (result.groupMessageOrganizer?.organizerId) {
      io.to(result.groupMessageOrganizer.organizerId.toString())
        .emit("groupdeleted", result);
      AppLogger.info(
        `Group deleted emitted to organizer ${result.groupMessageOrganizer.organizerId}`
      );
    }

    return h
      .response({
        message: "Group soft deleted successfully",
        data: result,
      })
      .code(200);
  },



  //GET MESSAGE
  async getGroupChatHandler(request: Request, h: ResponseToolkit) {
    try {
      const { groupId } = request.params;

      const messages = await getGroupChatMessages(groupId);

      return h
        .response({
          status: "success",
          data: messages,
        })
        .code(200);
    } catch (error: any) {
      return h
        .response({
          status: "error",
          message: error.message,
        })
        .code(500);
    }
  }


};
