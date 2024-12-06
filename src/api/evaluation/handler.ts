import { ResponseToolkit,Request } from "@hapi/hapi";
import { zodEvaluationSchema } from "../../models/evaluation";
import { z } from "zod";
import { createEvaluationRecord,getAllEvaluationRecords,getEvaluationRecordById} from "../../operations/evaluation";
import { LearningInterest } from "../../shared/enum";
import { zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation";
import { getAllStudentsRecords } from "../../operations/student";
import { evaluationMessages, studentMessages } from "../../config/messages";
import { isNil } from "lodash";
import { notFound } from "@hapi/boom";





const createInputValidation = z.object({
    payload: zodEvaluationSchema.pick({
    student:true,
    subscription:true,
    isLanguageLevel:true,
    languageLevel:true,
    isReadingLevel:true,
    readingLevel:true,
    isGrammarLevel:true,
    grammarLevel:true,
    hours:true, 
    classStartDate:true,
    classEndDate:true,
    classStartTime:true,
    classEndTime:true,
    gardianName:true,
    gardianEmail:true,
    gardianPhone:true,
    gardianCity:true,
    gardianCountry:true,
    gardianTimeZone:true,
    gardianLanguage:true,
    status:true,
    createdBy:true,
    createdDate:true,  
    updatedBy:true
    }).partial()
  });


  const getEvaluationListInputValidation = z.object({
    query: zodGetAllRecordsQuerySchema.pick({
      searchText: true,
      sortBy: true,
      sortOrder: true,
      offset: true,
      limit: true,
      filterValues: true
    }),
  });

export default {
    async createEvaluation(req: Request, h: ResponseToolkit) {
        const { payload } = createInputValidation.parse({
            payload: req.payload,
        });
        return createEvaluationRecord({
            student: { // Ensure studentId is included
                studentFirstName: payload.student?.studentFirstName || "",
                studentLastName: payload.student?.studentLastName || "",
                studentEmail: payload.student?.studentEmail || "",
                studentPhone: payload.student?.studentPhone|| 0,
                studentCountry: payload.student?.studentCountry || "",
                studentCountryCode: payload.student?.studentCountryCode || "",
                learningInterest: payload.student?.learningInterest,
                numberOfStudents: payload.student?.numberOfStudents || 1,
                preferredTeacher: payload.student?.preferredTeacher || "defaultPreferredTeacher",
                preferredFromTime: payload.student?.preferredFromTime,
                preferredToTime: payload.student?.preferredToTime,
                timeZone: payload.student?.timeZone || "",
                referralSource: payload.student?.referralSource || "",
                preferredDate: payload.student?.preferredDate,
                evaluationStatus: payload.student?.evaluationStatus || "defaultStatus",
                status: payload.student?.status || "defaultStatus",
                createdDate: new Date(),
                createdBy: payload.student?.createdBy || "",
            },
            isLanguageLevel: payload.isLanguageLevel || false,
            languageLevel: payload.languageLevel || "",
            isReadingLevel: payload.isReadingLevel || false,
            readingLevel: payload.readingLevel || "",
            isGrammarLevel: payload.isGrammarLevel || false,
            grammarLevel: payload.grammarLevel || "",
            hours: payload.hours || 0,
            subscription:{
                subscriptionName: payload.subscription?.subscriptionName || "",
            } ,
            classStartDate: payload.classStartDate || new Date(),
            classEndDate: payload.classEndDate || new Date(),
            classStartTime: payload.classStartTime || "defaultStartTime",
            classEndTime: payload.classEndTime || "defaultEndTime",
            gardianName: payload.gardianName || "",
            gardianEmail: payload.gardianEmail || "",
            gardianPhone: payload.gardianPhone || "",
            gardianCity: payload.gardianCity || "",
            gardianCountry: payload.gardianCountry || "defaultCountry", // Add default value
            gardianTimeZone: payload.gardianTimeZone || "defaultTimeZone", // Add default value
            gardianLanguage: payload.gardianLanguage || "",
            status: payload.status,
            createdDate: new Date(),
            createdBy: payload.createdBy,
            updatedDate: new Date(),
            updatedBy: payload.updatedBy,
        });
    },

 // Update a new Evaluation
//  async updateEvaluation(req: Request, h: ResponseToolkit) {
//     const { payload } = createInputValidation.parse({
//       payload: req.payload,
//     });
//     return updateStudentEvaluation({     
//   firstName: payload.firstName,
//   lastName: payload.lastName,
//   email: payload.email,
//   phoneNumber: payload.phoneNumber,
//   country: payload.country,
//   countryCode: payload.countryCode,
//   learningInterest: payload.learningInterest || "defaultLearningInterest" ,
//   numberOfStudents: payload.numberOfStudents || 1, 
//   preferredTeacher: payload.preferredTeacher || "defaultPreferredTeacher", 
//   preferredFromTime: payload.preferredFromTime,
//   preferredToTime: payload.preferredToTime,
//   timeZone: payload.timeZone,
//   referralSource: payload.referralSource || "defaultReferralSource", 
//   startDate: payload.startDate || new Date(), // Provide a default value for startDate
//   evaluationStatus: payload.evaluationStatus || EvaluationStatus.PENDING, // Use a valid EvaluationStatus value
//   status: payload.status || "defaultStatus", // Provide a default value for status
//   createdBy: payload.createdBy,
//   lastUpdatedBy: payload.lastUpdatedBy
//   })
// }


// Retrieve all the Evaluation list
 getAllEvaluationList(req: Request, h: ResponseToolkit) {
    const { query } = getEvaluationListInputValidation.parse({
      query: {
        ...req.query,
        filterValues: req.query?.filterValues ? JSON.parse(req.query.filterValues) : {},
      },
    });
    return getAllEvaluationRecords(query);
  },
  

  



    // Retrieve student details by studentId
  async getEvaluationRecordById(req: Request, h: ResponseToolkit) {
    const result = await getEvaluationRecordById(String(req.params.evaluationId));
  
    if (isNil(result)) {
      return notFound(evaluationMessages.EVALUATIONS_NOT_FOUND);
    }
  
    return result;
  },
  }



