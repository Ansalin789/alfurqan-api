import { Request, ResponseToolkit } from "@hapi/hapi";
import Stripe from 'stripe';
import { config } from "../../config/env";
import EvaluationModel from "../../models/evaluation";
import { Types } from "mongoose";
import PaymentDetailsModel from "../../models/paymentDetails";
import StudentPortModel from "../../models/alstudents";
import InvoiceModel from "../../models/stinvoice";
import { IClassSchedule } from "../../../types/models.types";
import UserModel from "../../models/users";
import  ClassScheduleModel  from "../../models/classShedule";
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from "@azure/identity";

export const createPaymentIntent = async (request: Request, h: ResponseToolkit) => {
  console.log("Received request payload:", request.payload);
  
  const { amount, currency, evaluationId, paymentIntentResponse }: any = request.payload;
  const stripe = new Stripe(config.stripeKey.stripesecretkey);

  try {
    console.log("Finding evaluation details for evaluationId:", evaluationId);

    let evaluationDetails = await EvaluationModel.findOne({
      _id: evaluationId
    })
    // console.log("paymentIntentResponse>>>",paymentIntentResponse?paymentIntentResponse:" ");
    

    console.log("Evaluation Details:", evaluationDetails);
    console.log("Payment Intent Response:", paymentIntentResponse ? paymentIntentResponse : "No response");


    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

if(paymentIntentResponse){
  const savePaymentDetails = PaymentDetailsModel.create({
    userId: evaluationDetails?._id,
    userName: evaluationDetails?.student.studentFirstName,
    paymentStatus: paymentIntentResponse? paymentIntentResponse.status : "Pending",
    paymentAmount: paymentIntent.amount,
    paymentResponse: paymentIntentResponse,
    paymentResponseId: paymentIntent.client_secret,
    paymentDate: new Date(),
    status: "Active",
    createdBy: "System"
   });
   const paymentDetails =  (await savePaymentDetails).save();
}
  

    if(paymentIntentResponse.status == "succeeded" && evaluationDetails && evaluationDetails.studentStatus == "JOINED" && evaluationDetails.classStatus == "Completed" ){
      createStudentPortal(evaluationDetails);

    }
    console.log("Created Stripe PaymentIntent:", paymentIntent);

    if (paymentIntentResponse) {
      console.log("Saving payment details...");

      const savePaymentDetails = await PaymentDetailsModel.create({
        userId: evaluationDetails?._id,
        userName: evaluationDetails?.student.studentFirstName,
        paymentStatus: paymentIntentResponse ? paymentIntentResponse.status : "Pending",
        paymentAmount: paymentIntent.amount,
        paymentResponse: paymentIntentResponse,
        paymentResponseId: paymentIntent.client_secret,
        paymentDate: new Date(),
        status: "Active",
        createdBy: "System",
      });

      console.log("Saved Payment Details:", savePaymentDetails);

    }

    // if (
    //   paymentIntentResponse.status === "succeeded" &&
    //   evaluationDetails &&
    //   evaluationDetails.studentStatus === "JOINED" &&
    //   evaluationDetails.classStatus === "Completed"
    // ) {
    //   console.log("Payment succeeded, creating student portal...");
    //   await createStudentPortal(evaluationDetails);
    // }

    // console.log("Updating evaluation payment status...");

    await EvaluationModel.findByIdAndUpdate(
      evaluationDetails?._id,
      {
        paymentStatus: paymentIntentResponse.status === "succeeded" ? "PAID" : "FAILED",
      },
      { new: true }
    );

    console.log("Returning clientSecret to frontend...");
    
    return h.response({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Error in createPaymentIntent:", err);
    return h.response({ error: err }).code(400);
  }
};

// async function createStudentPortal(updatedEvaluation: any) {
//   console.log("Creating Student Portal for:", updatedEvaluation);

// <<<<<<< HEAD
// //  async function createStudentPortal(updatedEvaluation:any) {
// //  console.log("updatedEvaluation>>", updatedEvaluation);
// //     const specialChars = '@#$%&*!';
// //     const randomNum = Math.floor(Math.random() * 1000); // Random number between 0-999
// //     const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)]; // Random special character
  
// //     // Generate password
// //     const firstThreeChars = updatedEvaluation.student.studentFirstName.substring(0, 3); // First 3 characters of the username
// //     const reversedUsername = updatedEvaluation.student.studentFirstName.split('').reverse().join(''); // Reverse the username
  
// //     const password = `${firstThreeChars}${randomSpecial}${randomNum}${reversedUsername}`;

// //   const createStudentPortal = await StudentPortModel.create({
// //     student : {
// //       studentId : updatedEvaluation.student.studentId,
// //       studentEmail: updatedEvaluation.student.studentEmail,
// //       studentPhone: updatedEvaluation.student.studentPhone,
// //       course: updatedEvaluation.student.learningInterest,
// //       package: updatedEvaluation.subscription.subscriptionName,
// //       city: updatedEvaluation.student.studentCity,
// //       country: updatedEvaluation.student.studentCountry
// //     },
// //     username: updatedEvaluation.student.studentFirstName,
// //     password: password,
// //     role: "Student",
// //     status: "Active",
// //     createdDate: new Date,
// //     createdBy: updatedEvaluation.createdBy,
// //     updatedDate: new Date
// //   }
// //    )

// // const saveStudent = createStudentPortal.save()
// // console.log("Student portal",saveStudent )


// // const payload: (IClassScheduleCreate);


// //   const { classDay, startTime, endTime, startDate, endDate } = payload;

// //   const results: (IClassSchedule | { error: any })[] = [];

// //   // Validate inputs
// //   if (!classDay || !startTime || !endTime || !startDate || !endDate || 
// //       classDay.length !== startTime.length || startTime.length !== endTime.length) {
// //     throw new Error("classDay, startTime, endTime, startDate, and endDate must be provided and arrays must match in length.");
// //   }

// //   for (let i = 0; i < classDay.length; i++) {
// //     const day = classDay[i];
// //     const start = startTime[i];
// //     const end = endTime[i];

// //     try {
// //       // Fetch student details
// //       const studentDetails = await StudentPortModel.findOne({
// //         _id: (await saveStudent)._id
// //       }).exec();

// //       console.log("studentDetails>>>", studentDetails);

// //       // Fetch teacher details
// //       const teacherDetails = await UserModel.findOne({
// //         role: "TEACHER",
// //         userName: payload.teacher?.teacherName
// //       }).exec();

// //       console.log("teacherDetails>>>", teacherDetails);

// //       // Map day name to numeric day (0=Sunday, 1=Monday, ..., 6=Saturday)
// //       const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day);
// //       if (dayIndex === -1) {
// //         throw new Error(`Invalid classDay: ${day}`);
// //       }

// //       // Generate class dates within the range
// //       const classDates = getDatesForWeekdays(new Date(startDate), new Date(endDate), dayIndex);
// //       const meetingId = `alfregularclass-${studentDetails?._id}`;

// //       for (const classDate of classDates) {
// //         const newClassSchedule = new ClassScheduleModel({
// //           student: {
// //             studentId: studentDetails?._id,
// //             studentFirstName: studentDetails?.username,
// //             studentLastName: studentDetails?.username,
// //             studentEmail: studentDetails?.student?.studentEmail
// //           },
// //           teacher: {
// //             teacherId: teacherDetails?._id,
// //             teacherName: teacherDetails?.userName,
// //             teacherEmail: teacherDetails?.email
// //           },
// //           classLink:meetingId, 
// //           classDay: day,
// //           startTime: start,
// //           endTime: end,
// //           course:studentDetails?.student?.course,
// //           package: studentDetails?.student?.package,
// //           startDate: classDate,
// //           endDate: classDate,
// //           createdBy: new Date(),
// //           status: "Active",
// //           scheduleStatus: "Active",
// //           totalHourse: payload.totalHourse,
// //           preferedTeacher: payload.preferedTeacher,
// //         });

// //         //await createRecurringEvents("tech@alfurqan.academy",newClassSchedule.startDate, newClassSchedule.endDate, newClassSchedule.classDay,newClassSchedule);
// //          const eventDetails = await createEvent(newClassSchedule);
// //          console.log("eventDetails>>>", eventDetails);

// //         const savedClassSchedule = await newClassSchedule.save();
// //         console.log("savedClassSchedule>>>>", savedClassSchedule);
// //         results.push(savedClassSchedule);
// //       }
// //     } catch (error) {
// //       console.error("Error in scheduling:", error);
// //       results.push({ error });
// //     }
// //   }



// //   return saveStudent;
// // }
async function createStudentPortal(updatedEvaluation: any) {
  try {

    const specialChars = "@#$%&*!";
    const randomNum = Math.floor(Math.random() * 1000); // Random number between 0-999
    const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)]; // Random special character

    // Generate password
    const firstThreeChars = updatedEvaluation.student.studentFirstName.substring(0, 3); // First 3 characters of the first name
    const reversedUsername = updatedEvaluation.student.studentFirstName.split('').reverse().join(''); // Reverse the first name

    const password = `${firstThreeChars}${randomSpecial}${randomNum}${reversedUsername}`;

    // Create student portal entry
    const studentPortal = await StudentPortModel.create({
      student: {
        studentId: updatedEvaluation.student.studentId,
        studentEmail: updatedEvaluation.student.studentEmail,
        studentPhone: updatedEvaluation.student.studentPhone,
        course: updatedEvaluation.student.learningInterest,
        package: updatedEvaluation.subscription.subscriptionName,
        city: updatedEvaluation.student.studentCity,
        country: updatedEvaluation.student.studentCountry,
        gender: "Male"
      },
      username: updatedEvaluation.student.studentFirstName,
      password: password,
      role: "Student",
      status: "Active",
      createdDate: new Date(),
      createdBy: updatedEvaluation.createdBy,
      updatedDate: new Date()
    });

    console.log("Student portal created:", studentPortal);
   
    // Validate payload
    //const classDay, startTime, endTime, startDate, endDate }  = classSchedule;
    const classDayValues = updatedEvaluation.classDay;
   const startTimeValues = updatedEvaluation.startTime;
   const endTimeValues = updatedEvaluation.endTime;
    
console.log(">>>>>>>>>>>>>",classDayValues);
    const results: (IClassSchedule | { error: any })[] = [];

    for (let i = 0; i < classDayValues.length; i++) {
      const day = classDayValues[i];
      const start = startTimeValues[i];
      const end = endTimeValues[i];

      try {
        console.log("updatedEvaluationNew>>", updatedEvaluation);
        // Fetch student details
        const studentDetails = await StudentPortModel.findById(studentPortal._id).exec();
        if (!studentDetails) throw new Error("Student details not found");


        // Fetch teacher details
        const teacherDetails = await UserModel.findOne({
          role: "TEACHER",
          _id: updatedEvaluation.assignedTeacherId
        }).exec();
     

        console.log("teacherDetails>>>", updatedEvaluation.assignedTeacherId);

        // Map day name to numeric day (0=Sunday, ..., 6=Saturday)
        const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day);
        if (dayIndex === -1) {
          throw new Error(`Invalid classDay: ${day}`);
        }

        // Generate class dates within the range
        const classDates = getDatesForWeekdays(new Date(updatedEvaluation.classStartDate), new Date(updatedEvaluation.classEndDate), dayIndex);
        const meetingId = `alfregularclass-${studentDetails._id}`;

        for (const classDate of classDates) {
          console.log("teacherDetails>>>", updatedEvaluation.assignedTeacherId);
          const newClassSchedule = new ClassScheduleModel({
            student: {
              studentId: studentDetails._id,
              studentFirstName: studentDetails.username,
              studentLastName: studentDetails.username,
              studentEmail: studentDetails.student.studentEmail,
              gender: "Male",
              package: updatedEvaluation.subscription?.subscriptionName
            },
            teacher: {
              teacherId: teacherDetails?._id,
              teacherName: teacherDetails?.userName,
              teacherEmail: teacherDetails?.email
            },
            classLink: meetingId,
            classDay: day,
            startTime: start,
            endTime: end,
            course: studentDetails.student.course,
            package: studentDetails.student.package,
            startDate: classDate,
            endDate: classDate,
            createdBy: updatedEvaluation.createdBy,
            status: "Active",
            scheduleStatus: "Active",
            totalHours: updatedEvaluation.accomplishmentTime,
            preferredTeacher: updatedEvaluation.student?.preferredTeacher
          });

          // Create event
          const eventDetails = await createEvent(newClassSchedule);

          // Save schedule
          const savedClassSchedule = await newClassSchedule.save();
          console.log("savedClassSchedule>>>>", savedClassSchedule);
          results.push(savedClassSchedule);
        }
      } catch (error) {
        console.error("Error in scheduling:", error);
        results.push({ error });
      }
    }

    return studentPortal;
  } catch (error) {
    console.error("Error in createStudentPortal:", error);
    throw error;
  }


}

