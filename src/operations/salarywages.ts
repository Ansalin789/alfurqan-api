import { isNil } from "lodash";
import {
  ISalarywagesCreate
} from "../../types/models.types";
import { GetAllRecordsParams } from "../shared/enum";
import salaryandwages from "../models/salaryandwages";
import otheremployee from "../models/otheremployee";
import classShedule from "../models/classShedule";

export const getAllSalaryList = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; salarywages: ISalarywagesCreate[] }> => {
  const { searchText, sortBy, sortOrder, offset, limit, filterValues } = params;
  const query: any = {};

  if (searchText) {
    query.$or = [
      { name: { $regex: searchText, $options: "i" } },
      { email: { $regex: searchText, $options: "i" } },
    ];
  }

  if (filterValues) {
    if (filterValues.course) query.course = { $in: filterValues.course };
    if (filterValues.country) query.country = { $in: filterValues.country };
    if (filterValues.teacher) query.teacher = { $in: filterValues.teacher };
    if (filterValues.status) query.status = { $in: filterValues.status };
  }

  const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const salaryQuery = salaryandwages.find(query).sort(sortOptions);

  if (!isNil(offset) && !isNil(limit)) {
    const skip = Math.max(0, ((Number(offset) ?? 1) - 1) * (Number(limit) ?? 10));
    salaryQuery.skip(skip).limit(Number(limit) ?? 10);
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const currentDateStr = now.toISOString();

  // 1. Fetch Supervisor and Academic Coach salaries
  const otherSalaries = await otheremployee.find({
    designation: { $in: ["supervisor", "academic_coach"] }
  });

  const fixedEmployeeSalaries: ISalarywagesCreate[] = otherSalaries.map(emp => ({
    employeeId: String(emp._id),
    employeeName: `${emp.firstName} ${emp.lastName}`,
    designation: emp.designation === "academic_coach" ? "Academic Coach" : "Supervisor",
    salaryAmount: String(emp.expectedSalary ?? 0),
    currency: emp.currency ?? "USD",
    paymentDate: currentDateStr,
    paymentStatus: "Paid",
    status: "Active",
    createdDate: currentDateStr,
    createdBy: "system",
    updatedDate: currentDateStr,
    updatedBy: "system"
  }));

  // 2. Calculate teacher salary from class schedules
  const classScheduleThisMonth = await classShedule.find({
    startDate: { $gte: startOfMonth, $lte: endOfMonth }
  });

  const teacherMap: Record<string, { name: string; total: number; currency: string }> = {};

  for (const record of classScheduleThisMonth) {
    const teacherId = record.teacher?.teacherId ?? record.teacher;
    const teacherName = record.teacher?.teacherName ?? "Unknown";
    const currency = record.currency ?? "USD";

    if (!teacherMap[teacherId]) {
      teacherMap[teacherId] = {
        name: teacherName,
        total: 0,
        currency: currency
      };
    }

    teacherMap[teacherId].total += Number(record.amount ?? 0);
  }

  const teacherSalaryRecords: ISalarywagesCreate[] = Object.entries(teacherMap).map(
    ([teacherId, data]) => ({
      employeeId: teacherId,
      employeeName: data.name,
      designation: "Teacher",
      salaryAmount: String(data.total),
      currency: data.currency,
      paymentDate: currentDateStr,
      paymentStatus: "Paid",
      status: "Active",
      createdDate: currentDateStr,
      createdBy: "system",
      updatedDate: currentDateStr,
      updatedBy: "system"
    })
  );

  // 3. Combine all salary records
  const unifiedSalaryList: ISalarywagesCreate[] = [
    ...teacherSalaryRecords,
    ...fixedEmployeeSalaries
  ];

  // ✅ 4. Save to salaryandwages collection
  await salaryandwages.insertMany(unifiedSalaryList);

  return {
    totalCount: unifiedSalaryList.length,
    salarywages: unifiedSalaryList
  };
};


export const getAllSalaryCardCounts = async (
  params: GetAllRecordsParams
): Promise<{
  totalCount: number;
  salarywages: ISalarywagesCreate[];
  totalSalaryPaid: number;
  totalPendingSalary: number;
  balanceSalary: number;
}> => {


  // ✅ Simulated or actual merged list from source(s)
  const SalaryList = await salaryandwages.find(); // get all salary records

  // Calculate totals, etc. using SalaryList

  let totalSalaryPaid = 0;
  let totalPendingSalary = 0;

  for (const salary of SalaryList) {
    const amount = parseFloat(salary.salaryAmount);
    if (isNaN(amount)) continue;

    if (salary.paymentStatus === "Paid") {
      totalSalaryPaid += amount;
    } else if (salary.paymentStatus === "Pending") {
      totalPendingSalary += amount;
    }
  }

  const balanceSalary = totalSalaryPaid - totalPendingSalary;

  return {
    totalCount: SalaryList.length,
    salarywages: SalaryList,
    totalSalaryPaid,
    totalPendingSalary,
    balanceSalary,
  };
};
