
import { Server, ServerRoute } from "@hapi/hapi";
import { createPaymentIntent } from "./handler";  // Import the function correctly

const register = async (server: Server): Promise<void> => {
  // Define the routes for this module
  const routes: ServerRoute[] = [
    {
      method: "POST",
      path: "/create-payment-intent",
      options: {
        handler: createPaymentIntent,  // Directly reference the handler function
        tags: ["api", "payment"],  // You can specify tags for your route here
        // auth: {
        //   strategies: ["jwt"],
        // },
      },
    },
  ];

  // Register the defined routes with the Hapi server
  server.route(routes);
};

export = {
  name: "api-payment",
  register,
};

// import Hapi from '@hapi/hapi';
// import { createPaymentIntent } from './handler';

// const server = Hapi.server({
//   port: 5001,
//   host: 'localhost',
// });

// server.route({
//   method: 'POST',
//   path: '/create-payment-intent',
//   handler: createPaymentIntent,
//   options: {
//     tags: ['api', 'payment'],
//   },
// });

// // CORS and error handling extension
// server.ext('onPreResponse', (request, h) => {
//   const response = request.response;

//   // Check if the response is an instance of Boom
//   if ((response as any).isBoom) {
//     // Handle Boom error response
//     const { statusCode, payload } = (response as any).output;
//     return h.response(payload).code(statusCode);
//   }

//   // Handle normal responses and add CORS headers
//   return h.response(response).header('Access-Control-Allow-Origin', '*');
// });

// const start = async () => {
//   try {
//     await server.start();
//     console.log('Server running at:', server.info.uri);
//   } catch (err) {
//     console.log(err);
//   }
// };

// start();
