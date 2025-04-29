import { isNil } from "lodash";
import { ISalarywages } from "../../types/models.types";
import { GetAllRecordsParams } from "../shared/enum";
import salaryandwages from "../models/salaryandwages";
import otheremployee from "../models/otheremployee";

export const getAllSalaryList = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; salarywages: ISalarywages[] }> => {
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
  const Query = salaryandwages.find(query).sort(sortOptions);

  if (!isNil(offset) && !isNil(limit)) {
    const skip = Math.max(0, ((Number(offset) ?? 1) - 1) * (Number(limit) ?? 10));
    Query.skip(skip).limit(Number(limit) ?? 10);
  }

  const [salarywages, totalCount] = await Promise.all([
    Query.exec(),
    salaryandwages.countDocuments(query).exec(),
  ]);

  // Fetch Academic Coach and Supervisor fixed salaries
  const otherSalaries = await otheremployee.find({
    role: { $in: ["academic_coach", "supervisor"] }
  });

  const coachSalaryRecords = otherSalaries
    .filter(emp => emp.role === "academic_coach")
    .map(emp => ({
      employeeId: emp._id,
      name: emp.name,
      designation: "Academic Coach",
      amount: emp.salary,
      paymentDate: new Date().toLocaleDateString("en-GB") // or use consistent DB date
    }));

  const supervisorSalaryRecords = otherSalaries
    .filter(emp => emp.role === "supervisor")
    .map(emp => ({
      employeeId: emp._id,
      name: emp.name,
      designation: "Supervisor",
      amount: emp.salary,
      paymentDate: new Date().toLocaleDateString("en-GB")
    }));

  // Group teacher salaries
  const teacherMap: Record<string, { name: string, total: number, date: string }> = {};
  for (const record of salarywages) {
    const teacherId = String(record.teacher);
    if (!teacherMap[teacherId]) {
      teacherMap[teacherId] = {
        name: record.name,
        total: 0,
        date: record.paymentDate
      };
    }
    teacherMap[teacherId].total += Number(record.amount);
  }

  const teacherSalaryRecords = Object.entries(teacherMap).map(([teacherId, data]) => ({
    employeeId: teacherId,
    name: data.name,
    designation: "Teacher",
    amount: data.total,
    paymentDate: new Date(data.date).toLocaleDateString("en-GB")
  }));

  // Merge all salaries
  const unifiedSalaryList = [
    ...teacherSalaryRecords,
    ...coachSalaryRecords,
    ...supervisorSalaryRecords
  ];

  return {
    totalCount: unifiedSalaryList.length,
    salarywages: unifiedSalaryList
  };
};
