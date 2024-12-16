// // // import Stripe from stripe
// // // // import dotenv from 'dotenv';

import {Request, ResponseToolkit } from "@hapi/hapi";
import Stripe from 'stripe';
import { config } from "../../config/env";


// // // // dotenv.config();

// // //  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
// // //  });

// // // // export const createPaymentIntent = async (request: any, h: any) => {
// // // //   const { amount, currency } = request.payload;

// // // //   try {
// // // //     const paymentIntent = await stripe.paymentIntents.create({
// // // //       amount,
// // // //       currency,
// // // //     });

// // // //     return h.response({
// // // //       clientSecret: paymentIntent.client_secret,
// // // //     });
// // // //   } catch (err: any) {
// // // //     return h.response({ error: err.message }).code(400);
// // // //   }
// // // // };
// // // export const createPaymentIntent = async (request: any, h: any) => {
// // //   console.log('Received payload:', request.payload); // Log incoming payload

// // //   const { amount, currency } = request.payload;

// // //   try {
// // //     const paymentIntent = await stripe.paymentIntents.create({
// // //       amount,
// // //       currency,
// // //     });
// // //     console.log('PaymentIntent created:', paymentIntent);

// // //     return h.response({
// // //       clientSecret: paymentIntent.client_secret,
// // //     });
// // //   } catch (err: any) {
// // //     console.error('Error creating PaymentIntent:', err);
// // //     return h.response({ error: err.message }).code(400);
// // //   }
// // // };
// // import Stripe from 'stripe';
// // import dotenv from 'dotenv';

// // dotenv.config();

// // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
// //   apiVersion: '2024-11-20.acacia',
// // });

// // export const createPaymentIntent = async (req: any, res: any): Promise<void> => {
// //   console.log('Received payload:', req.body);

// //   const { amount, currency } = req.body;

// //   try {
// //     const paymentIntent = await stripe.paymentIntents.create({
// //       amount,
// //       currency,
// //     });

// //     console.log('PaymentIntent created:', paymentIntent);

// //     res.status(200).json({
// //       clientSecret: paymentIntent.client_secret,
// //     });
// //   } catch (err: any) {
// //     console.error('Error creating PaymentIntent:', err);
// //     res.status(400).json({
// //       error: err.message,
// //     });
// //   }
// // };
// import {  Request, ResponseToolkit } from '@hapi/hapi';
// import Stripe from 'stripe';
// import dotenv from 'dotenv';

// // Load environment variables from .env file
// dotenv.config();

// // Initialize Stripe with the secret key from the environment variables
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
//   apiVersion: '2024-11-20.acacia', // Ensure you are using the correct API version
// });

// // Create payment intent handler
// export const createPaymentIntent = async (request: Request, h: ResponseToolkit) => {
//   try {
//     const { amount, currency } = request.payload as { amount: number; currency: string };

//     // Create a PaymentIntent using Stripe's API
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency,
//     });

//     // Return the client secret to the frontend
//     return h.response({
//       clientSecret: paymentIntent.client_secret,
//     }).code(200);  // Send HTTP status 200 for successful request
//   } catch (err: unknown) {
//     // Error handling with type narrowing
//     if (err instanceof Error) {
//       // If the error is an instance of Error, we can safely access 'message' and 'stack'
//       console.error('Error creating PaymentIntent:', err.message);  // Log the error message

//       // Return error response with status 400
//       return h.response({
//         error: err.message || 'Failed to create payment intent',
//       }).code(400);
//     }

//     // If it's not an instance of Error, we return a generic error message
//     console.error('Unknown error:', err);  // Log the unknown error

//     return h.response({
//       error: 'An unknown error occurred.',
//     }).code(400);
//   }
// };



export const createPaymentIntent =  async (request: Request, h: ResponseToolkit) => {
  const { amount, currency } : any= request.payload;
  const stripe = new Stripe(config.stripeKey.stripesecretkey);
  console.log("stripe>>>",stripe);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });
    console.log("paymentIntent>>>",paymentIntent);

    return h.response({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    return h.response({ error: err }).code(400);
  }
}