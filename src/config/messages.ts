export const userMessages: Record<string, string> = Object.freeze({
  LIST: "Retrieve all the users list",
  BYID: "Retrieve user details by userId",
  CREATE: "Create a new user",
  UPDATE: "Update a existing user",
  DELETE: "Delete user by userId",
  BULK_DELETE: "Bulk Delete users by userIds",
  USER_NOT_FOUND: "Your account is not found or active, contact admin",
  ENCRYPT_PASSWORD_ERROR: "Password must be an encrypted value",
  USER_PROFILE_INVALID_FILE_TYPE: "Invalid file type. Only .png , .jpg or jpeg files are allowed.",
});


export const authMessages: Record<string, string> = Object.freeze({
  CHANGE_PASSWORD: "Update users password",
  SIGN_IN: "Sign In user by username and password",
  SIGN_OUT: "Sign out user by token",
  INCORRECT_PASSWORD: "Password is incorrect, please retry again",
  NO_TOKEN_PROVIDED: "No token provided",
  INVALID_TOKEN: "Invalid token provided",
  SIGNOUT_SUCCESS: "You are signed out of your account",
  SIGNOUT_UNSUCCESS: "Unable to sign out",
  TOKEN_NO_LONGER_VALID: "Token is no longer valid",
});




export const appStatus: Record<string, any> = Object.freeze({
  ACTIVE: "Active",
  IN_ACTIVE: "Inactive",
  DELETED: "Deleted",
  ARCHIVED: "Archived",
  NEW: "New"
});

export const appPlatforms: Record<string, string> = Object.freeze({
  WEB: "Web",
  ONLINE: "Online"
})


export const eventType: Record<string, any> = Object.freeze({
  MEETING_SCHEDULED: "MEETING_SCHEDULED",
  MEETING_CANCELLED: "MEETING_CANCELLED",
  MEETING_UPDATED: "MEETING_UPDATED",
});
export const appRegexPatterns = Object.freeze({
  OBJECT_ID: /^[a-fA-F0-9]{24}$/,
  NUMBER: /^\d+$/
});

export const commonMessages: Record<string, any> = Object.freeze({
  SERVER_HEALTH: "Service Health Check",
  SERVER_HEALTH_NOTES: "Return the current status of the API",
  INTERNAL_SERVER_ERROR: "Internal Server Error",
  BAD_REQUEST_ERROR: "Bad Request",
  VALIDATION_ERROR: "Validation error",
  DUPLICATE_RECORD_FOUND: "Duplicate record found",
  DUPLICATE_RECORD_ERROR: "E11000 duplicate key error collection",
  MALFORMED_RECORD_ERROR: "Malformed UTF-8 data",
  MALFORMED_RECORD_FOUND: "Password must be an valid encrypted value",
  INVALID_DATE_FORMAT: "Invalid date format",
  INVALID_OBJECT_ID: "Invalid ObjectId",
  NOT_FOUND: " not found",
  RECORD_NOT_FOUND: "Record Not Found",
  TENANT_NOT_FOUND: "Tenant not found",
  EMAIL_TEMPLATE_NOT_FOUND: "Email template not found",
  GREETINGS: "Greetings to all",
  LIMIT: '10',
  OFFSET: '0',
  INVALID_TYPE: "Invalid type",
  PROFILE_UPLOAD_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
});


export const appStatusCodes: number[] = [200];

export const appDateTime: string[] = ["YYYY-MM-DD HH:mm:ss", "DD MMM YYYY", "YYYY-MM-DDTHH:mm:ss"];

export const appDataTypes = Object.freeze({
  TEXT: "text",
  LIST: "list",
  DATE: "date",
  CHIPS: "chip",
});


