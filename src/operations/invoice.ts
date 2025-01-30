import { IStudentInvoice } from "../../types/models.types";
import { GetAllRecordsParams } from "../shared/enum";
import StudentInvoiceModel from "../models/stinvoice"
import { isNil } from "lodash";
import { commonMessages, evaluationMessages } from "../config/messages";
import AppLogger from "../helpers/logging";

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
  
    return { totalCount, invoice };
  };