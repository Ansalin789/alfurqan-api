import { kafka } from "./client";

const producer = kafka.producer();

export const connectProducer = async ()=>{
  await producer.connect();
  console.log("producer connected");
}

export const disconnectProducer = async () =>{
  await producer.disconnect();
  console.log("producer disconnected");
}

export const sendMessage = async (topic: string, message: any) => {
  const value = JSON.stringify(message);
  await producer.send({
    topic,
    messages: [{ value }],
  });
  console.log(`📤 Kafka Producer Topic: ${topic}`);
  console.log("📤 Kafka Producer Message:", message);  // This will show the object
};
