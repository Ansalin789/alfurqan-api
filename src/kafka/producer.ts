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

export const sendMessage = async (topic : string , message :string) => {
  await producer.send({
    topic,
    messages : [{value : JSON.stringify(message)}]
  });
  console.log(`topic is ${topic}`); 
}