import { IStudentInvoice } from "../../types/models.types";
import { GetAllRecordsParams } from "../shared/enum";
import StudentInvoiceModel, { zodAlStudentInvoiceSchema } from "../models/stinvoice"
import { isNil } from "lodash";
import { commonMessages, evaluationMessages } from "../config/messages";
import AppLogger from "../helpers/logging";
import { Types } from "mongoose";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  eachMonthOfInterval,
  format,
  parseISO
} from "date-fns";
import stinvoice from "../models/stinvoice";

/**
 * Retrieves a list of all evaluation records with filters, sorting, and pagination.
 *
 * @param {GetAllRecordsParams} params - Parameters for filtering, sorting, and pagination.
 * @returns {Promise<{ totalCount: number; invoice: IStudentInvoice[] }>} - The total count and list of evaluations.
 */
export const getAllStudetnInVoiceList = async (
    params: GetAllRecordsParams
  ): Promise<{ totalCount: number; invoice: IStudentInvoice[] }> => {
    const { sortBy, sortOrder, offset, limit } = params;
  
    const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  
    const studentInvoiceQuery = StudentInvoiceModel.find().sort(sortOptions);
  
    if (!isNil(offset) && !isNil(limit)) {
      const skip = Math.max(
        0,
        ((Number(offset) ?? Number(commonMessages.OFFSET)) - 1) *
        (Number(limit) ?? Number(commonMessages.LIMIT))
      );
      studentInvoiceQuery
        .skip(skip)
        .limit(Number(limit) ?? Number(commonMessages.LIMIT));
    }
    const [invoice, totalCount] = await Promise.all([
        studentInvoiceQuery.exec(),
      StudentInvoiceModel.countDocuments().exec(),
    ]);
  
   // Log successful retrieval
   AppLogger.info(evaluationMessages.GET_ALL_LIST_SUCCESS, {
    totalCount: totalCount,
  });
  console.log(invoice);
    return { totalCount, invoice };
  };

  export const getStudetnInVoiceDetailsById = async (
    id: string
  ): Promise<IStudentInvoice | null> => {
    return StudentInvoiceModel.findOne({
      "student.studentId": new Types.ObjectId(id),
    }).lean();
  };

 
  export const getStudentAllRevenue = async (
    dateRange: string,
    year: string // year as a date string (e.g., "2023-01-01")
  ): Promise<{ date: string; label: string; revenue: number }[]> => {
    let startDate: Date;
    let endDate: Date;
    let intervalFn: (interval: { start: Date; end: Date }) => Date[];
    let outputFormat: string;
  
    // Parse the year from the provided date string
    const parsedDate = parseISO(year);
    const parsedYear = parsedDate.getFullYear();
  
    const now = new Date();
  
    switch (dateRange.toLowerCase()) {
      case "yearly":
        // Use the provided year to create the start and end dates for that year
        startDate = new Date(Date.UTC(parsedYear, 0, 1));
        endDate = new Date(Date.UTC(parsedYear, 11, 31, 23, 59, 59, 999));        
        intervalFn = eachMonthOfInterval;
        outputFormat = "MMM-yyyy"; // Format as "Jan-YYYY", "Feb-YYYY", etc.
        break;
      case "monthly":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        intervalFn = eachDayOfInterval;
        outputFormat = "yyyy-MM-dd";
        break;
      case "weekly":
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        intervalFn = eachDayOfInterval;
        outputFormat = "yyyy-MM-dd";
        break;
      default:
        throw new Error("Invalid dateRange value. Use 'weekly', 'monthly', or 'yearly'.");
    }
  
    console.log(`🗓️ Start Date: ${startDate.toISOString()} | End Date: ${endDate.toISOString()}`);
  
    const invoices = await StudentInvoiceModel.find({
      invoiceStatus: { $in: ["Paid", "Pending"] },
    }).exec();
    
  
    console.log(`📦 Found ${invoices.length} invoice(s)`);
  
    const revenueMap: Record<string, number> = {};
  
    invoices.forEach((invoice) => {
      const invoiceDate = new Date(invoice.createdDate);
      const formattedDate = format(invoiceDate, outputFormat);
  
      // Log each invoice being processed
      console.log(`Processing invoice: ${invoice.amount} for ${formattedDate}`);
  
      if (revenueMap[formattedDate]) {
        console.log(`Existing revenue for ${formattedDate}: ${revenueMap[formattedDate]}`);
        revenueMap[formattedDate] += invoice.amount;
        console.log(`Updated revenue for ${formattedDate}: ${revenueMap[formattedDate]}`);
      } else {
        revenueMap[formattedDate] = invoice.amount;
        console.log(`Created new revenue entry for ${formattedDate}: ${invoice.amount}`);
      }
    });
  
    console.log("📊 Revenue Map:", revenueMap);
  
    const result = intervalFn({ start: startDate, end: endDate }).map((date, i) => {
      const label = format(date, outputFormat);
      const revenue = revenueMap[label] || 0;
      console.log(`📅 Interval ${i + 1}: ${label} | Revenue: ${revenue}`);
      return {
        date: label,
        label,
        revenue,
      };
    });
  
    console.log("✅ Final Result:", result);
    return result;
  };

  

