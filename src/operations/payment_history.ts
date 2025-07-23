

import { isNil } from "lodash";
import { IPaymentDetails } from "../../types/models.types";
import AppLogger from "../helpers/logging";
import StudentInvoicesModel from "../models/stinvoice"
import { GetPaymentDetailsRecordsParams } from "../shared/enum";
import { commonMessages, evaluationMessages } from "../config/messages";
import PaymentDetailsModel from "../models/paymentDetails"

export const getPaymentHistory = async (
  params: GetPaymentDetailsRecordsParams
  ): Promise<{ totalCount: number; paymentDetails: IPaymentDetails[] }> => {
    const { userId, sortBy, sortOrder, offset, limit } = params;
  
    const query: any = {};
  
    // ✅ Only add academicCoachId to query if it is provided
    if (userId) {
      query.userId = userId;
    }
  
  
    const sortOptions: any = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  
    const paymentQuery = PaymentDetailsModel.find(query).sort(sortOptions);
  
    if (!isNil(offset) && !isNil(limit)) {
      const skip = Math.max(
        0,
        ((Number(offset) ?? Number(commonMessages.OFFSET)) - 1) *
        (Number(limit) ?? Number(commonMessages.LIMIT))
      );
      paymentQuery
        .skip(skip)
        .limit(Number(limit) ?? Number(commonMessages.LIMIT));
    }
  
    const [paymentDetails, totalCount] = await Promise.all([
        paymentQuery.exec(),
        StudentInvoicesModel.countDocuments(query).exec(),
    ]);
  
    AppLogger.info(evaluationMessages.GET_ALL_LIST_SUCCESS, {
      totalCount: totalCount,
    });
  
    return { totalCount, paymentDetails };
  };