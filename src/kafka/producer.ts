import { kafka } from "./client";

const producer = kafka.producer();

export const sendInvoiceEvent = async (invoice: any) => {
  await producer.connect();
  await producer.send({
    topic: 'invoice-paid',
    messages: [{ value: JSON.stringify(invoice) }],
  });
  await producer.disconnect();
};
