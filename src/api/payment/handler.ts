
import {Request, ResponseToolkit } from "@hapi/hapi";
import Stripe from 'stripe';
import { config } from "../../config/env";
import EvaluationModel from "../../models/evaluation"
import { Types } from "mongoose";
import  PaymentDetailsModel  from "../../models/paymentDetails"
import StudentPortModel from "../../models/alstudents";

export const createPaymentIntent =  async (request: Request, h: ResponseToolkit) => {
  const { amount, currency, evaluationId } : any= request.payload;
  const stripe = new Stripe(config.stripeKey.stripesecretkey);
  try {

    let evaluationDetails = await EvaluationModel.findOne({
      _id: new Types.ObjectId(evaluationId)
    })
    console.log("evaluationDetails>>>",evaluationDetails);
   // const amount :any = evaluationDetails?.planTotalPrice
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });
    console.log("paymentIntent>>>",paymentIntent);

   const savePaymentDetails = PaymentDetailsModel.create({
    userId: evaluationDetails?._id,
    userName: evaluationDetails?.student.studentFirstName,
    paymentStatus: paymentIntent.status,
    paymentAmount: paymentIntent.amount,
    paymentResponse: paymentIntent,
    paymentResponseId: paymentIntent.client_secret,
    paymentDate: new Date(),
    status: "Active",
    createdBy: "System"
   });
   const paymentDetails =  (await savePaymentDetails).save();
    
    if(paymentIntent.status == "succeeded" && evaluationDetails && evaluationDetails.studentStatus == "Joined" && evaluationDetails.classStatus == "Completed" ){
      createStudentPortal(evaluationDetails);
    }
    console.log("paymentIntent>>>",paymentIntent);

    return h.response({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    return h.response({ error: err }).code(400);
  }
}


 async function createStudentPortal(updatedEvaluation:any) {
 
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
      studentPhone: updatedEvaluation.student.studentPhone
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
  return saveStudent;
}
  
