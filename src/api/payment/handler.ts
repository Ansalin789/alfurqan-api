import { Request, ResponseToolkit } from "@hapi/hapi";
import Stripe from 'stripe';
import { config } from "../../config/env";
import EvaluationModel from "../../models/evaluation";
import { Types } from "mongoose";
import PaymentDetailsModel from "../../models/paymentDetails";
import StudentPortModel from "../../models/alstudents";
import InvoiceModel from "../../models/stinvoice";

export const createPaymentIntent = async (request: Request, h: ResponseToolkit) => {
  console.log("Received request payload:", request.payload);
  
  const { amount, currency, evaluationId, paymentIntentResponse }: any = request.payload;
  const stripe = new Stripe(config.stripeKey.stripesecretkey);

  try {
    console.log("Finding evaluation details for evaluationId:", evaluationId);

    let evaluationDetails = await EvaluationModel.findOne({
      _id:evaluationId,
    });

    console.log("Evaluation Details:", evaluationDetails);
    console.log("Payment Intent Response:", paymentIntentResponse ? paymentIntentResponse : "No response");

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

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

    if (
      paymentIntentResponse.status === "succeeded" &&
      evaluationDetails &&
      evaluationDetails.studentStatus === "JOINED" &&
      evaluationDetails.classStatus === "Completed"
    ) {
      console.log("Payment succeeded, creating student portal...");
      await createStudentPortal(evaluationDetails);
    }

    console.log("Updating evaluation payment status...");

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

async function createStudentPortal(updatedEvaluation: any) {
  console.log("Creating Student Portal for:", updatedEvaluation);

  const specialChars = "@#$%&*!";
  const randomNum = Math.floor(Math.random() * 1000);
  const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)];

  const firstThreeChars = updatedEvaluation.student.studentFirstName.substring(0, 3);
  const reversedUsername = updatedEvaluation.student.studentFirstName.split("").reverse().join("");
  const password = `${firstThreeChars}${randomSpecial}${randomNum}${reversedUsername}`;

  console.log("Generated Password:", password);

  const createStudentPortal = await StudentPortModel.create({
    student: {
      studentId: updatedEvaluation.student.studentId,
      studentEmail: updatedEvaluation.student.studentEmail,
      studentPhone: updatedEvaluation.student.studentPhone,
      course: updatedEvaluation.student.learningInterest,
      package: updatedEvaluation.subscription.subscriptionName,
      city: updatedEvaluation.student.studentCity,
      country: updatedEvaluation.student.studentCountry,
      gender: "Male",
    },
    username: updatedEvaluation.student.studentFirstName,
    password: password,
    role: "Student",
    status: "Active",
    createdDate: new Date(),
    createdBy: updatedEvaluation.createdBy,
    updatedDate: new Date(),
  });

  const saveStudent = await createStudentPortal.save();
  console.log("Student Portal Created:", saveStudent);

  return saveStudent;
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
};
