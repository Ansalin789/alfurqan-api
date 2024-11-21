import { appStatus, learningInterest, numberOfStudents, preferredTeacher, eventType, referenceSource } from "../config/messages";

// Use an enum for better type safety
export enum Status {
  ACTIVE = appStatus.ACTIVE,
  IN_ACTIVE = appStatus.IN_ACTIVE,
  DELETED = appStatus.DELETED,
}

export enum LearningInterest {
  QURAN = learningInterest.QURAN,
  ISLAMIC = learningInterest.ISLAMIC,
  ARANIC = learningInterest.ARANIC,
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

export enum EvaluationStatus{
  PENDING='PENDING',
  INPROGRESS='INPROGRESS',
  COMPLETED='COMPLETED'
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
  OTHER= referenceSource.OTHER           // Keep as string
}

export class CustomEnumerator {
  static readonly Status = Status;
  static readonly EventType = EventType;
  static readonly LearningInterest = LearningInterest;
  static readonly NumberOfStudents = NumberOfStudents;
  static readonly PreferredTeacher = PreferredTeacher;
  static readonly EvaluationStatus = EvaluationStatus;
  static readonly ReferralSource = ReferralSource;
}

export interface GetAllRecordsParams {
  tenantId: string;
  searchText?: string;
  offset?: string | null;
  limit?: string | null;
  sortBy: string;
  sortOrder?: "asc" | "desc";
  jobStatus?: string[];
  jobId?: string;
  referenceId?: string;
  filterValues?: {
    jobSector?: string[];
    jobs?: string[];
    recruiter?: string[];
    status?: string[];
    users?: string[];
    meetingStatus?: string[];
    candidateResponse?: string[];
    referenceType?: string[];
    notificationType?: string[];
  };
  isPinned?: boolean;
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  modules?: string[];
  keyNames?: string[];
  userId?: string;
  startDate?: string;
  endDate?: string;
  jobTitles?: string[];
  jobSectors?: string[];
  clients?: string[];
  interviewDetailId?: string;
  feedbackTypes?: string[];
}

export default CustomEnumerator;