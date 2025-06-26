import { getRedisClient } from "../../shared/redisClient";
import { TeacherTimeSlots } from "../../../types/models.types";
import teacheravaliableslots from "../../models/teacheravaliableslots";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

const redis = getRedisClient();
const REDIS_KEY = "teacher_time_slots";

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);

interface UserSchedule {
  teacherId: string;
  startdate: string | Date;
  enddate: string | Date;
  fromtime: string;
  totime: string;
}

export async function getAllSlots() {
  try {
    const raw = await redis.get(REDIS_KEY);
    const data = JSON.parse(raw ?? '{}');
    return data;
  } catch (err) {
    console.error("❌ Error in getAllSlots:", err);
    return {};
  }
}

export async function generateSlotsFromUserSchedule(schedule: UserSchedule) {
  try {
    const { teacherId, startdate, enddate, fromtime, totime } = schedule;

    console.log("🟡 Starting slot generation for:", {
      teacherId,
      startdate,
      enddate,
      fromtime,
      totime,
    });

    const start = dayjs(startdate).startOf("day");
    const end = dayjs(enddate).startOf("day");
    const startTimeFormat = "HH:mm";
    const mongoDocs: any[] = [];
    const redisData = await getAllSlots();

    for (
      let currentDate = start.clone();
      currentDate.isSameOrBefore(end);
      currentDate = currentDate.add(1, "day")
    ) {
      const dateStr = currentDate.format("YYYY-MM-DD");
      console.log(`📆 Generating for date: ${dateStr}`);

      let time = dayjs(`${dateStr} ${fromtime}`, `YYYY-MM-DD ${startTimeFormat}`);
      const endTime = dayjs(`${dateStr} ${totime}`, `YYYY-MM-DD ${startTimeFormat}`);

      if (!time.isValid() || !endTime.isValid()) {
        console.warn(`⚠️ Invalid time parsing for ${dateStr}`);
        continue;
      }

      if (time.isAfter(endTime)) {
        console.warn(`⚠️ Skipping invalid time range on ${dateStr}`);
        continue;
      }

      while (time.isBefore(endTime)) {
        const from = time.format("HH:mm");
        const to = time.add(30, "minute").format("HH:mm");
        const isNew = addSlots(redisData, dateStr, teacherId, from, to, true);
        if (isNew) {
       mongoDocs.push({
       date: dateStr,
       teacherId,
       from,
       to,
       isStatus: true,
     });
      }
        time = time.add(30, "minute");
      }
    }

      await redis.set(REDIS_KEY, JSON.stringify(redisData));
      await teacheravaliableslots.insertMany(mongoDocs);
    console.log("✅ All slots generated and stored in Redis");
  } catch (err) {
    console.error("❌ Error in generateSlotsFromUserSchedule:", err);
  }
}

export function addSlots(
  redisData: Record<string, any>,
  date: string,
  teacherId: string,
  from: string,
  to: string,
  isStatus: boolean
): boolean {
  try {
    redisData[date] ??= {};
    redisData[date][teacherId] ??= [];

    const exists = redisData[date][teacherId].some(
      (slot: TeacherTimeSlots) => slot.from === from && slot.to === to
    );

    if (exists) {
      console.log(`⚠️ Slot already exists: ${date} ${teacherId} ${from}-${to}`);
      return false;
    }

    redisData[date][teacherId].push({ from, to, isStatus });
    return true;
  } catch (err) {
    console.error("❌ Error in addSlotsInMemory:", err);
    return false;
  }
}


export async function bookSlot(date: string, teacherId: string, from: string, to: string, isStatus: boolean) {
  try {
    const data = await getAllSlots();
    if (!data[date]?.[teacherId]) {
      console.warn("⚠️ Slot not found in Redis for booking");
      return;
    }

    data[date][teacherId] = data[date][teacherId].map(
      (slot: TeacherTimeSlots) =>
        slot.from === from && slot.to === to ? { ...slot, isStatus } : slot
    );

    await redis.set(REDIS_KEY, JSON.stringify(data));
    await teacheravaliableslots.findOneAndUpdate(
      { date, teacherId, from, to },
      { $set: { isStatus } }
    );

    console.log("✅ Slot updated in Redis + MongoDB");
  } catch (err) {
    console.error("❌ Error in bookSlot:", err);
  }
}

export async function getAllSlotByDate(date: string) {
  try {
    const data = await getAllSlots();
    return data[date] ?? {};
  } catch (err) {
    console.error("❌ Error in getAllSlotByDate:", err);
    return {};
  }
}
