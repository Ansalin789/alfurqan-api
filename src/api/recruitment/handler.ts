import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { zodRecruitmentSchema } from "../../models/recruitment";
import { createRecruitment, getAllApplicantsRecords, getAllTeacherRecords, getApplicantRecordById, getApplicationStatusData, getTeacherCountriesCountDetails, updateApplicantByAdminId, updateApplicantById } from "../../operations/recruitment";
import { Readable } from "stream";
import * as Stream from "stream";
import { zodGetAllApplicantsRecordsQuerySchema, zodGetAllRecordsQuerySchema, zodGetAllTeachersRecordsQuerySchema } from "../../shared/zod_schema_validation";
import { notFound } from "@hapi/boom";
import { recruitmentMessages } from "../../config/messages";
import pdfParse from "pdf-parse";
import { isNil, result } from "lodash";
import { supervisorCardCount, supervisorRecruitmentList, supervisorTeacherList } from "../../kafka/producers/supervisorProducer";

const createInputValidation = z.object({
  payload: zodRecruitmentSchema.pick({
    supervisor: true,
    candidateFirstName: true,
    candidateLastName: true,
    gender: true,
    applicationDate: true,
    candidateEmail: true,
    candidatePhoneNumber: true,
    candidateCountry: true,
    candidateCity: true,
    positionApplied: true,
    currency: true,
    expectedSalary: true,
    preferedWorkingHours: true,
    comments: true,
    applicationStatus: true,
    level: true,
    quranReading: true,
    tajweed: true,
    arabicWriting: true,
    arabicSpeaking: true,
    englishSpeaking: true,
    preferedWorkingDays: true,
    overallRating: true,
    skills: true,
    status: true,
    createdDate: true,
    createdBy: true,
    updatedDate: true,
  }),
});

 const updateInputValidation = z.object({
  payload: zodRecruitmentSchema.pick({
    supervisor: true,
    comments: true,
    applicationStatus: true,
    level: true,
    quranReading: true,
    tajweed: true,
    arabicWriting: true,
    arabicSpeaking: true,
    englishSpeaking: true,
    preferedWorkingDays: true,
    overallRating: true,
    status:true,
    updatedDate: true,
  }),
 })

 const updateAdminInputValidation = z.object({
  payload: zodRecruitmentSchema.pick({
    supervisor: true,
    applicationStatus: true,
    status:true,
    updatedDate: true,
  }),
 })

const getApplicantsInputValidation = z.object({
  query: zodGetAllApplicantsRecordsQuerySchema.pick({
    searchText: true,
    sortBy: true,
    sortOrder: true,
    offset: true,
    limit: true,
    filterValues: true
  }),
});


const getTeacherInputValidation = z.object({
  query: zodGetAllTeachersRecordsQuerySchema.pick({
    teacherGroup: true,
    supervisorId: true
  }),
});


