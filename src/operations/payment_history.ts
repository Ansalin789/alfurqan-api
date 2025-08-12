import { isNil } from "lodash";
import { Types } from "mongoose";
import { IPaymentDetails } from "../../types/models.types";
import AppLogger from "../helpers/logging";
import { GetPaymentDetailsRecordsParams } from "../shared/enum";
import { commonMessages, evaluationMessages } from "../config/messages";
import PaymentDetailsModel from "../models/paymentDetails";
import alstudents from "../models/alstudents";
import EvaluationModel from "../models/evaluation";

export const getPaymentHistory = async (
  params: GetPaymentDetailsRecordsParams
): Promise<{ totalCount: number; paymentDetails: IPaymentDetails[] }> => {
  const { userId, sortBy = "createdDate", sortOrder = "desc", offset, limit } = params;

  console.log("🔍 Incoming userId from query params:", userId);

  if (!userId) {
    return { totalCount: 0, paymentDetails: [] };
  }

  let alStudent;
  try {
    alStudent = await alstudents.findOne({ _id: new Types.ObjectId(userId) }).lean();
    console.log("🎯 Matched alstudent by _id:", alStudent);

    if (!alStudent) {
      AppLogger.warn("AlStudent not found for given student ID", { studentId: userId });
      return { totalCount: 0, paymentDetails: [] };
    }
  } catch (err) {
    AppLogger.error("Invalid userId format", { userId, error: err });
    return { totalCount: 0, paymentDetails: [] };
  }

  // First attempt: payments by alstudent._id
  let query: any = { userId: alStudent._id };
  const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  const paymentQuery = PaymentDetailsModel.find(query).sort(sortOptions);

  if (!isNil(offset) && !isNil(limit)) {
    const skip = Math.max(
      0,
      ((Number(offset) ?? Number(commonMessages.OFFSET)) - 1) *
        (Number(limit) ?? Number(commonMessages.LIMIT))
    );
    console.log("⏩ Pagination:", { skip, limit });
    paymentQuery.skip(skip).limit(Number(limit) ?? Number(commonMessages.LIMIT));
  }

  let [paymentDetails, totalCount] = await Promise.all([
    paymentQuery.exec(),
    PaymentDetailsModel.countDocuments(query).exec()
  ]);

  console.log("📦 Fetched payment details (by alstudent._id):", paymentDetails.length);
  console.log("🔢 Total count:", totalCount);

  // Fallback to evaluation IDs if no direct payments
  if (totalCount === 0) {
    console.log("⚠️ No payments found by alstudent._id, trying by evaluations...");

    const evaluations = await EvaluationModel.find({
      "student.studentId": alStudent.student.studentId
    }).select("_id");

    const evaluationIds = evaluations.map(e => e._id);
    if (evaluationIds.length === 0) {
      console.log("⚠️ No evaluations found for this alstudent.student.studentId");
      return { totalCount: 0, paymentDetails: [] };
    }

    query = { userId: { $in: evaluationIds } };
    const fallbackPaymentQuery = PaymentDetailsModel.find(query).sort(sortOptions);

    if (!isNil(offset) && !isNil(limit)) {
      const skip = Math.max(
        0,
        ((Number(offset) ?? Number(commonMessages.OFFSET)) - 1) *
          (Number(limit) ?? Number(commonMessages.LIMIT))
      );
      fallbackPaymentQuery.skip(skip).limit(Number(limit) ?? Number(commonMessages.LIMIT));
    }

    [paymentDetails, totalCount] = await Promise.all([
      fallbackPaymentQuery.exec(),
      PaymentDetailsModel.countDocuments(query).exec()
    ]);

    console.log("📦 Fetched payment details (by evaluation IDs):", paymentDetails.length);
    console.log("🔢 Total count:", totalCount);

    for (const payment of paymentDetails) {
      payment.userId = alStudent._id.toString();
      console.log(`🔄 Mapped payment ${payment._id} userId to alstudent._id`);
    }
  }

  // ✅ Add course from alStudent to each payment
  const course = alStudent.student.course || "N/A";
  const updatedPaymentDetails = paymentDetails.map(payment => ({
    ...payment.toObject?.() ?? payment,  // ensure plain object
    course,
  }));

  AppLogger.info(evaluationMessages.GET_ALL_LIST_SUCCESS, { totalCount });

  return {
    totalCount,
    paymentDetails: updatedPaymentDetails,
  };
};
