import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
});

export const createPaymentIntent = async (request: any, h: any) => {
  const { amount, currency } = request.payload;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    return h.response({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err: any) {
    return h.response({ error: err.message }).code(400);
  }
};
