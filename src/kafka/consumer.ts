// consumers/invoiceConsumer.ts
import { kafka } from './client';
import { getTotalAmountByCourse } from '../operations/invoice';
import { emitEventToClient } from '../shared/socket'; // your initialized WebSocket

const consumer = kafka.consumer({ groupId: 'invoice-group' });

export const startInvoiceConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'invoice-paid' });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const invoice = JSON.parse(message.value!.toString());
        console.log("🧾 Invoice received via Kafka:", invoice);

        // Fetch the latest revenue
        const latestRevenue = await getTotalAmountByCourse('yearly');
        console.log("💰 Latest Revenue:", latestRevenue);

        // Emit to frontend via WebSocket
        emitEventToClient('revenueUpdated', latestRevenue,"6805da8c06542aa33858b889");
      } catch (error) {
        console.error("🚨 Error processing Kafka message:", error);
      }
    },
  });
};
