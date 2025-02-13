import { ResponseToolkit, Request } from "@hapi/hapi";
import { z } from "zod";
import { zodRecruitmentSchema } from "../../models/recruitment";
import { createRecruitment } from "../../operations/recruitment";
import { Readable } from "stream";
import * as Stream from "stream";


const createInputValidation = z.object({
  payload: zodRecruitmentSchema.pick({
    candidateFirstName: true,
    candidateLastName: true,
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


export default{
  async createRecruitement (req: Request, h: ResponseToolkit){
       const { payload } = createInputValidation.parse({
             payload: req.payload,
           });



           const rawPayload = req.payload as any;
    
          console.log("rawPayload.uploadResume", rawPayload.uploadResume)
           const uploadFileBuffer = rawPayload.uploadResume
           ? await streamToBuffer(rawPayload.uploadResume)
           : null;
                
          console.log("Resume",uploadFileBuffer)

           return createRecruitment({     
        candidateFirstName: payload.candidateFirstName,
        candidateLastName: payload.candidateLastName,
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
        professionalExperience:payload.professionalExperience,
        skills: payload.skills,
        status:payload.status,
        createdDate: payload.createdDate || new Date(),
        createdBy: payload.createdBy || payload.candidateFirstName,
        updatedDate: payload.updatedDate
         }) 
    }
}



async function streamToBuffer(stream: Stream.Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => reject(err));
  });
}

function toReadableStream(data: string | Buffer): Readable {
  if (typeof data === "string" || Buffer.isBuffer(data)) {
    return Readable.from(data);
  }
  throw new Error("Invalid type, expected string or Buffer");
}

