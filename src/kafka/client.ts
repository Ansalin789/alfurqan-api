import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "erp-backend",
    brokers: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
});
