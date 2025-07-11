import { initializeMongoDatabase } from "./shared/mongo";
// import { initializeSentry } from "./shared/sentry";
import Hapi, { Server } from "@hapi/hapi";
import AppLogger from "./helpers/logging";
import config from "./config/env";
import { appPlugins } from "./server/plugins";
import { serverSettings } from "./config/config";
import { initializeSocket } from "./shared/socket";
import { shutdownKafkaConsumer, startInvoiceConsumer } from './kafka/consumer';
import { connectProducer, disconnectProducer } from "./kafka/producer";
import Meeting from "../src/models/addmeeting";
import cron from "node-cron";
import { cleanupOldDates } from "./redis/manage/autoClearSlots";
import { restoreCacheFromDb } from "./redis/manage/restoreCache";
import { loggerPlugin } from "./plugins/auditlog";
import teachermeeting from "./models/teachermeeting";
import Evaluation from "./models/evaluation";
import { removeBookedSlots } from "./redis/handler/teacherSlotHander";


const start = async () => {
  // Create the server with server settings
  const server: Server = Hapi.server(serverSettings);

  // Register plugins
  await server.register(appPlugins);

  // MongoDB Connection Establishment
  await initializeMongoDatabase();

  // RedisDB Connection Establish
(async () => {
  await restoreCacheFromDb(); 
})();
  // Sentry Connection Establish
  //initializeSentry();
  // Initialize Socket.IO service
  initializeSocket(server.listener);
   await connectProducer();
   startInvoiceConsumer();
  // Initialize and Start the Application
  await server.initialize();
  await server.start();
  await server.register([loggerPlugin]);

  AppLogger.info(
    `Application is running on ${config.server.host}:${config.server.port}`
  );
};


// Server Start error handling
process.on("unhandledRejection", (err) => {
  AppLogger.error("unhandledRejection", err);
  process.exit(1);
});
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await shutdownKafkaConsumer();
  await disconnectProducer();
  process.exit(0);
});
start();


//meetingstatus cronjob
cron.schedule("0 0 * * 0", async () => {
  console.log("🧹 Weekly Redis + MongoDB cleanup");
  await cleanupOldDates(7);
});


cron.schedule("*/5 * * * *", async () => {
  console.log("⏰ Running meeting status update check every 5 minutes...");

  try {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1️⃣ Mark past meetings as Completed
    try {
      const resultPast = await Meeting.updateMany(
        {
          meetingStatus: { $ne: "Completed" },
          selectedDate: { $lt: today },
        },
        {
          $set: { meetingStatus: "Completed" },
        }
      );

      console.log(`${resultPast.modifiedCount} past meetings marked as Completed.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(" Error updating past meetings:", message);
    }

    // 2️⃣ Get today's meetings that are still not marked completed
    let meetingsToday: any[] = [];
    try {
      meetingsToday = await Meeting.find({
        meetingStatus: { $ne: "Completed" },
        selectedDate: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Less than tomorrow
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("❌ Error fetching today's meetings:", message);
    }

    let updatedTodayCount = 0;

    for (const meeting of meetingsToday) {
      try {
        if (!meeting.endTime) continue;

        const [endHour, endMinute] = meeting.endTime.split(":").map(Number);
        const meetingEnd = new Date(meeting.selectedDate);
        meetingEnd.setHours(endHour, endMinute, 0, 0);

        if (now >= meetingEnd) {
          await Meeting.updateOne(
            { _id: meeting._id },
            { $set: { meetingStatus: "Completed" } }
          );
          console.log(`✅ Meeting ${meeting.meetingId} marked as Completed (endTime passed).`);
          updatedTodayCount++;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`❌ Error updating meeting ${meeting.meetingId}:`, message);
      }
    }

    console.log(`✅ ${updatedTodayCount} today's meetings updated as Completed.`);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Unexpected error in meeting status update cron:", message);
  }
});  


//meetingstatus cronjob
cron.schedule("0 0 * * 0", async () => {
  console.log("🧹 Weekly Redis + MongoDB cleanup");
  await cleanupOldDates(7);
});

cron.schedule("*/5 * * * *", async () => {
  console.log("⏰ Running meeting status update check every 5 minutes...");

  try {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1️⃣ Mark past meetings as Completed
    try {
      const resultPast = await teachermeeting.updateMany(
        {
          meetingStatus: { $ne: "Completed" },
          selectedDate: { $lt: today },
        },
        {
          $set: { meetingStatus: "Completed" },
        }
      );

      console.log(`${resultPast.modifiedCount} past meetings marked as Completed.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(" Error updating past meetings:", message);
    }

    // 2️⃣ Get today's meetings that are still not marked completed
    let meetingsToday: any[] = [];
    try {
      meetingsToday = await teachermeeting.find({
        meetingStatus: { $ne: "Completed" },
        selectedDate: {
          $gte: today,
          $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Less than tomorrow
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("❌ Error fetching today's meetings:", message);
    }

    let updatedTodayCount = 0;

    for (const meeting of meetingsToday) {
      try {
        if (!meeting.endTime) continue;

        const [endHour, endMinute] = meeting.endTime.split(":").map(Number);
        const meetingEnd = new Date(meeting.selectedDate);
        meetingEnd.setHours(endHour, endMinute, 0, 0);

        if (now >= meetingEnd) {
          await teachermeeting.updateOne(
            { _id: meeting._id },
            { $set: { meetingStatus: "Completed" } }
          );
          console.log(`✅ Meeting ${meeting.meetingId} marked as Completed (endTime passed).`);
          updatedTodayCount++;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`❌ Error updating meeting ${meeting.meetingId}:`, message);
      }
    }

    console.log(`✅ ${updatedTodayCount} today's meetings updated as Completed.`);

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Unexpected error in meeting status update cron:", message);
  }
});  


//invoice update cron every night at 12:00 AM (midnight)
cron.schedule("0 0 * * *", async () => {
  console.log("🧹 Invoice update for glass schedule");
  const currentDate = new Date()
  const formattedDate = currentDate.toISOString().split("T")[0]

  const startOfDayIST = `${formattedDate}T00:00:00.000+00:00`
  const endOfDayIST = `${formattedDate}T23:59:59.999+00:00`
  const getPaymentDetails = await Evaluation.find({
    joiningDate: { $gte: startOfDayIST, $lte: endOfDayIST }
  });
  for(const evaluation of getPaymentDetails){
  
  if( evaluation.classType == "REGULARCLASS"&& evaluation.weeklySlots && (!evaluation.paymentStatus||evaluation.paymentStatus == "Pending" || evaluation.paymentStatus == "" )){
    removeBookedSlots(evaluation.joiningDate.toString(), evaluation.weeklySlots, evaluation.teacher.teacherId);
  }
  
}
});
