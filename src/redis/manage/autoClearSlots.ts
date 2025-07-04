import dayjs from 'dayjs';
import { getAllSlots } from '../handler/teacherSlotHander';
import { getRedisClient } from '../../shared/redisClient';
import teacheravaliableslots from '../../models/teacheravaliableslots'; // your mongoose model

const redis = getRedisClient();
const REDIS_KEY = "teacher_time_slots";

export async function cleanupOldDates(daysBack = 7) {
  try {
    const data = await getAllSlots();
    const today = dayjs().startOf("day");

    let removedDates: string[] = [];

    for (const dateKey of Object.keys(data)) {
      const date = dayjs(dateKey);
      if (date.isBefore(today.subtract(daysBack, "day"))) {
        delete data[dateKey];
        removedDates.push(dateKey);
      }
    }

    await redis.set(REDIS_KEY, JSON.stringify(data));

    const deleted = await teacheravaliableslots.deleteMany({
      date: { $in: removedDates },
    });

    console.log(`🗑️ Removed slots for dates older than ${daysBack} days`);
    console.log(`📦 Redis keys cleared: ${removedDates.length}`);
    console.log(`🗃️ MongoDB documents deleted: ${deleted.deletedCount}`);
  } catch (err) {
    console.error("❌ Error cleaning old dates:", err);
  }
}
