import { Partitioners } from "kafkajs";
import { kafka } from "./client";

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner
});


export const connectProducer = async ()=>{
  await producer.connect();
  console.log("producer connected");
}

export const disconnectProducer = async () =>{
  await producer.disconnect();
  console.log("producer disconnected");
}

export const sendMessage = async (topic: string, message: any) => {
  try {
    const value = JSON.stringify(message);
    await producer.send({
      topic,
      messages: [{ value }],
    });
    console.log(`📤 Kafka Producer sent to topic: ${topic}`);
    console.log("📤 Message:", message);
  } catch (err) {
    console.error("❌ Kafka Producer Error:", err);
  }
};

