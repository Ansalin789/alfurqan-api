import { model, Schema } from "mongoose";

import { IEvaluation } from "../../types/models.types";

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
        type: String,
        required: true,
    },
    studentCity: {
        type: String,
        required: true,
    },
    studentCountry: {
        type: String,
        required: true,
    },
    preferredDate: {
        type: Date,
        required: false,
    },
    preferredFromTime: {
        type: String,
        required: false,
    },
    preferredToTime: {
        type: String,
        required: false,
    },
    preferredTeacher: {
        type: String,
        required: true,
    },  
    noOfStudents: {
        type: Number,
        required: true,
    },
  },
    course: {
      courseId: {
        type: String,
        required: true,
      },
      courseName: {
        type: String,
        required: true,
        },
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
        type: Date,
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
    studentStatus: {
        type: String,
        required: false,
    },

    teacherStatus: {
        type: String,
        required: false,
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

export default model<IEvaluation>("Evaluation", evaluationSchema);