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
  city?: string;
  country: string;
  countryCode: string;
  learningInterest: LearningInterest;
  numberOfStudents: NumberOfStudents;
  preferredTeacher: PreferredTeacher;
  preferredFromTime: string;
  preferredToTime: string;
  timeZone: string;
  referralSource: ReferalResource;
  startDate : Date;
  evaluationStatus: EvaluationStatus;
  status: Status;
  createdDate: Date;
  createdBy: string;
  lastUpdatedDate?: Date;
  lastUpdatedBy: string;
}

export interface IStudentCreate {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number;
  city?: string;
  country: string;
  countryCode: string;
  learningInterest: LearningInterest;
  numberOfStudents: NumberOfStudents;
  preferredTeacher: PreferredTeacher;
  preferredFromTime: string;
  preferredToTime: string;
  timeZone: string;
  referralSource: ReferalResource;
  startDate : Date;
  evaluationStatus: EvaluationStatus;
  status: Status;
  createdDate: Date;
  createdBy: string;
  lastUpdatedDate?: Date;
  lastUpdatedBy: string;
}

export interface IUsershiftschedule extends Document{
  academicCoachId: string;
  teacherId: string;
  supervisorId: string;
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
  supervisorId: string;
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
    city: string;
    country: string;
  };
  trialId: string;
  classStatus: string;
  subject: string;
  meetingLocation: string;
  course: {
    courseId: string;
    courseName: string;
  };
  classType: string; 
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
  studentResponse: string;
  status: string;
  createdDate: Date;
  createdBy: string;
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
}

export interface IMeetingScheduleCreate {
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
    city: string;
    country: string;
  };
  trialId: string;
  classStatus: string;
  subject: string;
  meetingLocation: string;
  course: {
    courseId: string;
    courseName: string;
  };
  classType: string; 
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

export interface ICourse extends Document {
  courseName: string;
  status: string;
  createdDate: Date;
  createdBy: string;
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
}

export interface ICourseCreate {
  courseName: string;
  status: string;
  createdDate: Date;
  createdBy: string;
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
}


export interface IEvaluation extends Document {
  academicCoachId: string;
student: {
  studentId: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentPhone: number;
  studentCity?: string;
  studentCountry: string;
  studentCountryCode: string;
  learningInterest: LearningInterest;
  numberOfStudents: number;
  preferredTeacher: PreferredTeacher;
  preferredFromTime: string;
  preferredToTime: string;
  timeZone: string;
  referralSource: ReferalResource;
  preferredDate: Date;
  evaluationStatus: EvaluationStatus;
  status: Status;
  createdDate: Date;
  createdBy: string;
};
// teacher:{
//   teacherId: string;
//   teacherName: string;
//   teacherEmail: string;
// },
// classDay: any;
// package: string;
// preferedTeacher: string;
// course: string;
// totalHourse: Number;
// startDate: Date;
// endDate: Date;
// startTime: any;
// endTime: any;
isLanguageLevel: boolean;
languageLevel: string;
isReadingLevel: boolean;
readingLevel?: string;
isGrammarLevel: boolean;
grammarLevel: string;
hours: number;
subscription: {
    subscriptionId: string;
    subscriptionName: string;
    subscriptionPricePerHr: number;
    subscriptionDays: number;
    subscriptionStartDate: Date;
    subscriptionEndDate: Date;
};
planTotalPrice: number
classStartDate: Date;
classEndDate: Date;
classStartTime: string;
classEndTime: string;
accomplishmentTime?: string;
studentRate: number;
expectedFinishingDate: number;
gardianName: string;
gardianEmail: string;
gardianPhone: string;
gardianCity: string;
gardianCountry: string;
gardianTimeZone: string;
gardianLanguage: string;
assignedTeacher: string;
assignedTeacherId:string;
assignedTeacherEmail:string;
studentStatus: string;
classStatus: string;
comments?: string;
trialClassStatus?: string;
invoiceStatus?: string;
paymentLink: string;
paymentStatus?: string;
status?: string;
createdDate: Date;
createdBy?: string;
updatedDate?: Date;
updatedBy?: string;
  
} 