export default{
  async createRecruitement(req: Request, h: ResponseToolkit) {
  try {
    const { payload } = createInputValidation.parse({
      payload: req.payload,
    });

    const rawPayload = req.payload as any;

    const uploadFileBuffer = rawPayload.uploadResume
      ? await streamToBuffer(rawPayload.uploadResume)
      : null;

    const experience = rawPayload.uploadResume
      ? await extractResumeDetails(uploadFileBuffer)
      : null;

    const result = await createRecruitment({
      supervisor: {
        supervisorId: payload.supervisor?.supervisorId || "67a467bcc346aaaea402f760",
        supervisorName: payload.supervisor?.supervisorName || " ",
        supervisorEmail: payload.supervisor?.supervisorEmail || " ",
        supervisorRole: payload.supervisor?.supervisorRole || " ",
      },
      candidateFirstName: payload.candidateFirstName,
      candidateLastName: payload.candidateLastName,
      gender: payload.gender || undefined,
      applicationDate: payload.applicationDate || new Date(),
      candidateEmail: payload.candidateEmail,
      candidatePhoneNumber: payload.candidatePhoneNumber,
      candidateCountry: payload.candidateCountry,
      candidateCity: payload.candidateCity,
      positionApplied: payload.positionApplied,
      currency: payload.currency,
      expectedSalary: payload.expectedSalary,
      preferedWorkingHours: payload.preferedWorkingHours,
      uploadResume: uploadFileBuffer
        ? Buffer.from(uploadFileBuffer)
        : undefined,
      comments: payload.comments || "",
      applicationStatus: payload.applicationStatus,
      level: payload.level,
      quranReading: payload.quranReading,
      tajweed: payload.tajweed,
      arabicWriting: payload.arabicWriting,
      arabicSpeaking: payload.arabicSpeaking,
      englishSpeaking: payload.englishSpeaking,
      preferedWorkingDays: payload.preferedWorkingDays,
      overallRating: payload.overallRating,
      professionalExperience: JSON.parse(rawPayload.professionalExperience),
      skills: payload.skills || " ",
      status: payload.status,
      createdDate: payload.createdDate || new Date(),
      createdBy: payload.createdBy || payload.candidateFirstName,
      updatedDate: payload.updatedDate,
    });

    // ✅ Check if result has an error before proceeding
    if ("error" in result) {
      return h.response({ message: "Recruitment creation failed", error: result.error }).code(400);
    }
    if(result){
     const supervisorId = result.supervisor.supervisorId;
    await supervisorCardCount({supervisorId});
    await supervisorRecruitmentList({event :"create", data : result});
    }
    return h.response(result).code(201);

  } catch (error) {
    console.error("Recruitment creation error:", error);
    return h.response({ message: "Internal Server Error", error }).code(500);
  }
},


 async getAllApplicants(req: Request, h: ResponseToolkit) {
  // Parse filterValues from either a JSON string or flat query params
  let filterValues: any = {};

  if (typeof req.query.filterValues === "string") {
    try {
      filterValues = JSON.parse(req.query.filterValues);
    } catch {
      filterValues = {};
    }
  } else {
    filterValues = {
      applicationStatus: req.query.applicationStatus,
      positionApplied: req.query.positionApplied,
      dateRange:
        req.query["dateRange.from"] && req.query["dateRange.to"]
          ? {
              from: req.query["dateRange.from"],
              to: req.query["dateRange.to"],
            }
          : undefined,
    };
  }

  // Build the full query object for validation
  const input = {
    query: {
      ...req.query,
      filterValues,
    },
  };

  // Validate and normalize query
  const { query } = getApplicantsInputValidation.parse(input);

  // ---- Fix: Convert offset and limit to string or null ----
  const queryForService = {
    ...query,
    offset:
      query.offset !== null && query.offset !== undefined
        ? String(query.offset)
        : null,
    limit:
      query.limit !== null && query.limit !== undefined
        ? String(query.limit)
        : null,
  };

  // Call your service function
  return getAllApplicantsRecords(queryForService);
}

,



    async getApplicantRecordById(req: Request, h: ResponseToolkit){
      const result = await getApplicantRecordById(String(req.params.applicantId));

      if (isNil(result)) {
           return notFound(recruitmentMessages.USER_NOT_FOUND);
           }

  return result;
    },


    

    async updateApplicantRecordById(req: Request, h: ResponseToolkit) {

      const { payload } = updateInputValidation.parse({
        payload: req.payload
      });
   
      const result = await updateApplicantById(String(req.params.applicantId), payload);
      if (isNil(result)) {
        return notFound(recruitmentMessages.USER_NOT_FOUND);
      }
      if(result){
       const supervisorId = result.supervisor.supervisorId;
      await supervisorCardCount({supervisorId});
      await supervisorRecruitmentList({event : "update", data : result});
      }
      return result;
    },

    async updateAdminApplicantRecordById(req: Request, h: ResponseToolkit) {

      const { payload } = updateAdminInputValidation.parse({
        payload: req.payload
      });
   console.log(">>>>>",payload.applicationStatus);
      const result = await updateApplicantByAdminId(String(req.params.id), payload);
      if (isNil(result)) {
        return notFound(recruitmentMessages.USER_NOT_FOUND);
      }
      if(result){
        await supervisorTeacherList({result});
            }
      return result;
    },

  async getTeacherList (req: Request, h: ResponseToolkit){
      const { query } = getTeacherInputValidation.parse({
      query: {
      ...req.query,
      },
  });
  return getAllTeacherRecords(query);
    },



  async getTeacherCountriesCount(req: Request, h: ResponseToolkit){
      return await getTeacherCountriesCountDetails();
    },

   async getApplicationData(req: Request, h: ResponseToolkit){
     return await getApplicationStatusData(req.query.fromDate, req.query.toDate);
   }

};




async function streamToBuffer(stream: Stream.Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
  });
};


const extractResumeDetails = async (fileStream: any) => {
  try {
    // Convert stream to buffer
   // const dataBuffer = await streamToBuffer(fileStream);

    // Extract text using pdf-parse
    const data = await pdfParse(fileStream);
    const text = data.text;

    
    // // Extract Skills
    // const skillsMatch = text.match(/Skills([\s\S]*?)(?=(Education|Experience|Projects|$))/i);
    // const skills = skillsMatch ? skillsMatch[1].trim() : 'Not found';

    // Extract Work Experience
    const workExpMatch = text.match(/EXPERIENCE([\s\S]*?)(?=(Education|Skills|Projects|$))/i);
    const workExperience = workExpMatch ? workExpMatch[1].trim() : 'Not found';


    return {
      workExperience,
    };
  } catch (error) {
    console.error('Error extracting resume details:', error);
    throw error;
  }

   
};
