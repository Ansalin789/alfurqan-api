import CustomEnumerator from "../src/shared/enum";

enum Status {
  ACTIVE = 'Active',
  IN_ACTIVE = 'Inactive',
  NEW = 'New'
}

enum LearningInterest {
  QURAN = 'Quran',
  ISLAMIC = 'Islamic Studies',
  ARANIC = 'Arabic',
}
enum NumberOfStudents {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}
enum PreferredTeacher {
  TEACHER_1 = 'Male',
  TEACHER_2 = 'Female',
  TEACHER_3 = 'Either',
}

enum ReferalResource{
  FRIENDS='Friend',
  SOCIALMEDIA='Social Media',
  EMAIL='E-Mail',
  GOOGLE='Google',
  OTHER='Other'
}
enum EvaluationStatus{
  PENDING='PENDING',
  INPROGRESS='INPROGRESS',
  COMPLETED='COMPLETED'
}

export interface IUser extends Document {
  userId?: string;
  userName: string;
  email: string;
  password: string;
  role: string[];
  profileImage?: string | null;
  lastLoginDate?: Date;
  status: Status;
  createdDate?: Date;
  createdBy: string;
  lastUpdatedDate?: Date;
  lastUpdatedBy: string;
}

export interface IUserCreate {
  userId?: string;
  userName: string;
  email: string;
  password: string;
  role: string[];
  profileImage?: string | null;
  lastLoginDate?: Date;
  status: Status;
  createdDate?: Date;
  createdBy: string;
  lastUpdatedDate?: Date;
  lastUpdatedBy: string;
}


export interface IStudents extends Document {
  firstName: string;
  lastName: string;
  academicCoach: {
    academicCoachId: string;
    name: string;
    role: string;
    email: string;
};
  email: string;
  phoneNumber: number;
  country?: string;
  countryCode: string;
  learningInterest: LearningInterest;
  numberOfStudents: NumberOfStudents;
  preferredTeacher: PreferredTeacher;
  preferredFromTime: string;
  preferredToTime: string;
  referralSource: ReferalResource;
  startDate : Date;
  evaluationStatus: EvaluationStatus;
  status: Status;
  createdDate?: Date;
  createdBy: string;
  lastUpdatedDate?: Date;
  lastUpdatedBy: string;
}

export interface IStudentCreate {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number;
  country?: string;
  countryCode: string;
  learningInterest: LearningInterest;
  numberOfStudents: NumberOfStudents;
  preferredTeacher: PreferredTeacher;
  preferredFromTime: string;
  preferredToTime: string;
  referralSource: ReferalResource;
  startDate : Date;
  evaluationStatus: EvaluationStatus;
  status: Status;
  createdDate?: Date;
  createdBy: string;
  lastUpdatedDate?: Date;
  lastUpdatedBy: string;
}

export interface IUsershiftschedule extends Document{
  academicCoachId: string;
  teacherId: string;
  name: string;
  email: string;
  role: string;
  workhrs: string;
  startdate: Date;
  enddate: Date;
  fromtime: string;
  totime: string;
  status: string;
  createdDate: Date;
  createdBy: string;
  lastUpdatedDate: Date;
  lastUpdatedBy: string
}

export interface IUsershiftscheduleCreate{
  academicCoachId: string;
  teacherId: string;
  name: string;
  email: string;
  role: string;
  workhrs: string;
  startdate: Date;
  enddate: Date;
  fromtime: string;
  totime: string;
  status: string;
  createdDate: Date;
  createdBy: string;
  lastUpdatedDate: Date;
  lastUpdatedBy: string
}

export interface IMeetingSchedule extends Document {
  academicCoach: {
    academicCoachId: string;
    name: string;
    email: string;
  };  
  teacher: {
    teacherId: string;
    name: string;
    email: string;
  };   
  student: {
    studentId: string;
    name: string;
    email: string;
  };
  subject: string;
  meetingLocation: string;
  class: {
    classId: string;
    className: string;
    classType: string;
  };  
  meetingType: string;
  meetingLink: string;
  isScheduledMeeting: boolean;
  scheduledStartDate: Date;
  scheduledEndDate: Date;
  scheduledFrom: string;
  scheduledTo: string;
  timeZone: string;
  remainderInMinutes: number;
  description: string;
  meetingStatus: string;
  candidateResponse: string;
  status: string;
  createdDate: Date;
  createdBy: string;
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
}