export interface IEvaluationCreate{
  academicCoachId: string;
  student: {
  studentId?: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentPhone: number;
  studentCity?: string;
  studentCountry: string;
  studentCountryCode: string;
  learningInterest: LearningInterest;
  numberOfStudents: number;
  preferredTeacher: PreferredTeacher;
  preferredFromTime?: string;
  preferredToTime?: string;
  timeZone: string;
  referralSource: ReferalResource;
  preferredDate?: Date;
  evaluationStatus: EvaluationStatus;
  status: Status;
  createdDate: Date;
  createdBy?: string;
};
// teacher:{
//   teacherName: string;
// },
// classDay?: string[];
// package: string;
// preferedTeacher: string;
// course: string;
// totalHourse: Number;
// startDate: Date;
// endDate: Date;
// startTime?: string[];
// endTime?: string[];
isLanguageLevel: boolean;
languageLevel: string;
isReadingLevel: boolean;
readingLevel?: string;
isGrammarLevel: boolean;
grammarLevel: string;
hours: number;
subscription: {
    subscriptionName: string;
};
planTotalPrice: number
classStartDate: Date;
classEndDate: Date;
classStartTime: string;
classEndTime: string;
gardianName: string;
gardianEmail: string;
gardianPhone: string;
gardianCity: string;
gardianCountry: string;
gardianTimeZone: string;
gardianLanguage: string;
assignedTeacher: string;
accomplishmentTime?: string;
studentRate: number;
studentStatus: string;
classStatus: string;
comments?: string;
trialClassStatus?:string;
invoiceStatus?: string;
paymentLink?: string;
paymentStatus?: string;
status?: string;
createdDate: Date;
createdBy?: string;
updatedDate?: Date;
updatedBy?: string;  
}


export interface ISubscritions extends Document{
  subscriptionName: string,
  subscriptionPricePerHr: number,
  subscriptionDays: number,
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  status: string,
  createdDate: Date,
  createdBy: string,
  updatedDate: Date,
  updatedBy: string
}

export interface IClassSchedule extends Document{
  student: {
    studentId: string;
    studentFirstName: string;
    studentLastName: string;
    studentEmail: string;
  },
  teacher:{
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
  },
  classDay: any;
  package: string;
  preferedTeacher: string;
  course: string;
  totalHourse: Number;
  startDate: Date;
  endDate: Date;
  startTime: any;
  endTime: any;
  scheduleStatus: string,
  scheduledStartDate: Date,
  classStatus:string,
  classType: string,
  classLink: string,
  isScheduledMeeting: boolean,
  timeZone: string,
  remainderInMinutes: number,
  description: string,
  meetingStatus: string,
  studentResponse: string,
  status: string,
  createdDate: Date,
  createdBy: string,
  lastUpdatedDate: Date,
  lastUpdatedBy: string
}

export interface IClassScheduleCreate{
  student: {
    studentId?: string;
    studentFirstName: string;
    studentLastName: string;
    studentEmail: string;
  },
  teacher:{
    teacherName: string;
    teacherEmail: string;
  },
  classDay: string[];
  classStatus:string;
  package: string;
  preferedTeacher: string;
  course: string;
  totalHourse: Number;
  startDate: Date;
  endDate: Date;
  startTime: string[];
  endTime: string[];
  scheduleStatus: string,
}

