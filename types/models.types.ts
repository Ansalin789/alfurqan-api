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
enum notificationStatus{
  SEEN = "Seen",
  UN_SEEN = "Unseen",
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
  gender: string;
  email: string;
  password: string;
  role: string[];
  profileImage?: string | null;
  lastLoginDate?: Date;
  country?: string;
  status: Status;
  createdDate?: Date;
  createdBy: string;
  lastUpdatedDate?: Date;
  lastUpdatedBy: string;
}

export interface IUserCreate {
  userId?: string;
  userName: string;
  gender: string;
  email: string;
  password: string;
  role: string[];
  profileImage?: string | null;
  lastLoginDate?: Date;
  country?: string;
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
  gender: string;
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
  refernceId: string,
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
  gender: string;
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
  refernceId: string,
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
  employeeId: string;
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
  employeeId: string;
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
  course: {
    courseId?: string;
    courseTitle: string;
    courseDuration: string;
    courseDescription: string;
    courseLevel: string;
  };
  level: {
    levelId: string;
    contentLevel: string;
    descriptions: Buffer;
    duration: string;
  }[]; // <-- make level an array
  courseName: string;
  status: string;
  createdDate: Date;
  createdBy: string;
  lastUpdatedDate: Date;
  lastUpdatedBy: string;
}

export interface ICourseCreate {
  course: {
    courseId?: string;
    courseTitle:string;
    courseDuration:string;
    courseDescription:string;
    courseLevel:string;
  };
  level :{
    levelId:string;
    contentLevel:string;
    descriptions:Buffer;
    duration:string;

  }[]
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
  studentGender: string;
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
teacher:{
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
},
classDay: any;
classType: string;
startTime: any;
endTime: any;
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
teacherStatus?: string;
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
  studentGender: string;
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
teacher:{
  teacherName: string;
},
classDay?: string[];
startTime?: string[];
endTime?: string[];
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
teacherStatus?: string;
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
    gender: string;
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
  totalHourse: number;
  classhour:string;
  amount:string;
  currency:string;
  sessionClassType:string;
  sessionStarttime:string;
  sessionsEndtime:string;
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
  teacherAttendee: string;
  studentAttendee: string;
}

