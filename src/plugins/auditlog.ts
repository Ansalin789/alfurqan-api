import { Plugin } from '@hapi/hapi';
import { sendLogsToKafka } from '../kafka/producers/adminProducer';
import Boom from '@hapi/boom';

export const loggerPlugin: Plugin<{}> = {
  name: 'appLogger',
  version: '1.0.0',
  register: async (server) => {
    server.ext('onRequest', (request, h) => {
      (request.plugins as any).startTime = Date.now();
      return h.continue;
    });

    server.ext('onPreResponse', async (request, h) => {
      const response = request.response;
      const startTime = (request.plugins as any).startTime ?? Date.now();
      const duration = Date.now() - startTime;

      const isBoomError = Boom.isBoom(response);
      const statusCode = isBoomError
        ? response.output?.statusCode
        : (response as any)?.statusCode ?? 200;

      const logType = getLogTypeByStatus(statusCode);

      const logPayload = {
        userId: request.auth?.credentials?.id ?? 'anonymous',
        logType,
        route: request.route?.path ?? request.path ?? 'unknown',
        action: detectActionFromMethod(request.method),
        description:
          logType === 'ERROR'
            ? `Request failed: ${request.path}`
            : `Request ${request.method.toUpperCase()} to ${request.path}`,
        errorMessage: isBoomError ? response.message : undefined,
        stack: isBoomError ? response.stack : undefined,
        ip: request.info.remoteAddress,
        meta: {
          method: request.method,
          path: request.path,
          payload: request.payload,
          query: request.query,
          response: isBoomError
            ? response.output?.payload
            : (response as any)?.source ?? null,
          statusCode,
          durationMs: duration,
          headers: request.headers,
        },
        createdDate: new Date(),
      };

      try {
        await sendLogsToKafka({ data: logPayload });
      } catch (err: any) {
        console.error('❌ Kafka send failed:', err.message);
      }

      return h.continue;
    });
  },
};

function getLogTypeByStatus(code: number): 'SUCCESS' | 'REDIRECT' | 'ERROR' | 'INFO' {
  if (code >= 200 && code < 300) return 'SUCCESS';
  if (code >= 300 && code < 400) return 'REDIRECT';
  if (code >= 400 && code < 600) return 'ERROR';
  return 'INFO';
}

function detectActionFromMethod(method: string) {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'CREATE';
    case 'PUT':
      return 'UPDATE';
    case 'DELETE':
      return 'DELETE';
    case 'GET':
      return 'READ';
    default:
      return 'UNKNOWN';
  }
}