export interface IActiveSession extends Document {
  userId: string;
  loginDate: Date;
  isActive: boolean;
  refreshToken?: string;
  accessToken: string;
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


export interface IAlStudents extends Document{
  student:{
    studentId: string;
    studentEmail: string;
    studentPhone: Number;
    course: string;
    package: string;
    city:string;
    country: string;
  };
  username: string,
  password: string;
  role: string;
  startDate: Date;
  endDate:Date;
  status: string;
  createdDate: Date;
  createdBy: string;
  updatedDate: Date;
  updatedBy: string;
}


export interface IAlStudentCreate{
  student:{
    studentId: string;
    studentEmail: string;
    studentPhone: Number;
  };
  username: string,
  role: string;
}

export interface IPaymentDetails extends Document{
  userId: string;
  userName: string;
  paymentStatus: string;
  paymentAmount: string;
  paymentResponse: JSON;
  paymentResponseId: string;
  paymentDate: Date;
  status: string;
  createdDate: Date;
  createdBy: string;
  lastUpdatedDate: Date;
  lastUpdatedBy: string
}

export interface CreatePaymentDetails{
  userId: string;
  userName: string;
  paymentStatus: string;
  paymentAmount: string;
  paymentResponse: JSON;
  paymentResponseId: string;
  status: string;
  createdDate: Date;
  createdBy: string;
  lastUpdatedDate: Date;
  lastUpdatedBy: string
}

export interface IAssignment  extends Document{
  studentId: string;
  assignmentName: string;
  assignedTeacher: string;
  assignmentType: {
    quiz?: string;
    writing?: string;
    reading?: string;
    imageIdentification?: string;
    wordMatching?: string;
  };
  chooseType: boolean;
  trueorfalseType: boolean;
  question: string;
  hasOptions: boolean;
  options: {
    optionOne?: string;
    optionTwo?: string;
    optionThree?: string;
    optionFour?: string;
  };
  audioFile?: string;
  uploadFile?: string;
  status: string;
  createdDate: Date;
  createdBy: string;
  updatedDate: Date;
  updatedBy: string;
  level: string;
  courses: string;
  assignedDate: Date;
  dueDate: Date;
  answer: string;
  answerValidation: string;
  assignmentStatus: string;


}
export interface IallAssignment {
  studentId: string;
  assignmentName: string;
  assignedTeacher: string;
  assignmentType: { 
    quiz?: string;
    writing?: string;
    reading?: string;
    imageIdentification?: string;
    wordMatching?: string;
  }; // Aligning with IAssignment
  chooseType: boolean;
  trueorfalseType: boolean;
  question: string;
  hasOptions: boolean;
  options: {
    optionOne?: string;
    optionTwo?: string;
    optionThree?: string;
    optionFour?: string;
  };
  audioFile?: Buffer;
  uploadFile?: Buffer;
  status: string;
  createdDate: Date;
  createdBy: string;
  updatedDate: Date;
  updatedBy: string;
  level: string;
  courses: string;
  assignedDate: Date;
  dueDate: Date;
  assignmentStatus: string;


}

export interface IAssignmentCreate {
  studentId: string;
  assignmentName: string;
  assignedTeacher: string;
  assignmentType: { 
    quiz?: string;
    writing?: string;
    reading?: string;
    imageIdentification?: string;
    wordMatching?: string;
  }; // Aligning with IAssignment
  chooseType: boolean;
  trueorfalseType: boolean;
  question: string;
  hasOptions: boolean;
  options: {
    optionOne?: string;
    optionTwo?: string;
    optionThree?: string;
    optionFour?: string;
  };
  audioFile?: Buffer;
  uploadFile?: Buffer;
  status: string;
  createdDate: Date;
  createdBy: string;
  updatedDate: Date;
  updatedBy: string;
  level: string;
  courses: string;
  assignedDate: Date;
  dueDate: Date;
  answer: string;
  answerValidation: string;
  assignmentStatus: string;
}

export interface IStudentInvoice extends Document{
  student: {
      studentId: String;
      studentName: String;
      studentEmail:String;
      studentPhone:Number;
  };
  courseName: String;
  amount: Number; 
  invoiceStatus: String;
  status: String;
  createdDate: Date;
  createdBy:String ;
  lastUpdatedDate: Date;
  lastUpdatedBy: String;
}

export interface IMessageCreate {
  sender: string;
  receiver: string;
  roomId: string;
  student?: { // <-- Made student optional
    studentId: string;
    studentFirstName: string;
    studentLastName: string;
    studentEmail: string;
  };
  supervisor?: {
    supervisorId: string;
    supervisorFirstName: string;
    supervisorLastName: string;
    supervisorEmail: string;
  };
  teacher: {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
  };
  timeZone: string;
  status: string;
  message: string;
  assigments?: string;
  createdDate: Date;
  createdBy: string;
  updatedDate: Date;
  updatedBy: string;
  attachmentsType: {
    fileName: string;
    fileType: string;
    fileUrl: string;
  }[]; 
  group: {
    groupId: string;
    groupName: string;
    members: {
      userId: string;
      userName: string;
    }[];
  }[];
}

export interface IMessage extends Document {
  roomId: string; // Identifier for the chat room
  student: {
    studentId: string; // Unique identifier for the student
    studentFirstName: string; // Student's first name
    studentLastName: string; // Student's last name
    studentEmail: string; // Student's email address
  };
  supervisor: {
    supervisorId: string; // Unique identifier for the student
    supervisorFirstName: string; // Student's first name
    supervisorLastName: string; // Student's last name
    supervisorEmail: string; // Student's email address
  };
  teacher: {
    teacherId: string; // Unique identifier for the teacher
    teacherName: string; // Teacher's full name
    teacherEmail: string; // Teacher's email address
  };
  message: string; // The content of the message
  attachments: {
    fileName: string;
    fileType: string;
    fileUrl: string;
  };
  sender:string;
  timeZone: string;
  receiver:string;
  createdDate: Date; // Timestamp when the message was created
  createdBy: string; // Identifier of the user who created the message
  updatedDate: Date; // Timestamp when the message was last updated
  updatedBy: string; // Identifier of the user who last updated the message
  group: {
    groupId: string;
    groupName: string;
    members: {
      userId: string;
      userName: string;
    }[];
  }[];
}

export interface IFeedbackCreate {
  sessionId?:string;
  student?: {
    studentId?: string;
    studentFirstName?: string;
    studentLastName?: string;
    studentEmail?: string;
  };
  supervisor?: {
    supervisorId?: string;
    supervisorFirstName?: string;
    supervisorLastName?: string;
    supervisorEmail?: string;
  };
  teacher?: {
    teacherId?: string;
    teacherName?: string;
    teacherEmail?: string;
  };
  classDay?: string;
  preferedTeacher?: string;
  feedbackmessage?: string;
  
