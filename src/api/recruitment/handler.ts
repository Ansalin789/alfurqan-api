import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { zodRecruitmentSchema } from "../../models/recruitment";
import { createRecruitment, getAllApplicantsRecords, getApplicantRecordById, updateApplicantById } from "../../operations/recruitment";
import { Readable } from "stream";
import * as Stream from "stream";
import { zodGetAllApplicantsRecordsQuerySchema, zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation";
import { isNil } from "lodash";
import { notFound } from "@hapi/boom";
import { recruitmentMessages } from "../../config/messages";
import pdfParse from "pdf-parse";
import fs from 'fs';


const createInputValidation = z.object({
  payload: zodRecruitmentSchema.pick({
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
    preferedWorkingDays: true,
    overallRating: true,
    professionalExperience: true,
    skills: true,
    status: true,
    createdDate: true,
    createdBy: true,
    updatedDate: true,
  }),
});

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

export default{
   async createRecruitement (req: Request, h: ResponseToolkit){
       const { payload } = createInputValidation.parse({
             payload: req.payload,
           });



           const rawPayload = req.payload as any;
    
           const uploadFileBuffer = rawPayload.uploadResume
           ? await streamToBuffer(rawPayload.uploadResume)
           : null;
                
           const  experience = rawPayload.uploadResume? await extractResumeDetails(uploadFileBuffer) :  null
          //console.log("Resume",uploadFileBuffer)

           return await createRecruitment({     
        candidateFirstName: payload.candidateFirstName,
        candidateLastName: payload.candidateLastName,
        gender: payload.gender || undefined,
        applicationDate: payload.applicationDate || new Date(),
        candidateEmail: payload.candidateEmail,
        candidatePhoneNumber: payload.candidatePhoneNumber,
        candidateCountry: payload.candidateCountry,
        candidateCity: payload.candidateCity,
        positionApplied: payload.positionApplied ,
        currency: payload.currency, 
        expectedSalary: payload.expectedSalary, 
        preferedWorkingHours: payload.preferedWorkingHours,
        uploadResume: uploadFileBuffer ? Buffer.from(uploadFileBuffer) : undefined ,
        comments: payload.comments,
        applicationStatus: payload.applicationStatus,
        level: payload.level, 
        quranReading: payload.quranReading, // Provide a default value for startDate
        tajweed: payload.tajweed, // Use a valid EvaluationStatus value
        arabicWriting: payload.arabicWriting, // Provide a default value for status
        arabicSpeaking: payload.arabicSpeaking,
        preferedWorkingDays: payload.preferedWorkingDays,
        overallRating: payload.overallRating,
        professionalExperience:experience?.workExperience || " ",
        skills:experience?.skills || " ",
        status:payload.status,
        createdDate: payload.createdDate || new Date(),
        createdBy: payload.createdBy || payload.candidateFirstName,
        updatedDate: payload.updatedDate
         }) 
    },

    async getAllApplicants (req: Request, h: ResponseToolkit){
      const { query } = getApplicantsInputValidation.parse({
      query: {
      ...req.query,
      filterValues: req.query?.filterValues ? JSON.parse(req.query.filterValues) : {},
      },
  });
  return getAllApplicantsRecords(query);
    },
    
    async getApplicantRecordById(req: Request, h: ResponseToolkit){
      const result = await getApplicantRecordById(String(req.params.applicantId));

      if (isNil(result)) {
           return notFound(recruitmentMessages.USER_NOT_FOUND);
           }

  return result;
    },

    async updateApplicantRecordById(req: Request, h: ResponseToolkit) {

      const { payload } = createInputValidation.parse({
        payload: req.payload
      });
   
      const result = await updateApplicantById(String(req.params.applicantId), payload);
      if (isNil(result)) {
        return notFound(recruitmentMessages.USER_NOT_FOUND);
      }
  
      return result;
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

    
    // Extract Skills
    const skillsMatch = text.match(/Skills([\s\S]*?)(?=(Education|Experience|Projects|$))/i);
    const skills = skillsMatch ? skillsMatch[1].trim() : 'Not found';

    // Extract Work Experience
    const workExpMatch = text.match(/EXPERIENCE([\s\S]*?)(?=(Education|Skills|Projects|$))/i);
    const workExperience = workExpMatch ? workExpMatch[1].trim() : 'Not found';


    return {
      workExperience,
      skills,
    };
  } catch (error) {
    console.error('Error extracting resume details:', error);
    throw error;
  }

   
};
