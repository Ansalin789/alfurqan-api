import { appStatus, eventType } from "../config/messages";

// Use an enum for better type safety
export enum Status {
  ACTIVE = appStatus.ACTIVE,
  IN_ACTIVE = appStatus.IN_ACTIVE,
  DELETED = appStatus.DELETED,
}

export enum EventType {
  MEETING_SCHEDULED = eventType.MEETING_SCHEDULED,
  MEETING_WITHOUT_SCHEDULED = eventType.MEETING_WITHOUT_SCHEDULED,
  MEETING_CANCELLED = eventType.MEETING_CANCELLED,
}
export class CustomEnumerator {
  static readonly Status = Status;
  static readonly EventType = EventType;
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