  course?: {
    courseId?: string;  // Ensure a valid course ID
    courseName?: string;
  };

  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;

  level?: number;

  teacherRatings?: {  // ✅ Made optional
    listeningAbility?: number;
    readingAbility?: number;
    overallPerformance?: number;
  };

  studentsRating?: {  // ✅ Made optional
    classUnderstanding?: number;
    engagement?: number;
    homeworkCompletion?: number;
  };

  supervisorRating?: {  // ✅ Made optional
    knowledgeofstudentsandcontent?: number;
    assessmentofstudents?: number;
    communicationandcollaboration?: number;
    professionalism?: number;
  };

  createdDate?: Date;  // ✅ Made optional if handled in backend
  createdBy?: string;  // ✅ Made optional if handled in backend
  lastUpdatedDate?: Date;  // ✅ Made optional
  lastUpdatedBy?: string;
}



export interface IFeedback  extends Document{
  sessionId?:string;
  student?: {
    studentId?: string;
    studentFirstName?: string;
    studentLastName?: string;
    studentEmail?: string;
  };
  supervisorRating?: {
    knowledgeofstudentsandcontent?:number;
    assessmentofstudents?: number;
    communicationandcollaboration?: number;
    professionalism?: number;
  },
  teacher?: {
    teacherId?: string;
    teacherName?: string;
    teacherEmail?: string;
  };
  classDay?: string[];
  preferedTeacher: string;
  feedbackmessage?: string;
  
  course: {
    courseId?: string;
    courseName: string;
  };

  startDate: Date;
  endDate: Date;
  startTime?: string[];
  endTime?: string[];

  // ✅ NEW: Student Level
  level: number;

  // ✅ NEW: Ratings for Teacher Assessment
  teacherRatings: {
    listeningAbility?: number;
    readingAbility? : number;
    overallPerformance?: number;
  };

  // ✅ NEW: Student-Specific Ratings
  studentsRating: {
    classUnderstanding?: number;
    engagement?: number;
    homeworkCompletion?: number;
  };

  createdDate: Date;
  createdBy: string;
  lastUpdatedDate: Date;
  lastUpdatedBy?: string;
}

export interface IRecruitment extends Document{
  candidateFirstName: string;
  candidateLastName : string;
  supervisor:{
    supervisorId?: string;
    supervisorName?: string;
    supervisorEmail?: string;
    supervisorRole?: string;
  };
  applicationDate : Date;
  candidateEmail : string;
  candidatePhoneNumber : number;
  candidateCountry : string;
  candidateCity : string;
  positionApplied : string;
  currency: string;
  expectedSalary : number;
  preferedWorkingHours: string;
  uploadResume?: Buffer;
  comments: string;
  applicationStatus: string;
  level?: string;
  quranReading? : string;
  tajweed? : string;
  arabicWriting?: string;
  arabicSpeaking?: string;
  preferedWorkingDays?: number;
  overallRating?: number;
  professionalExperience?: string;
  skills?: string;
  status: string;
  createdDate: Date;
  createdBy: string;
  updatedDate?: Date;
  updatedBy?: string;
}

export interface IRecruitmentCreate{

  candidateFirstName: string;
  candidateLastName : string;
  applicationDate : Date;
  candidateEmail : string;
  candidatePhoneNumber : number;
  candidateCountry : string;
  candidateCity : string;
  positionApplied : string;
  currency: string;
  expectedSalary : number;
  preferedWorkingHours: string;
  uploadResume?: Buffer;
  comments: string;
  applicationStatus: string;
  level? : string;
  quranReading? : string;
  tajweed? : string;
  arabicWriting?: string;
  arabicSpeaking?: string;
  preferedWorkingDays?: number;
  overallRating?: number;
  professionalExperience?: string;
  skills?: string;
  status: string;
  createdDate: Date;
  createdBy: string;
  updatedDate?: Date;
}

export interface ITeacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
}

export interface IMeetingCreate {
  meetingName: string;
  meetingId: string;
  selectedDate: Date;
  startTime: string;
  endTime: string;
  teacher: ITeacher[];  // Array of teacher objects
  description: string;
  status: string;
  createdDate: Date;
  createdBy: string;
  updatedDate?: Date;
  updatedBy?: string;
}


export interface IMeeting extends Document{
  
  meetingName: string;
  meetingId: string;

  supervisor:{
    supervisorId?: string;
    supervisorName?: string;
    supervisorEmail?: string;
    supervisorRole?: string;
  };
  selectedDate: Date;
  startTime: string;
  endTime: string;
  teacher:  string[];
  description: string;
  status: string;
  createdDate: Date;
  createdBy: string;
  updatedDate?: Date;
  updatedBy?: string;
}