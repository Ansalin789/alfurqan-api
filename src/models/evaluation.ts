import { model, Schema } from "mongoose";

import { IEvaluation } from "../../types/models.types";
import { z } from "zod";
import { appStatus, commonMessages, evaluationStatus, learningInterest, preferredTeacher, referenceSource } from "../config/messages";

const evaluationSchema = new Schema<IEvaluation>({
  student: {
    studentId: {
       type: String,
       required: true,
    },
    studentFirstName: {
        type: String,
        required: true,
    },
    studentLastName: {
        type: String,
        required: true,
    },
    studentEmail: {
        type: String,
        required: true,
    },
    studentPhone: {
        type: Number,
        required: true,
    },
    studentCity:{
        type: String,
        required: false,
    },
    studentCountry: {
        type: String,
        required: true,
    },
    studentCountryCode: {
        type: String,
        required: true,
    },
    learningInterest: {
        type: String,
        required: true,
    },
    numberOfStudents: {
        type: Number,
        required: true,
    },
    preferredTeacher: {
        type: String,
        required: true,
    }, 
    preferredFromTime: {
        type: String,
        required: false,
    },
    preferredToTime: {
        type: String,
        required: false,
    }, 
    timeZone: {
        type: String,
        required: true,
    },
    referralSource: {
        type: String,
        required: true,
    },
    preferredDate: {
        type: Date,
        required: false,
    },
    evaluationStatus: {
        type: String,
        required: true,
    }, 
    status: { 
        type: String,
        required: true,
    },
    createdDate: {
        type: Date,
        required: true,
    },
    createdBy: {
        type: String,
        required: false,
    }
  },
    isLanguageLevel: {
        type: Boolean,
        required: true,
    },
    languageLevel: {
        type: String,
        required: true,
    },
    isReadingLevel: {
        type: Boolean,
        required: true,
    },
    readingLevel: {
        type: String,
    },
    isGrammarLevel: {
        type: Boolean,
        required: true,
            },
    grammarLevel: {
        type: String,
        required: true,
    },
    hours: {
        type: Number,
        required: true,
    },
    subscription: {
        subscriptionId: {
            type: String,
            required: true,
        },
        subscriptionName: {
            type: String,
            required: true,
        },
        subscriptionPricePerHr: {
            type: Number,
            required: true,
        },
        subscriptionDays: {
            type: Number,
            required: true,
        },  
        subscriptionStartDate: {
            type: Date,
            required: true,
        },
        subscriptionEndDate: {
            type: Date,
            required: true,
        }
    },
    planTotalPrice: {
        type: Number,
        required: true
    },
    classStartDate: {
        type: Date,
        required: true,
    },
    classEndDate: {
        type: Date,
        required: true,
    },
    classStartTime: {
        type: String,
        required: true,
    },
    classEndTime: {
        type: String,
        required: true,
    },
    accomplishmentTime: {
        type: String,
    },
    studentRate:{
        type: Number,  
        required: true,
    },
    expectedFinishingDate: {
        type: Number,
        required: true,
    },
    gardianName: {
        type: String,
        required: true,
    },
    gardianEmail: {
        type: String,
        required: true,
        },
    gardianPhone: {
        type: String,
        required: true,
    },
    gardianCity: {
        type: String,
        required: true,
    },
    gardianCountry: {
        type: String,
        required: true,
    },
    gardianTimeZone: {
        type: String,
        required: true,
    },
    gardianLanguage: {
        type: String,
        required: true,
    },
    assignedTeacher:{
        type: String,
        required: true
    },
    studentStatus: {
        type: String,
        required: false,
    },
    classStatus: {
        type: String,
        required: false,
    },
   comments:{
    type: String,
    required: false
   },
    trialClassStatus:{
        type: String,
        required: false,
    },
    invoiceStatus: {
     type: String,
     required: false
    },
    paymentLink:{
      type: String,
      required: false
    },
    paymentStatus:{
    type: String,
    required: false
    },
    status: {
        type: String,
        required: false,
    },
    createdDate: {
        type: Date,
        required: true,
    },
    createdBy: {
        type: String,
        required: false,
    },
    updatedDate: {
        type: Date,
        required: false,
    },
    updatedBy: {
        type: String,
        required: false,
    },

},
{
    collection: "evaluations",
    timestamps: false,
}
);
export const zodEvaluationSchema = z.object({
    student: z.object({
        studentFirstName: z.string(),
        studentLastName: z.string(),
        studentEmail: z.string(),
        studentPhone: z.number(),
        studentCity: z.string().optional(),
        studentCountry: z.string(),
        studentCountryCode: z.string(),
        learningInterest: z.enum([learningInterest.QURAN, learningInterest.ISLAMIC, learningInterest.ARABIC]),
        numberOfStudents: z.number(),
        preferredTeacher: z.enum([preferredTeacher.TEACHER_1, preferredTeacher.TEACHER_2, preferredTeacher.TEACHER_3]),
        preferredFromTime: z.string().regex(/^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/, "Time must be in format HH:MM AM/PM"),
        preferredToTime: z.string().regex(/^(0[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/, "Time must be in format HH:MM AM/PM"),
        timeZone: z.string(),
        referralSource: z.enum([referenceSource.FRIEND, referenceSource.SOCIALMEDIA, referenceSource.EMAIL, referenceSource.GOOGLE, referenceSource.OTHER]),
        preferredDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: commonMessages.INVALID_DATE_FORMAT,
          }).transform((val) => new Date(val)).optional(),
        evaluationStatus: z.enum([evaluationStatus.PENDING, evaluationStatus.INPROGRESS, evaluationStatus.COMPLETED]),
        status: z.enum([appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED]),
        createdDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: commonMessages.INVALID_DATE_FORMAT,
          }).transform((val) => new Date(val)).optional(),
        createdBy: z.string().optional(),
      
    }),
    isLanguageLevel: z.boolean(),
    languageLevel: z.string(),
    isReadingLevel: z.boolean(),
    readingLevel: z.string().optional(),
    isGrammarLevel: z.boolean(),
    grammarLevel: z.string(),
    hours: z.number(),
    subscription: z.object({
        subscriptionName: z.string(),
    }),
    classStartDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: commonMessages.INVALID_DATE_FORMAT,
      }).transform((val) => new Date(val)),
    classEndDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: commonMessages.INVALID_DATE_FORMAT,
      }).transform((val) => new Date(val)).optional(),
    classStartTime: z.string(),
    classEndTime: z.string(),
    gardianName: z.string(),
    gardianEmail: z.string(),
    gardianPhone: z.string(),
    gardianCity: z.string(),
    gardianCountry: z.string(),
    gardianTimeZone: z.string(),
    gardianLanguage: z.string(),
    assignedTeacher: z.string(),
    studentStatus: z.string().optional(),
    classStatus: z.string().optional(),
    comments: z.string().optional(),
    trialClassStatus: z.string(),
    invoiceStatus: z.string().optional(),
    paymentLink: z.string().optional(),
    paymentStatus: z.string().optional(),
    status: z.string().optional(),
    createdDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: commonMessages.INVALID_DATE_FORMAT,
      }).transform((val) => new Date(val)).optional(),
    createdBy: z.string().optional(),
    updatedDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: commonMessages.INVALID_DATE_FORMAT,
      }).transform((val) => new Date(val)).optional().optional(),
    updatedBy: z.string().optional(),
});

export default model<IEvaluation>("Evaluation", evaluationSchema);