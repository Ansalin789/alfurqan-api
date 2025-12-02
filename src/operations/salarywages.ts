import {
  ISalarywages,
  ISalarywagesCreate
} from "../../types/models.types";
import { GetAllRecordsParams } from "../shared/enum";
import salaryandwages from "../models/salaryandwages";
import classShedule from "../models/classShedule";
import EmpWagesModel from "../models/empwages";
import UserModel from "../models/users";
import AppLogger from "../helpers/logging";
import moment from "moment";




export const runSalaryCron = async () => {
  console.log("🔄 Starting salary calculation cron job...");

  try {
    const today = moment().format("YYYY-MM-DD"); // Get current date as string
    await runSalaryCalculationForDate(today);
    console.log("✅ Salary processing completed successfully");
  } catch (error) {
    console.error("❌ Salary processing failed:", error);
  }
};


export const getAllSalaryList = async (
  params: GetAllRecordsParams
): Promise<{ totalCount: number; expenses: ISalarywages[] }> => {
  const { searchText, sortBy, sortOrder, offset, limit, filterValues } = params;

  // Initialize the query object
  const query: any = {};

  // ✅ Sorting options
  const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // ✅ Build the query for fetching expenses
  const Query = salaryandwages.find(query).sort(sortOptions); // Use `Expense` model here
  
 
  // ✅ Fetch expenses and the total count
  const [expenses, totalCount] = await Promise.all([
    Query.exec(),
    salaryandwages.countDocuments(query).exec(), // Count the documents that match the query
  ]);

  // Log total count for debugging
  AppLogger.info({ totalCount });

  // ✅ Return the result
  return { totalCount, expenses };
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
    const amount = parseFloat(String(salary.salaryAmount));
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




export const updateSalaryWages = async ({
  employeeId,
  designation,
  amount,
  status,
  deduction,
  paymentStatus,
  paymentDate,
  balanceAmount
}: {
  employeeId: string;
  designation?: string;
  amount?: number;
  status?: string;
  deduction?: number;
  paymentStatus?: string;
  paymentDate?: string;
  balanceAmount?: number;
}) => {
  const update: any = {};
  if (amount !== undefined) update.salaryAmount = String(amount);
  if (status !== undefined) update.status = status;
  if (deduction !== undefined) update.deductionAmount = deduction;
  if (paymentStatus !== undefined) update.paymentStatus = paymentStatus;
  if (paymentDate !== undefined) update.paymentDate = paymentDate;
  if (balanceAmount !== undefined) update.balanceAmount = balanceAmount;

  const query: any = { employeeId, status: "Active" };
  if (designation) query.designation = designation;

  const existing = await salaryandwages.findOne(query);
  console.log('Matching document:', existing);
  const result = await salaryandwages.updateOne(query, { $set: update });
  const updatedRecord = await salaryandwages.findOne(query);
  console.log('Updated record:', updatedRecord);
  console.log('Update payload:', update);
  console.log('Incoming payload:', {
    employeeId,
    designation,
    amount,
    deduction,
    paymentStatus,
    paymentDate,
    balanceAmount
  });
  
  console.log('Update object to DB:', update);
  
  return {
    success: true,
    updated: result.modifiedCount,
    amount: updatedRecord?.salaryAmount,
    deduction: updatedRecord?.deductionAmount,
    balance: updatedRecord?.balanceAmount,
    status: updatedRecord?.status,
    paymentStatus: updatedRecord?.paymentStatus,
    paymentDate: updatedRecord?.paymentDate
  };
};

export const runSalaryCalculationForDate = async (dateStr: string) => {
  console.log("⏰ Running salary calculation for:", dateStr);

  try {
    const testDate = moment(dateStr, "YYYY-MM-DD");
    const todayStart = testDate.startOf("day").toDate();
    const todayEnd = testDate.endOf("day").toDate();
    const todayDate = testDate.format("YYYY-MM-DD");
    const monthLabel = testDate.format("MMM YYYY");

    console.log("📆 Date range:", todayStart, "➡️", todayEnd);

    let eligibleUsers = [];
    try {
      eligibleUsers = await UserModel.find({
        role: { $in: ["TEACHER", "ACADEMIC", "SUPERVISOR"] },
        status: "Active",
      }).lean();
      console.log("👤 Eligible users:", eligibleUsers.map(u => u.email).join(", "));
    } catch (err) {
      console.error("❌ Error fetching eligible users:", err);
      return;
    }

    for (const user of eligibleUsers) {
      const { userId: employeeId, email: employeeEmail } = user;
      const designation: string = Array.isArray(user.role) ? user.role[0] : user.role;
    
      if (!employeeId) {
        console.warn(`⚠️ Skipping ${employeeEmail} due to missing employeeId`);
        continue;
      }
    
      if (["ACADEMIC", "SUPERVISOR"].includes(designation)) {
        await processFixedSalaryEmployee(employeeId, designation, monthLabel);
        continue;
      }

      // Class-based salary logic for Teacher
      const query = {
        "teacher.teacherId": employeeId,
        scheduleStatus: "Completed",
        sessionStatus: "Completed",
        startDate: { $gte: todayStart, $lte: todayEnd },
      };

      let todayClasses = [];
      try {
        todayClasses = await classShedule.find(query).lean();
        console.log(`📚 ${designation} class count: ${todayClasses.length}`);
      } catch (err) {
        console.error(`❌ Error fetching classes for ${employeeEmail}:`, err);
        continue;
      }

      if (!todayClasses.length) continue;

      let regularTotal = 0;
      let groupTotal = 0;
      const seenRegular = new Set<string>();
      const seenGroup = new Set<string>();

      for (const cls of todayClasses) {
        const amt = parseFloat(cls.amount || "0");

        if (cls.sessionClassType === "REGULARCLASS") {
          if (!seenRegular.has(cls.classLink)) {
            seenRegular.add(cls.classLink);
            regularTotal += amt;
            console.log(`🟢 REGULARCLASS +${amt} | ${cls.classLink}`);
          }
        } else if (cls.sessionClassType === "GROUPCLASS") {
          const groupKey = `${cls.classLink}_${employeeId}_${todayDate}`;
          if (!seenGroup.has(groupKey)) {
            seenGroup.add(groupKey);
            groupTotal += amt;
            console.log(`🔵 GROUPCLASS +${amt} | ${cls.classLink}`);
          }
        }
      }

      const totalEarnings = +(regularTotal + groupTotal).toFixed(2);
      console.log(`💰 Earnings for ${employeeEmail}: ${totalEarnings}`);

      if (totalEarnings === 0) continue;

      try {
        const pendingSalary = await salaryandwages.findOne({
          employeeId,
          paymentStatus: "Pending",
          $or: [{ paymentDate: "" }],
        });
      
        if (pendingSalary) {
          const oldAmount = pendingSalary.salaryAmount || 0;
          pendingSalary.salaryAmount = oldAmount + totalEarnings;
          await pendingSalary.save();
          console.log(`✅ Updated existing pending salary for ${employeeEmail} ➕${totalEarnings}`);
        } else {
          const paidSalary = await salaryandwages.findOne({
            employeeId,
            paymentStatus: "Paid"
          }).sort({ createdDate: 1 });
      
          if (paidSalary) {
            console.log(`📄 Found previous paid salary for ${employeeEmail} on ${paidSalary.createdDate}`);
          }
      
          const newPending = await salaryandwages.findOne({
            employeeId,
            paymentStatus: "Pending",
            $or: [{ paymentDate: "" }]
          });
      
          if (newPending) {
            const oldAmount = newPending.salaryAmount || 0;
            newPending.salaryAmount = oldAmount + totalEarnings;
            await newPending.save();
            console.log(`✅ Updated newly found pending salary for ${employeeEmail} ➕${totalEarnings}`);
          } else {
            console.warn(`⚠️ No pending or paid salary record found for ${employeeEmail}`);
          }
        }
      } catch (err) {
        console.error(`❌ Error updating salary for ${employeeEmail}:`, err);
      }
     
    }

    console.log("✅🎉 Salary calculation completed for", dateStr);
  } catch (error) {
    console.error("🔥 Fatal error during salary calculation:", error);
  }
};

// A.C and Supervisor 

const getFixedSalaryAmount = async (employeeId: string) => {
  const wageInfo = await EmpWagesModel.findOne({ employeeId }).lean();
  if (!wageInfo) {
    console.warn(`⚠️ No wage info found for employee ${employeeId}`);
    return 0;
  }
  return parseFloat(String(wageInfo.classType.rate).replace(/\$|,/g, '') || "0");
};

const processFixedSalaryEmployee = async (employeeId: string, designation: string, monthLabel: string) => {
  const salaryAmount = await getFixedSalaryAmount(employeeId);

  if (salaryAmount <= 0) return;

  const existing = await salaryandwages.findOne({
    employeeId,
    designation,
    monthLabel,
    status: "Active"
  });

  if (existing) {
    if (existing.paymentStatus === "Paid") {
      // Create a new pending salary record
      await salaryandwages.create({
        employeeId,
        designation,
        monthLabel,
        salaryAmount: String(salaryAmount),
        balanceAmount: salaryAmount,
        status: "Active",
        paymentStatus: "Pending",
        paymentDate: "",
        createdDate: new Date(),
        updatedAt: new Date()
      });
      console.log(`🆕 Created new fixed salary record (Paid already) for ${designation} ${employeeId} = $${salaryAmount}`);
    } else {
      // it will Update the existing record when the paymentstatus is pending 
      await salaryandwages.updateOne(
        { _id: existing._id },
        {
          $set: {
            salaryAmount: String(salaryAmount),
            balanceAmount: salaryAmount,
            updatedAt: new Date(),
            paymentDate: new Date()
          }
        }
      );
      console.log(`💰 Updated fixed salary for ${designation} ${employeeId} = $${salaryAmount}`);
    }
  } else {
    //  No record found - create new
    await salaryandwages.create({
      employeeId,
      designation,
      monthLabel,
      salaryAmount: String(salaryAmount),
      balanceAmount: salaryAmount,
      status: "Active",
      paymentStatus: "Pending",
      paymentDate: "",
      createdDate: new Date(),
      updatedAt: new Date()
    });
    console.log(`🆕 Created new fixed salary record for ${designation} ${employeeId} = $${salaryAmount}`);
  }
};

//get by employeeId
export const getRecordByTeacherId = async (
  params: { employeeId: string }
): Promise<{
  totalCount: number;
  records: ISalarywages[];
}> => {
  const { employeeId } = params;

  const query = {
    employeeId: employeeId.trim(), // querying SalaryandWages table/collection
  };

  console.log("🔍 Salary/Wages Query:", query);

  const records = await salaryandwages.find(query).exec(); // use find() for MongoDB/Mongoose

  return {
    totalCount: records.length,
    records,
  };
};