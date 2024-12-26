
import {Request, ResponseToolkit } from "@hapi/hapi";
import Stripe from 'stripe';
import { config } from "../../config/env";
import EvaluationModel from "../../models/evaluation"
import { Types } from "mongoose";



export const createPaymentIntent =  async (request: Request, h: ResponseToolkit) => {
  const { amount, currency, evaluationId } : any= request.payload;
  const stripe = new Stripe(config.stripeKey.stripesecretkey);
  try {

    let evaluationDetails = await EvaluationModel.findOne({
      _id: new Types.ObjectId(evaluationId)
    })
    console.log("evaluationDetails>>>",evaluationDetails);
    const amount :any = evaluationDetails?.planTotalPrice
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });
console.log()
    // if(evaluationDetails){
    //   evaluationDetails = {
    //     studentStatus : "JOINED"
    //   };
    // }
   

    
    if(evaluationDetails && evaluationDetails.studentStatus == "Joined" && evaluationDetails.classStatus == "Completed" ){
     // await trialClassAssigned(evaluationDetails, teacherDetails)
    }
   

    return h.response({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    return h.response({ error: err }).code(400);
  }
}