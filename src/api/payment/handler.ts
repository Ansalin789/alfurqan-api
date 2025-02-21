
import {Request, ResponseToolkit } from "@hapi/hapi";
import Stripe from 'stripe';
import { config } from "../../config/env";
import EvaluationModel from "../../models/evaluation"
import { Types } from "mongoose";
import  PaymentDetailsModel  from "../../models/paymentDetails"
import StudentPortModel from "../../models/alstudents";
import InvoiceModel from "../../models/stinvoice";

export const createPaymentIntent =  async (request: Request, h: ResponseToolkit) => {
  const { amount, currency, evaluationId,paymentIntentResponse} : any= request.payload;
  const stripe = new Stripe(config.stripeKey.stripesecretkey);
  try {

    let evaluationDetails = await EvaluationModel.findOne({
      _id: new Types.ObjectId(evaluationId)
    })
    console.log("paymentIntentResponse>>>",paymentIntentResponse?paymentIntentResponse:" ");
    console.log("evaluationDetails>>>",evaluationDetails);

   // const amount :any = evaluationDetails?.planTotalPrice
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
  //  console.log("paymentIntent>>>",paymentIntent);

await EvaluationModel.findByIdAndUpdate(
    evaluationDetails?._id, // Pass the correct ID here
    { 
      paymentStatus: paymentIntentResponse.status === 'succeeded' ? "Paid" : "Faild" 
    },
    { new: true } // Return the updated document
);

    return h.response({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    return h.response({ error: err }).code(400);
  }
}


 async function createStudentPortal(updatedEvaluation:any) {
 console.log("updatedEvaluation>>", updatedEvaluation);
    const specialChars = '@#$%&*!';
    const randomNum = Math.floor(Math.random() * 1000); // Random number between 0-999
    const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)]; // Random special character
  
    // Generate password
    const firstThreeChars = updatedEvaluation.student.studentFirstName.substring(0, 3); // First 3 characters of the username
    const reversedUsername = updatedEvaluation.student.studentFirstName.split('').reverse().join(''); // Reverse the username
  
    const password = `${firstThreeChars}${randomSpecial}${randomNum}${reversedUsername}`;

  const createStudentPortal = await StudentPortModel.create({
    student : {
      studentId : updatedEvaluation.student.studentId,
      studentEmail: updatedEvaluation.student.studentEmail,
      studentPhone: updatedEvaluation.student.studentPhone,
      course: updatedEvaluation.student.learningInterest,
      package: updatedEvaluation.subscription.subscriptionName,
      city: updatedEvaluation.student.studentCity,
      country: updatedEvaluation.student.studentCountry
    },
    username: updatedEvaluation.student.studentFirstName,
    password: password,
    role: "Student",
    status: "Active",
    createdDate: new Date,
    createdBy: updatedEvaluation.createdBy,
    updatedDate: new Date
  }
   )

const saveStudent = createStudentPortal.save()
console.log("Student portal",saveStudent )

  return saveStudent;
}


export const createStudentPaymentIntent =  async (request: Request, h: ResponseToolkit) => {
  const { amount, currency, invoiceId,paymentIntentResponse} : any= request.payload;
  const stripe = new Stripe(config.stripeKey.stripesecretkey);
  try {

    let InvoiceDetails = await InvoiceModel.findOne({
      _id: new Types.ObjectId(invoiceId)
    })
    console.log("paymentIntentResponse>>>",paymentIntentResponse?paymentIntentResponse:" ");
    console.log("invoice>>>",InvoiceDetails);

   // const amount :any = evaluationDetails?.planTotalPrice
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });
if(paymentIntentResponse){
  const savePaymentDetails = PaymentDetailsModel.create({
    userId: InvoiceDetails?.student.studentId,
    userName: InvoiceDetails?.student.studentName,
    paymentStatus: paymentIntentResponse? paymentIntentResponse.status : "Pending",
    paymentAmount: paymentIntent.amount,
    paymentResponse: paymentIntentResponse,
    paymentResponseId: paymentIntent.client_secret,
    paymentDate: new Date(),
    status: "Active",
    createdBy: "System"
   });
   const paymentDetails =  (await savePaymentDetails).save();


   const updateInvoice = await InvoiceModel.findByIdAndUpdate(
    invoiceId, // Pass the correct ID here
    { 
        invoiceStatus: paymentIntentResponse.status === 'succeeded' ? "Paid" : "Completed" 
    },
    { new: true } // Return the updated document
);
}
     
  //  console.log("paymentIntent>>>",paymentIntent);

    return h.response({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    return h.response({ error: err }).code(400);
  }
}
  
