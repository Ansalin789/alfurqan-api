import { appStatus, learningInterest, numberOfStudents, preferredTeacher, eventType, referenceSource, classStatus } from "../config/messages";

// Use an enum for better type safety
export enum Status {
  ACTIVE = appStatus.ACTIVE,
  IN_ACTIVE = appStatus.IN_ACTIVE,
  DELETED = appStatus.DELETED,
}

export enum LearningInterest {
  QURAN = learningInterest.QURAN,
  ISLAMIC = learningInterest.ISLAMIC,
  ARANIC = learningInterest.ARANIC, // Fixed type (was ARABIC)
}

export enum NumberOfStudents {
  ONE = numberOfStudents.ONE,
  TWO = numberOfStudents.TWO,
  THREE = numberOfStudents.THREE,
  FOUR = numberOfStudents.FOUR,
  FIVE = numberOfStudents.FIVE,
}

export enum PreferredTeacher {
  TEACHER_1 = preferredTeacher.TEACHER_1,
  TEACHER_2 = preferredTeacher.TEACHER_2,
  TEACHER_3 = preferredTeacher.TEACHER_3,
}

export enum EvaluationStatus {
  PENDING = "PENDING",
  INPROGRESS = "INPROGRESS",
  COMPLETED = "COMPLETED",
}

export enum EventType {
  MEETING_SCHEDULED = eventType.MEETING_SCHEDULED,
  MEETING_WITHOUT_SCHEDULED = eventType.MEETING_WITHOUT_SCHEDULED,
  MEETING_CANCELLED = eventType.MEETING_CANCELLED,
}

export enum ReferralSource {
  FRIENDS = referenceSource.FRIENDS,
  SOCIALMEDIA = referenceSource.SOCIALMEDIA, // Keep as string
  EMAIL = referenceSource.EMAIL,
  GOOGLE = referenceSource.GOOGLE,
  OTHER = referenceSource.OTHER, // Keep as string
}

export class CustomEnumerator {
  static readonly classStatus = classStatus;
  static readonly Status = Status;
  static readonly EventType = EventType;
  static readonly LearningInterest = LearningInterest;
  static readonly NumberOfStudents = NumberOfStudents;
  static readonly PreferredTeacher = PreferredTeacher;
  static readonly EvaluationStatus = EvaluationStatus;
  static readonly ReferralSource = ReferralSource;
}

export interface GetAllRecordsParams {
  groupId?:string;
  roomId?:string;
  supervisorId?:string;
  teacherId?:string;
  studentId?: string;
  academicCoachId?: string;
  searchText?: string;
  sortBy: string;
  sortOrder?: "asc" | "desc";
  offset?: string | null;
  limit?: string | null;
  role?: string;
  classDay?: any;
  filterValues?: {
    studentId?: string; // This is important if you're passing the studentId here
    course?: string;
    country?: string;
    teacher?: string;
    status?: string;
  };
}


export interface GetAllApplicationsRecordsParams {
  searchText?: string;
  sortBy: string;
  sortOrder?: "asc" | "desc";
  offset?: string | null;
  limit?: string | null;
  filterValues?: {
    applicationStatus?: string;
  };
}


export interface GetAlluserRecordsParams {
  date?: string;
  role: string;
  studentId?:string;
  // startdate?: string;
  // enddate?: string;
}

export default CustomEnumerator;
