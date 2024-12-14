import {createPaymentIntent} from "./handler"

export const paymentRoutes = [
  {
    method: 'POST',
    path: '/create-payment-intent',
    handler: createPaymentIntent
   
  },
];