export const createStudentPaymentIntent = async (request: Request, h: ResponseToolkit) => {
  console.log("Received request payload:", request.payload);
  
  const { amount, currency, invoiceId, paymentIntentResponse }: any = request.payload;
  const stripe = new Stripe(config.stripeKey.stripesecretkey);

  try {
    console.log("Finding invoice details for invoiceId:", invoiceId);

    let InvoiceDetails = await InvoiceModel.findOne({
      _id: new Types.ObjectId(invoiceId),
    });

    console.log("Invoice Details:", InvoiceDetails);
    console.log("Payment Intent Response:", paymentIntentResponse ? paymentIntentResponse : "No response");

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    console.log("Created Stripe PaymentIntent:", paymentIntent);

    if (paymentIntentResponse) {
      console.log("Saving payment details...");

      const savePaymentDetails = await PaymentDetailsModel.create({
        userId: InvoiceDetails?.student.studentId,
        userName: InvoiceDetails?.student.studentName,
        paymentStatus: paymentIntentResponse ? paymentIntentResponse.status : "Pending",
        paymentAmount: paymentIntent.amount,
        paymentResponse: paymentIntentResponse,
        paymentResponseId: paymentIntent.client_secret,
        paymentDate: new Date(),
        status: "Active",
        createdBy: "System",
      });

      console.log("Saved Payment Details:", savePaymentDetails);

      console.log("Updating invoice status...");

      const updateInvoice = await InvoiceModel.findByIdAndUpdate(
        invoiceId,
        {
          invoiceStatus: paymentIntentResponse.status === "succeeded" ? "Paid" : "Completed",
        },
        { new: true }
      );

      console.log("Updated Invoice Status:", updateInvoice);
    }

    console.log("Returning clientSecret to frontend...");
    
    return h.response({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    console.error("Error in createStudentPaymentIntent:", err);
    return h.response({ error: err }).code(400);
  }
}
  

// Helper function to get dates for specific weekdays between two dates
const getDatesForWeekdays = (startDate: Date, endDate: Date, targetDay: number): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (currentDate.getDay() === targetDay) {
      dates.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

// Initialize Microsoft Graph Client
const client = Client.initWithMiddleware({
  authProvider: {
      getAccessToken: async (): Promise<string> => {
          const tokenResponse = await credential.getToken(
              'https://graph.microsoft.com/.default'
          );
          return tokenResponse.token;
      },
  }
});
const { MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, MICROSOFT_TENANT_ID } : any = process.env;

const credential = new ClientSecretCredential(
  MICROSOFT_TENANT_ID,
  MICROSOFT_CLIENT_ID,
  MICROSOFT_CLIENT_SECRET
);


async function createEvent(newClassSchedule: any): Promise<void> {
  console.log("newClassSchedule>>>>", newClassSchedule)
  const event = {
      subject: 'Team Meeting',
      body: {
          contentType: 'HTML',
          content: 'Discuss project updates and next steps.',
      },
      start: {
          dateTime: new Date(newClassSchedule.startDate).toISOString(),
          timeZone: 'Asia/Kolkata',
      },
      end: {
          dateTime: new Date(newClassSchedule.endDate).toISOString(),
          timeZone: 'Asia/Kolkata',
      },
      location: {
          displayName: 'Conference Room 1',
      },
      attendees: [
          {
              emailAddress: {
                  address: newClassSchedule.student.studentEmail,
                  name: newClassSchedule.studentFirstName,
              },
              type: 'required',
          },
          {
              emailAddress: {
                  address: newClassSchedule.teacher.teacherEmail,
                  name: newClassSchedule.teacher.teacherEmail,
              },
              type: 'required',
          },
      ],
      allowNewTimeProposals: true,
      isOnlineMeeting: true,
      onlineMeetingProvider: 'teamsForBusiness',
  };

  try {
      const userId = 'tech@alfurqan.academy';
      const response = await client.api(`/users/${userId}/calendar/events`).post(event);
      console.log('Event created successfully:', response.id);

      console.log('Event created successfully:', response.id);
  } catch (error: any) {
      console.error('Error creating event:', error);
      if (error) {
          console.error('Response body:', error);
          console.error('Response headers:', error);
      } else {
          console.error('Error message:', error);
      }
  }
}