// Define the ITenant interface
export interface ITenant extends Document {
  tenantCode: string;
  tenantName: string;
  tenantLogo: string;
  organizationName: string;
  countryCode: string;
  phoneNumber?: string;
  mobileNumber: string;
  emailId: string;
  gstNo?: string;
  panNo: string;
  website?: string;
  faxNo?: string;
  address?: string;
  postalCode?: string;
  country?: string;
  activeLicense?: object;
  settings?: any[];
  status: keyof typeof CustomEnumerator.Status;
  createdDate: Date;
  createdBy: string;
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
  tenantJobCode: string;
}

export interface IActiveSession extends Document {
  userId: string;
  loginDate: Date;
  isActive: boolean;
  refreshToken?: string;
  accessToken: string;
}


export interface ITenantNotes extends Document {
  tenantId: string;
  userId: string;
  referenceType: string;
  referenceId: string;
  comment: string;
  parentId: string;
  isPinned: boolean;
  status: keyof typeof CustomEnumerator.Status;
  createdDate: Date;
  createdBy: string;
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
  taggedUsers?: { userId?: string; userName?: string; }[];
}

export interface ICreateTenantNotes {
  tenantId: string;
  userId: string;
  referenceType: string;
  referenceId: string;
  comment: string;
  parentId: string | null;
  isPinned: boolean;
  status: keyof typeof CustomEnumerator.Status;
  createdDate: Date;
  createdBy: string;
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
  taggedUsers: { userId: string; userName: string; }[];
}

export interface IErrorDetail {
  fileName: string;
  jobId: string;
  email: string;
  error: string;
}


export interface IEmailTemplate {
  tenantId: string;
  templateKey: string;
  templateContent: string;
  status?: keyof typeof CustomEnumerator.Status;
  createdDate?: Date;
  createdBy: string;
  lastUpdatedDate?: Date;
  lastUpdatedBy?: string;
}
export interface INotification {
  id: string;
  tenantId: string;
  userId: string;
  eventType: string,
  referenceId: string;
  referenceType: string;
  message?: string;
  notificationStatus?: string;
  status: keyof typeof CustomEnumerator.Status;
  emailToAddress?: string[];
  emailContent?: string;
  createdDate: Date;
  createdBy: string;
  lastUpdatedDate?: Date;
  lastUpdatedBy?: string;
  isRead: boolean;
}

export interface MeetingSchedulePayload {
  tenantId: string;
  organizer: { userId: string; name: string; email: string };
  candidates: { id: string; candidateId: number; candidateName: string; jobProfilingCandidateDataId?: string; email: string }[];
  users?: { userId?: string; userName?: string; email?: string }[];
  subject: string;
  jobId: string;
  jobName: string;
  meetingLocation?: string;
  tenantSettingId?: string;
  externalSourceType?: string;
  externalMeetingReferenceId?: string;
  applicationStatus: string;
  isInterviewScheduled: boolean;
  interviewRoundType?: string,
  isAssessment: boolean,
  assessmentType?: string,
  assessmentTenantSettingId?: string,
  assessmentLink?: string,
  isAiVideoEnabled: boolean,
  keyFocusedArea?: string[],
  additionalDetails?: string,
  isScheduledMeeting: boolean;
  meetingStatus?: string;
  candidateResponse?: string;
  scheduledStartDate?: Date;
  scheduledEndDate?: Date;
  scheduledFrom?: string;
  scheduledTo?: string;
  timeZone?: string;
  remainderInMinutes?: number;
  status: string;
  description?: string;
  meetingLink?: string | null;
  createdBy?: string;
  lastUpdatedBy?: string;
  referenceId: string;
  referenceType: string;
  remarks?: string;
}

// Define the ITenantSettings interface
export interface ITenantSettings extends Document {
  tenantId: string;
  keyName: string;
  keyValue: any;
  aiModel?:string;
  apiKey?:string;
  module: string;
  isConnected: boolean;
  status: keyof typeof CustomEnumerator.Status;
  createdDate?: Date;
  createdBy: string;
  lastUpdatedDate?: Date;
  lastUpdatedBy?: string;
}
export interface ITenantSettingsPayload {
  tenantId: string;
  keyName: string;
  keyValue: any;
  module: string;
  isConnected: boolean;
  status: keyof typeof CustomEnumerator.Status;
  createdDate?: Date;
  createdBy: string;
  lastUpdatedDate?: Date;
  lastUpdatedBy?: string;
}


