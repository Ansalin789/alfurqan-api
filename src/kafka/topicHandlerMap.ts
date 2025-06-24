import dayjs from "dayjs";
import {
  getStudentList,
  teacherStudentCount,
  updateteacherreschedule,
} from "../operations/classschedule";
import {
  dashboardWidgetCounts,
  dashboardWidgetSupervisorCounts,
} from "../operations/dashboard";
import { getTotalAmountByCourse } from "../operations/invoice";
import {
  bookSlot,
  getAllSlotByDate,
  getAllSlots,
} from "../redis/handler/teacherSlotHander";
import { emitEventToClient } from "../shared/socket";

export const topicHandler: Record<string, (data: any) => Promise<void>> = {
  "invoice-paid": async (data: any) => {
    console.log("invioce data ", data);
    const latestRevenue = await getTotalAmountByCourse("yearly");
    console.log("💰 Latest Revenue:", latestRevenue);
    emitEventToClient(
      "revenueUpdated",
      latestRevenue,
      "6805da8c06542aa33858b889"
    );
  },

  supervisorcardcount: async (data: any) => {
    console.log("running supervisor card count");
    const cardcount = await dashboardWidgetSupervisorCounts(data.supervisorId);
    console.log("cardcount", cardcount);
    emitEventToClient("supervisordashboardcount", cardcount, data.supervisorId);
  },

  recruitmentlist: async (data: any) => {
    console.log("running recruitment list");
    emitEventToClient("recruitmentlist", data);
  },

  addmeeting: async (data: any) => {
    console.log("add meeting");
    emitEventToClient("addmeeting", data, data.data.supervisor.supervisorId);
  },

  supervisorteacherlist: async (data: any) => {
    console.log("supervisorteacherlist");
    emitEventToClient("supervisorteacherlist", data);
  },

  supervisorfeedbacklist: async (data: any) => {
    console.log("supervisorfeedbacklist");
    emitEventToClient("supervisorfeedbacklist", data);
  },

  academicDashboardCard: async (data: any) => {
    console.log("academicDashboardCard");
    const cardcount = await dashboardWidgetCounts(data.academicCoachId);
    console.log("fetched  academic dashboard card");
    console.log("data ", data);
    emitEventToClient("academicDashboardCard", cardcount, data.academicCoachId);
  },

  academicStudentList: async (data: any) => {
    console.log("academicStudentList");
    console.log("data ", data);
    emitEventToClient("academicStudentList", data, data.sender);
  },

  academicStudentProfile: async (data: any) => {
    console.log("academicStudentProfile");
    console.log("data ", data);
    emitEventToClient("academicStudentProfile", data, data.sender);
  },

  academicDashboardTeachersStudentCount: async (data: any) => {
    console.log("academicDashboardTeachersStudentCount");
    console.log("data ", data);
    if (data.classType == "REGULARCLASS" || data.classType == "GROUPCLASS") {
      const getTeacherStudentCount = teacherStudentCount();
      emitEventToClient(
        "academicDashboardTeachersStudentCount",
        getTeacherStudentCount
      );
    }
  },

  academicTeacherStudentList: async (data: any) => {
    console.log("academicTeacherStudentList");
    const teacherId = data.data.assignedTeacherId;
    const getTeacherStudentList = getStudentList(teacherId);
    emitEventToClient("academicTeacherStudentList", getTeacherStudentList);
  },

  academicAvailableTeachers: async (data: any) => {
    console.log("academicAvailableTeachers");

    try {
      if (data.event === "create") {
        const academicAvailableTeachers = await getAllSlots();
        emitEventToClient(
          "academicAvailableTeachers",
          academicAvailableTeachers
        );
      } else {
        const { date, teacherId, from, to } = data.data;
        const teacherList = Array.isArray(teacherId) ? teacherId : [teacherId];
        const formattedDate = dayjs(date).format("YYYY-MM-DD");

        const fromTime = dayjs(`${formattedDate} ${from}`);
        const toTime = dayjs(`${formattedDate} ${to}`);

        const timeSlots: { from: string; to: string }[] = [];
        let slotStart = fromTime;

        while (slotStart.isBefore(toTime)) {
          const slotEnd = slotStart.add(30, "minute");

          if (slotEnd.isAfter(toTime)) break;

          timeSlots.push({
            from: slotStart.format("HH:mm"),
            to: slotEnd.format("HH:mm"),
          });

          slotStart = slotEnd;
        }

        for (const teacher of teacherList) {
          const id = typeof teacher === "string" ? teacher : teacher.teacherId;
          if (!id) {
            console.warn("⚠️ Skipping teacher with missing ID:", teacher);
            continue;
          }

          for (const slot of timeSlots) {
            await bookSlot(formattedDate, id, slot.from, slot.to, false);
          }
        }
        const academicAvailableTeachers = await getAllSlotByDate(formattedDate);
        emitEventToClient("academicAvailableTeachers", {
          date: data.data.date,
          slots: academicAvailableTeachers,
        });
      }
    } catch (err: any) {
      console.error("❌ Redis/Kafka handler error:", err.message);
    }
  },

  academicTeacherSchedule: async (data: any) => {
    console.log("academicTeacherSchedule");
    emitEventToClient("academicTeacherSchedule", data);
  },
};
