import { IClassSchedule, IKnowledgeBase, IKnowledgeBaseCreate, IUserCreate } from "../../types/models.types";
import KnowledgeBase from "../models/knowledgebase";
import Course from "../models/course";
import { uploadedFormat } from "../config/messages";
import knowledgebase from "../models/knowledgebase";
import ClassScheduleModel from "../models/classShedule";
import UserModel from "../models/users";
import AlStudenModel from "../models/alstudents";
import { Types } from "mongoose";

/**
 * Creates a new knowledge base entry.
 *
 * @param {IKnowledgeBaseCreate} payload 
 */
export const createKnowledgeBase = async (payload: IKnowledgeBaseCreate): Promise<IKnowledgeBase | { error: any }> => {
  try {

    console.log("Payload received in createKnowledgeBase:", payload);
    // 1. Check if Course exists
    const existingCourse = await Course.findOne({ courseName: payload.courseName });

    if (!existingCourse) {
      return { error: "Course with the given courseName does not exist." };
    }

   
    if (payload.uploadedFormat === uploadedFormat.PDF && payload.uploadedFormat === uploadedFormat.VIDEO) {
      return { error: "Uploaded format cannot be both PDF and VIDEO at the same time." };
    }

    

    const finalPayload = {
      courseName: payload.courseName,
      level: payload.level,
      teacherId: payload?.teacherId,
      subjectTitle: payload.subjectTitle,
      uploadedFormat: payload.uploadedFormat,
      uploadedFile: payload.uploadedFile ?? undefined,
      status: payload.status,
      createdDate: payload.createdDate || new Date(),
      createdBy: payload.createdBy,
      lastUpdatedBy: payload.updatedBy,
      lastUpdatedDate: payload.updatedDate|| new Date(),
    };

    
    const knowledgeBase = await KnowledgeBase.create(finalPayload);

    return knowledgeBase;

  } catch (error) {
    console.error(error);
    return { error };
  }
};


export  async function getAllknowledge() {
  const result = await knowledgebase.find();  // Simply retrieve all records without any filters
  return result;
};

export async function getAllknowledgeForStudent(
  studentId: string,
  courseName: string,
): Promise<IKnowledgeBase[] | Error> {
  try {
    if (!studentId || !courseName) {
      throw new Error('studentId and courseName are required');
    }

    // Get student to fetch level
    const alfstudent = await AlStudenModel.findOne({
      _id: new Types.ObjectId(studentId),
    }).exec();

    const level = alfstudent?.level;
    if (!level) throw new Error('Student level not found');

    // 1. Get class schedules
    const classSchedule: IClassSchedule[] = await ClassScheduleModel.find({
      'student.id': studentId,
      'course.courseName': courseName,
    }).exec();

    // 2. Extract unique teacher IDs
    const uniqueTeacherIds = Array.from(
      new Set(classSchedule.map((cls) => cls.teacher.teacherId))
    );

    // 3. Fetch teacher users
    const teachers: IUserCreate[] = await UserModel.find({
      userId: { $in: uniqueTeacherIds },
      role: 'TEACHER',
    }).exec();

    const teacherUserIds = teachers.map(t => t.userId).filter(Boolean);

    // 4. Build teacher-based filter
    let teacherQuery: any;

    if (teacherUserIds.length > 0) {
      teacherQuery = {
        $or: [
          { teacherId: { $in: teacherUserIds } },
          { teacherId: '' },
        ],
      };
    } else {
      teacherQuery = { teacherId: '' };
    }

    // 5. Add level filter
    const knowledgeQuery = {
      $and: [
        teacherQuery,
        { level: { $lte: level } }      // level <= student level
      ],
    };

    // 6. Fetch knowledge
    const knowledgeList: IKnowledgeBase[] = await KnowledgeBase.find(
      knowledgeQuery
    ).exec();

    return knowledgeList;
  } catch (error) {
    console.error('Error fetching knowledge for student:', error);
    return error as Error;
  }
}