export const meetingSchedulesMessages: Record<string, any> = Object.freeze({
  LIST: "Retrieve all the meeting schedules list",
  BYID: "Retrieve meeting schedules details by meetingScheduleId",
  INTERVIEW_LIST:"Retrieve all the interview scheduled meeting",
  INTERVIEW_LIST_CANDIDATE:"Retrieve all the interview scheduled meeting for candidate",
  MEETING_SCHEDULE_NOT_FOUND: "Meeting schedule not found",
  GET_ALL_LIST_START: 'getAllMeetingSchedulesRecords - Start',
  GET_ALL_LIST_SUCCESS: 'getAllMeetingSchedulesRecords - Success',
  MEETING_STATUS: ['Pending', 'Completed', 'Cancelled'],
  CANDIDATE_RESPONSE: ['ACCEPTED', 'NOT RESPONDED', 'DECLINED'],
  DATE_FORMAT: /^\d{4}-\d{2}-\d{2}$/,
  DATE_FORMAT_INVALID: 'Date must be in the format YYYY-MM-DD',
  CREATE: "Create a new meeting schedules",
  UPDATE: "Update meeting schedule details by meetingScheduleId",
  DELETE: "Delete meeting schedule details by meetingScheduleId",
  INVALID_APPLICATION_STATUS: "Meeting schedule is already ",
  MEETING_NOT_SCHEDULED: "Meeting is not scheduled",
  MEETING_SCHEDULED_CANCELLED: "Meeting schedule has been cancelled",
  UPDATE_FAILED: "Failed to update the meeting schedule",
  DELETE_FAILED: "Failed to delete the meeting schedule",
  REFERENCE_TYPE: ['MEETING_SCHEDULED'],
  INVALID_ID: "Invalid ID",
  INVALID_DATE_RANGE: "The date range is invalid because the start date is greater than the end date.",
  MISSING_DATE_PAIR: "Both the start date and end date are required.",
  TEAMS_FOR_BUSINESS: "teamsForBusiness",
  REQUIRED: "required",
  OPTIONAL: "optional",
  HTML: "HTML",
  VERIFY_INTEGRATION: 'Verify the integration for',
  FAILED_TO_CONNECT: 'Failed to connect',
  CHECK_INTEGRATION: '. Kindly check the integration',
  INVALID_CREDENTIAL: 'Invalid credentials provided for tenant configuration.',
  UNAUTHORIZED_ACCESS: 'Unauthorized access. Please check the tenant credentials.',
  FORBIDDEN_ACCESS: 'Forbidden access. You do not have permission to perform this action.',
  FAILED_ACCESS_TOKEN: `Failed to retrieve access token for schedule meeting. Kindly verfiy the clander integration`,
  EMAIL_NOT_FOUND: "The requested resource or user email was not found",
  UNKNOWN_ERROR: 'An unknown error occurred while creating the event:',
  NORESPONSE: "No response received from the server while creating the event.",
  FAILED_TO_CREATE_EVENT: "Failed to create calendar event.",
  FAILED_TO_UPDATE_EVENT: "Failed to update calendar event",
  UNKNOWN_ERROR_UPDATE_EVENT: 'An unexpected error occurred while updating the event.',
  INVALID_REFERENCE_ID: "Invalid referenceId",
  FAILED_ASSESSMENT: 'Failed to connect Assessment. Please check the integration.'
});

export const socketEventNames: Record<string, any> = Object.freeze({
  USERS: 'users',
  DASHBOARD: 'dashboard',
  WEB_NOTIFICATION: 'web-notification'
})

export const fileMessages: Record<string, any> = Object.freeze({
  MAX_FILE_SIZE: 20971520,
});

export const tenantsMessages: Record<string, any> = Object.freeze({
  LIST: "Retrieve all the tenant settings list",
  CREATE: "Create a new tenant settings",
  UPDATE: "Update a existing tenant settings",
  TENANT_SETTINGS_NOT_FOUND: "Tenant settings not found",
  TENANT_SETTINGS_ALREADY_EXIST: "Tenant settings is already exists",
  KEY_ALREADY_EXIST: "Key is already exists",
  MODULE_TYPES: ['Integration', 'General', 'Preference'],
  KEYNAMES: ['ATS_ZOHO_CONFIG', 'CALENDAR_GOOGLE_CONFIG', 'CALENDAR_TEAMS_CONFIG', 'MAIL_GOOGLE_CONFIG', 'MAIL_OUTLOOK_CONFIG', 'DATE_FORMAT', 'TIME_ZONE', 'AI_MODEL'],
  GET_ALL_LIST_START: 'getAllTenantSettingsRecords - Start',
  GET_ALL_LIST_SUCCESS: 'getAllTenantSettingsRecords - Success',
  UPDATE_FAILED: "Failed to update the tenant settings",
  BYID: "Get Tenant details by Tenant Code",
});



export const notificationsMessages: Record<string, any> = Object.freeze({
  LIST: "Retrieve all the notifications list",
  BULK_UPDATE: "Update all the notifications list by userId",
  NOTIFICATION_NOT_FOUND: "Notification not found",
  GET_ALL_LIST_START: 'getAllNotificationsRecords - Start',
  GET_ALL_LIST_SUCCESS: 'getAllNotificationsRecords - Success',
  REFERENCE_TYPES: ['Jobprofiling', 'MEETING_SCHEDULED', "JOB_NOTES", "CANDIDATE_FEEDBACKS", "IMPORT_JOBS", "CANDIDATE_JOB_APPLY", "CANDIDATE_INTERVIEW_STATUS"],
  DATE_FORMAT: /^\d{4}-\d{2}-\d{2}$/,
  DATE_FORMAT_INVALID: 'Date must be in the format YYYY-MM-DD',
  UPDATE: "Update notification details by notificationId",
  UPDATE_FAILED: "Failed to update the notification",
  INVALID_ID: "Invalid ID",
  INVALID_DATE_RANGE: "The date range is invalid because the start date is greater than the end date.",
  MISSING_DATE_PAIR: "Both the start date and end date are required.",

})