export const getTotalAmountByCountry = async (
  dateRange: string
): Promise<{ country: string; revenue: number; count: number }[]> => {
  try {
    const matchStage: any = {
      status: "Active",
    };

    const now = new Date();
    let startDate: Date | undefined;

    if (dateRange === "all") {
      startDate = undefined; // no filter
    } else if (dateRange === "weekly") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else if (dateRange === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (dateRange === "yearly") {
      startDate = new Date(now.getFullYear(), 0, 1);
    }
    
    if (startDate) {
      matchStage.createdDate = { $gte: startDate, $lte: now };
    }
    

    const result = await stinvoice.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$student.country",
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          country: "$_id",
          revenue: 1,
          count: 1,
          _id: 0,
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // 🔢 Add total revenue at the end
    const totalRevenue = result.reduce((acc, cur) => acc + cur.revenue, 0);
    const totalCount = result.reduce((acc, cur) => acc + cur.count, 0);

    result.push({
      country: "TotalAllCountries",
      revenue: totalRevenue,
      count: totalCount,
    });

    return result;
  } catch (error) {
    console.error("Error fetching student revenue by country:", error);
    throw error;
  }
};

export const getTotalAmountByCourse = async (
  dateRange: string
): Promise<{ courseName: string; revenue: number; count: number }[]> => {
  try {
    console.log("▶️ Called getTotalAmountByCourse with dateRange:", dateRange);

    const matchStage: any = {}; 

    const now = new Date();
    console.log("🕒 Current Date:", now);

    let startDate: Date | undefined;

    if (dateRange === "weekly") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      console.log("📅 Weekly Start Date:", startDate);
    } else if (dateRange === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      console.log("📅 Monthly Start Date:", startDate);
    } else if (dateRange === "yearly") {
      startDate = new Date(now.getFullYear(), 0, 1);
      console.log("📅 Yearly Start Date:", startDate);
    } else if (dateRange === "all") {
      console.log("📅 No date filter applied (ALL records)");
    }

    if (startDate) {
      matchStage.createdDate = { $gte: startDate, $lte: now };
      console.log("🔍 Applied Date Filter:", matchStage.createdDate);
    }

    console.log(" Final matchStage for aggregation:", matchStage);
    const matchedDocs = await stinvoice.find({});
    console.log("🧾 Total docs in collection:", matchedDocs.length);
    matchedDocs.forEach(doc => {
      console.log({
        courseName: doc.courseName,
        amount: doc.amount,
        createdDate: doc.createdDate,
        invoiceStatus: doc.invoiceStatus,
      });
    });
        

    const result = await stinvoice.aggregate([
      { $match: {} }, // No filtering
      {
        $group: {
          _id: { $ifNull: ["$courseName", "Unknown"] },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          courseName: "$_id",
          revenue: 1,
          count: 1,
          _id: 0,
        },
      },
      { $sort: { revenue: -1 } },
    ]);
    

    console.log("📊 Aggregation Result:", result);

    const totalRevenue = result.reduce((acc, cur) => acc + cur.revenue, 0);
    const totalCount = result.reduce((acc, cur) => acc + cur.count, 0);

    console.log("💰 Total Revenue:", totalRevenue);
    console.log("🔢 Total Count:", totalCount);

    result.push({
      courseName: "TotalAllCourses",
      revenue: totalRevenue,
      count: totalCount,
    });

    console.log("✅ Final Result with Totals:", result);

    return result;
  } catch (error) {
    console.error("❌ Error in getTotalAmountByCourse:", error);
    throw error;
  }
};
export const sendInvoiceOperation = async (
  payload: Partial<IStudentInvoice>
): Promise<{ invoice: IStudentInvoice } | { error: any }> => {
  try {
    // ✅ Validate payload with Zod
    const validation = zodAlStudentInvoiceSchema.safeParse(payload);
    if (!validation.success) {
      return { error: validation.error.flatten().fieldErrors };
    }

    // ✅ Create and save the invoice
    const newInvoice = new StudentInvoiceModel({
      student: {
        studentId: payload.student?.studentId ?? "",
        studentName: payload.student?.studentName ?? "",
        studentEmail: payload.student?.studentEmail ?? "",
        studentPhone: payload.student?.studentPhone ?? "",
        country: payload.student?.country ?? "",
        city: payload.student?.city ?? "",
      },
      courseName: payload.courseName ?? "",
      amount: payload.amount ?? 0,
      packageType: payload.packageType ?? "",
      itemDescription: payload.itemDescription ?? "",
      duration: payload.duration ?? "",
      rate: payload.rate ?? "",
      description: payload.description ?? "",
      attachFile: payload.attachFile ?? undefined,

      invoiceStatus: payload.invoiceStatus ?? "Pending",
      status: payload.status ?? "Active",
      dueDate: payload.dueDate ?? undefined,
      createdDate: payload.createdDate ?? new Date(),
      createdBy: payload.createdBy ?? "",
      lastUpdatedDate: payload.lastUpdatedDate ?? new Date(),
      lastUpdatedBy: payload.lastUpdatedBy ?? "",
    });

    const savedInvoice = await newInvoice.save();


    AppLogger.info(`Invoice created: ${JSON.stringify(savedInvoice)}`);
    return { invoice: savedInvoice };
  } catch (error) {
    console.error("Error saving invoice:", error);
    return { error: "Failed to save invoice: " + error };
  }
};





  
  
 
  