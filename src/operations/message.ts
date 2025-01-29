import {  IMessage, IMessageCreate } from "../../types/models.types";
import message from "../models/message";
import { GetAllRecordsParams } from "../shared/enum";
import Message from "../models/message"
export const createMessage = async (
  payload: IMessageCreate
): Promise<{ totalCount: number; message: IMessageCreate[] } | { error: any }> => {
  try {
    // Create a new assignment
    const newMessage = new message({
      teacher: {
        teacherId: payload.teacher?.teacherId || "",
        teacherName: payload.teacher?.teacherName || "",
        teacherEmail: payload.teacher?.teacherEmail || "",
      },
      student: {
        studentId: payload.student?.studentId || "",
        studentFirstName: payload.student?.studentFirstName || "",
        studentLastName: payload.student?.studentLastName || "",
        studentEmail: payload.student?.studentEmail || "",
      },
      attachmentsType: payload.attachmentsType || [], // Attachments array (could be empty)
      sender: payload.sender || "",
      receiver: payload.receiver || "",
      group: payload.group || "",
      status: payload.status || "", // Default status if not provided
      createdDate: payload.createdDate || new Date(),
      createdBy: payload.createdBy || "", // Default createdBy if not provided
      updatedDate: payload.updatedDate || new Date(),
      updatedBy: payload.updatedBy || "",
      roomId: payload.roomId || "",
      message:payload.message||""
    });

    // Save the new assignment to the database
    const MessageRecord = await newMessage.save();

    // Count total assignments in the database
    const totalCount = await message.countDocuments();

    return { totalCount, message: [MessageRecord] };
  } catch (error) {
    return { error };
  }
};

export const createStudentMessageList = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; Message: IMessage[] }> => {
  const { groupId, sortBy = "_id", sortOrder = "asc", offset = 1, limit = 10 } = params;

  if (!groupId) {
    throw new Error("Group ID is required");
  }

  const query: any = { groupId };
  console.log(">>", query);

  const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  try {
    const skip = Math.max(0, (Number(offset) - 1) * Number(limit));

    // Aggregating messages based on groupId
    const [message, totalCount] = await Promise.all([
      Message.aggregate([
        { $match: query },
        { $sort: sortOptions },
        { $skip: skip },
        { $limit: Number(limit) },
        { $group: { _id: "$groupId", messages: { $push: "$$ROOT" } } }, // Grouping by groupId
      ]),
      Message.countDocuments(query).exec(),
    ]);

    return { totalCount, Message: message }; // Returns the grouped messages by groupId
  } catch (error) {
    console.error("Error fetching messages for student:", error);
    throw new Error("Failed to fetch messages for the student");
  }
};




export const createTeacherMessageList = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; messages: IMessage[] }> => {
  const { roomId, sortBy = "_id", sortOrder = "asc", offset = 1, limit = 10 } = params;

  if (!roomId) {
    throw new Error("Teacher ID is required");
  }

  // Update query to filter messages where the sender is "teacher" and matches the teacherId
  const query: any = { roomId };
  console.log("Query:", query);

  const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  try {
    const skip = Math.max(0, (Number(offset) - 1) * Number(limit));

    // Fetch the messages and total count
    const [messages, totalCount] = await Promise.all([
      Message.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .lean<IMessage[]>()
        .exec(), // Use .lean() for performance
      Message.countDocuments(query).exec(),
    ]);

    // Ensure property name matches expected structure
    return { totalCount, messages };
  } catch (error) {
    console.error("Error fetching messages for teacher:", error);
    throw new Error("Failed to fetch messages for the teacher");
  }
};

