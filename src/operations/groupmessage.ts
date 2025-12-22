import GroupModel from "../models/group";
import GroupMessageModel from "../models/groupMessage";
import { IGroupMessageParticipant } from "../../types/models.types";
import { Status } from "../shared/enum";
import { uploadedFormat } from "../config/messages";


//  CREATE GROUP 

export async function createGroup(groupData: any) {
  try {
    const newGroup = new GroupModel({
      ...groupData,
      messages: "Group Created",
      status: Status.ACTIVE,
      createdDate: groupData.createdDate ?? new Date(),
      updatedDate: groupData.updatedDate ?? new Date(),
      isDeleted: false,
      isGroupDeleted: false,
    });

    return await newGroup.save();
  } catch (err) {
    console.error("Error creating group:", err);
    throw new Error("Failed to create group");
  }
}

// SEND MESSAGE

export async function createGroupMessage(messageData: any) {
  try {
    if (messageData.uploadedFormat === uploadedFormat.PDF && messageData.uploadedFormat === uploadedFormat.VIDEO) {
          return { error: "Uploaded format cannot be both PDF and VIDEO at the same time." };
        }
    const newMessage = new GroupMessageModel({
      ...messageData,
      status: Status.ACTIVE,
      uploadedFormat: messageData.uploadedFormat,
      uploadedFile: messageData.uploadedFile ?? undefined,
      createdDate: messageData.createdDate ?? new Date(),
      updatedDate: messageData.updatedDate ?? new Date(),
      isDeleted: false,
    });

    return await newMessage.save();
  } catch (err) {
    console.error("Error sending message:", err);
    throw new Error("Failed to send message");
  }
}

//  ADD PARTICIPANTS

export async function addParticipants(
  groupId: string,
  participants: IGroupMessageParticipant[],
  updatedBy: string
) {
  // Use $ne: true to match documents where isGroupDeleted is false OR undefined
  const group = await GroupModel.findOne({ groupId, isGroupDeleted: { $ne: true } });
  if (!group) throw new Error("Group not found or already deleted");

  const newParticipants = participants.filter(
    p => !group.groupMessageParticipant.some(
      existing => existing.participantId === p.participantId
    )
  );

  group.groupMessageParticipant.push(...newParticipants);
  group.updatedBy = updatedBy;
  group.updatedDate = new Date();

  await group.save();

  return group;
}


//  REMOVE PARTICIPANTS

export async function removeParticipants(
  groupId: string,
  participantIds: string[],
  updatedBy: string
) {
  // Use $ne: true to match documents where isGroupDeleted is false OR undefined (for existing docs)
  const group = await GroupModel.findOne({ groupId, isGroupDeleted: { $ne: true } });
  if (!group) throw new Error("Group not found");

  group.groupMessageParticipant = group.groupMessageParticipant.map(p => {
    if (participantIds.includes(p.participantId)) {
      // Convert to plain object first, then spread
      const plainParticipant = (p as any).toObject ? (p as any).toObject() : { ...p };
      return {
        ...plainParticipant,
        isRemoved: true,
        removedDate: new Date(),
      };
    }
    return p;
  });

  group.updatedBy = updatedBy;
  group.updatedDate = new Date();

  await group.save();
  return group;
}


// CLEAR CONVERSATION (Soft delete all messages only)

export async function clearConversation(groupId: string, deletedBy: string) {
  const result = await GroupMessageModel.updateMany(
    { groupId, isDeleted: false },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy,
        updatedDate: new Date(),
        updatedBy: deletedBy
      },
    }
  );

  return result;
}



// SOFT DELETE GROUP (AND SOFT DELETE ALL MESSAGES)

export async function softDeleteGroup(groupId: string, deletedBy: string) {
  // Find the group and check if it exists and is not already deleted
  const group = await GroupModel.findOne({ groupId, isGroupDeleted: { $ne: true } });

  if (!group) {
    throw new Error("Group not found or already deleted");
  }

  // Mark the group as deleted
  group.isGroupDeleted = true;
  group.groupDeletedAt = new Date();
  group.groupDeletedBy = deletedBy;
  group.status = Status.DELETED;
  group.updatedBy = deletedBy;
  group.updatedDate = new Date();

  await group.save();

  // Soft delete all messages that are not already deleted
  await GroupMessageModel.updateMany(
    { groupId, isDeleted: { $ne: true } },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy,
        status: Status.DELETED,
      },
    }
  );

  return group;
}


//GET MESSAGE

export async function getGroupChatMessages(groupId: string) {
  const messages = await GroupMessageModel.find({
    groupId,
  }).sort({ createdDate: 1 });

  const formattedMessages = messages.map((msg) => {
    let senderId: string | null = null;
    let senderName: string = "Unknown";
    let role: string = "unknown";

    // Try to match createdBy with participant name
    if (msg.groupMessageParticipant?.length > 0) {
      const participant = msg.groupMessageParticipant.find(
        (p: any) => p.participantName === msg.createdBy
      );
      if (participant) {
        senderId = participant.participantId;
        senderName = participant.participantName;
        role = participant.role;
      }
    }

    if (!senderId && msg.groupMessageOrganizer) {
      senderId = msg.groupMessageOrganizer.organizerId;
      senderName = msg.groupMessageOrganizer.organizerName;
      role = msg.groupMessageOrganizer.role;
    }

    return {
      message: msg.messages,
      senderId,
      senderName,
      role,
      createdDate: msg.createdDate,
    };
  });

  return formattedMessages;
}