export interface IClassScheduleCreate{
  student: {
    studentId?: string;
    studentFirstName: string;
    studentLastName: string;
    studentEmail: string;
    gender: string;
  },
  teacher:{
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
  },
  classhour:string;
  amount:string;
  currency:string;
  sessionClassType:string;
  sessionStarttime:string;
  sessionsEndtime:string;
  classDay: string[];
  classStatus:string;
  package: string;
  preferedTeacher: string;
  course: string;
  totalHourse: number;
  startDate: Date;
  endDate: Date;
  startTime: string[];
  endTime: string[];
  scheduleStatus: string,
  teacherAttendee: string;
  studentAttendee: string;
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
    studentPhone: number;
    gender: string;
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
    studentPhone: number;
    gender: string;
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
  assignedTeacherId: string;
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
export interface IallAssignment {
  studentId: string;
  assignmentName: string;
  assignedTeacher: string;
  assignedTeacherId: string;
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
  studentId?: string;
  assignmentName: string;
  assignedTeacher?: string;
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
  assignedDate?: Date;
  dueDate?: Date;
  answer: string;
  answerValidation: string;
  assignmentStatus: string;
}
export interface IStudentInvoice extends Document {
  student: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    studentPhone: string;
    country: string;
    city: string;
  };
  courseName: string;
  amount: number; 
  packageType:string;
  itemDescription:string;
  duration:string;
  rate:string;
  description:string;
  attachFile?:Buffer;
  dueDate:string;
  invoiceStatus: string;
  status: string;
  createdDate?: string;
  createdBy: string;
  lastUpdatedDate?: string;
  lastUpdatedBy: string;
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



export interface ISupervisorFeedbackCreate {
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



export interface ISuperviosrFeedback  extends Document{
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
    supervisorId: string;
    supervisorName: string;
    supervisorEmail: string;
    supervisorRole: string;
  };
  gender?: string;
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
  applicationStatus?: string;
  level?: string;
  quranReading? : string;
  tajweed? : string;
  arabicWriting?: string;
  arabicSpeaking?: string;
  englishSpeaking?: string;
  preferedWorkingDays?: string;
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
  supervisor:{
    supervisorId?: string,
    supervisorName?: string,
    supervisorEmail?: string,
    supervisorRole?: string
  }  ,
  candidateFirstName: string;
  candidateLastName : string;
  gender?:  string;
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
  comments?: string;
  applicationStatus: string;
  level? : string;
  quranReading? : string;
  tajweed? : string;
  arabicWriting?: string;
  arabicSpeaking?: string;
  englishSpeaking?: string;
  preferedWorkingDays?: string;
  overallRating?: number;
  professionalExperience?: string;
  skills?: string;
  status?: string;
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
  meetingStatus: string;
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
  startTime: any;
  endTime: any;
  teacher:  string[];
  description: string;
  status: string;
  meetingStatus: string;
  createdDate: Date;
  createdBy: string;
  updatedDate?: Date;
  updatedBy?: string;
}

export interface INotification{
    messages ?: string;
    isRead ?: boolean;
    senderId : string;
    senderName : string;
    senderEmail : string;
    receiverId : string;
    receiverName : string;
    receiverEmail : string;
    notificationType ?: string;
    notificationStatus ?: string;
    status: string;
    createdDate: Date;
    createdBy: string;
    updatedDate?: Date;
    updatedBy?: string;
}

export interface INotification extends Document{
  messages ?: string;
  isRead ?: boolean;
  senderId : string;
  senderName : string;
  senderEmail : string;
  receiverId : string;
  receiverName : string;
  receiverEmail : string;
  notificationType ?: string;
  notificationStatus ?: string;
  status : string;
  createdDate : Date;
  createdBy: string;
  updatedDate?: Date;
  updatedBy?: string;
}

export interface IOtherEmployee extends Document{
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number;
  nationality: string;
  country: string ;
  city: string;
  dateOfBirth: string;
  gender: string;
  residentialAddress: string;
  higherQualification: string;
  universityName: string;
  previousJob: string;
  experience: string;
  bankName: string;
  accountNumber: number;
  bankCode: string;
  passportNumber: string;
  languagesKnown: string;
  emergencyContactNumber: number;
  relationshipWithEmployee: string
  address: string;
  designation: string;
  department: string;
  preferedWorkingHours: number;
  preferedShiftFrom : string;
  preferedShiftTo: string;
  comments: string;
  profileImage: string;
  applicationDate: Date;
  currency: string;
  expectedSalary: number;
  applicationStatus: string;
  preferedWorkingDays: string;
  resume: any;
  status: string;
  createdDate: Date;
  createdBy: string;
  updatedDate: Date;
  updatedBy: string;
}


export interface IOtherEmployeeCreate{
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: number;
  nationality: string;
  country: string ;
  city: string;
  dateOfBirth: string;
  gender: string;
  residentialAddress: string;
  higherQualification: string;
  universityName: string;
  previousJob: string;
  experience: number;
  bankName: string;
  accountNumber: number;
  bankCode: string;
  passportNumber: string;
  languagesKnown: string;
  emergencyContactNumber: number;
  relationshipWithEmployee: string
  address: string;
  designation: string;
  department: string;
  preferedWorkingHours: number;
  preferedShiftFrom : string;
  preferedShiftTo: string;
  comments: string;
  profileImage: string;
  applicationDate: Date;
  currency: string;
  expectedSalary: number;
  applicationStatus: string;
  preferedWorkingDays?: string;
  resume: any;
  status: string;
}
export interface IAccessModel {
  employeeId: string;
  employeeName: string;
  contact: string;
  designation: string[];
  dateOfJoining?: Date; // Format: 'DD/MM/YYYY'
  roleAccess: {
    admin?: boolean;
    adminmodules?: {
      dashboard?: boolean;
      evaluation?: boolean;
      student?: boolean;
      employees?: boolean;
      courses?: boolean;
      classes?: boolean;
      invoice?: boolean;
      analytics?: boolean;
      messages?: boolean;
      settings?: boolean;
    };
    academicCoach?: boolean;
    academicmodules?: {
      dashboard?: boolean;
      scheduledevaluation?: boolean;
      scheduledtrail?: boolean;
      students?: boolean;
      teachers?: boolean;
      messages?: boolean;
      support?: boolean;
    };
    supervisor?: boolean;
    supervisormodules?: {
      dashboard?: boolean;
      recuirement?: boolean;
      meeting?: boolean;
      teachers?: boolean;
      messages?: boolean;
      support?: boolean;
    };
      student?: boolean;
      studentmodules?: {
        dashboard?: boolean;
        recuirement?: boolean;
        meeting?: boolean;
        teachers?: boolean;
        messages?: boolean;
        suppor?: boolean;
      };
      teacher?: boolean;
      teachermodules?: {
        dashboard?: boolean;
        recuirement?: boolean;
        meeting?: boolean;
        teachers?: boolean;
        messages?: boolean;
        support?: boolean;
      };
 
  };
}


export interface IAccessModel extends Document{
  employeeId: string;
  employeeName: string;
  contact: string;
  designation: string[];
  dateOfJoining?: Date; // Format: 'DD/MM/YYYY'
  roleAccess: {
    admin?: boolean;
    adminmodules?: {
      dashboard?: boolean;
      evaluation?: boolean;
      student?: boolean;
      employees?: boolean;
      courses?: boolean;
      classes?: boolean;
      invoice?: boolean;
      analytics?: boolean;
      messages?: boolean;
      settings?: boolean;
    };
    academicCoach?: boolean;
    academicmodules?: {
      dashboard?: boolean;
      scheduledevaluation?: boolean;
      scheduledtrail?: boolean;
      students?: boolean;
      teachers?: boolean;
      messages?: boolean;
      support?: boolean;
    };
    supervisor?: boolean;
    supervisormodules?: {
      dashboard?: boolean;
      recuirement?: boolean;
      meeting?: boolean;
      teachers?: boolean;
      messages?: boolean;
      support?: boolean;
    };
      student?: boolean;
      studentmodules?: {
        dashboard?: boolean;
        recuirement?: boolean;
        meeting?: boolean;
        teachers?: boolean;
        messages?: boolean;
        suppor?: boolean;
      };
      teacher?: boolean;
      teachermodules?: {
        dashboard?: boolean;
        recuirement?: boolean;
        meeting?: boolean;
        teachers?: boolean;
        messages?: boolean;
        support?: boolean;
      };
 
  };
    status: string;
    createdDate: Date;
    createdBy: string;
    updatedDate?: Date;
    updatedBy?: string;
}


export interface IAdminMeetingCreate {
  meetingName: string;
  meetingId?: string;
  admin?: {
    adminId?: string;
    adminName?: string;
    adminEmail?: string;
    adminRole?: string;
  };
  selectedDate: Date;
  startTime: string;
  endTime: string;
  teacher: {
    teacherId: string;
    teacherName: string;
    teacherEmail: string;
  }[]; // <-- ✅ MUST be an array of teacher objects
  description: string;
  status: string;
  meetingStatus?: string;
  createdDate?: Date;
  createdBy: string;
  updatedDate?: Date;
  updatedBy?: string;
}



export interface IAdminMeeting extends Document{
  
  meetingName: string;
  meetingId: string;
   admin:{
    adminId?: string;
    adminName?: string;
    adminEmail?: string;
    adminRole?: string;
  };
  selectedDate: Date;
  startTime: any;
  endTime: any;
  teacher:  string[];
  description: string;
  status: string;
  meetingStatus: string;
  createdDate: Date;
  createdBy: string;
  updatedDate?: Date;
  updatedBy?: string;
}
export interface RealTimeMessageCreate{
  messages : string;
  isRead : boolean;
  senderId : string;
  senderName : string;
  senderEmail ?: string;
  receiverId : string;
  receiverName : string;
  receiverEmail ?: string;
  notificationStatus : notificationStatus;
  status?: string;
  createdDate?: Date;
  createdBy?: string;
  updatedDate?: Date;
  updatedBy?: string;
}

export interface RealTimeMessage extends Document{
messages : string;
isRead : boolean;
senderId : string;
senderName : string;
senderEmail ?: string;
receiverId : string;
receiverName : string;
receiverEmail ?: string;
notificationStatus : notificationStatus;
status ?: string;
createdDate ?: Date;
createdBy?: string;
updatedDate?: Date;
updatedBy?: string;
}
