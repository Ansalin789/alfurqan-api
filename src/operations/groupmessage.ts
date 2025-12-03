import GroupModel from "../models/group";
import GroupMessageModel from "../models/groupMessage";
import { IGroupMessageParticipant } from "../../types/models.types";
import { Status } from "../shared/enum";


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
    const newMessage = new GroupMessageModel({
      ...messageData,
      status: Status.ACTIVE,
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
