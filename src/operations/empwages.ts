import { IEmpwages, IEmpwagesCreate } from "../../types/models.types";
import  EmpWagesModel from "../models/empwages"
import usershiftschedule from "../models/usershiftschedule";

/**
 * Creates a new user.
 *
 * @param {IEmpwagesCreate} payload - The data of the user to be created.
 */


export const createEmpWages = async (  payload: IEmpwagesCreate
): Promise<IEmpwages | { error: any }> => {

     const newWages = new EmpWagesModel(payload);
     // Convert file to string (Base64 encoding)
      const savedUser = await newWages.save();   
      return savedUser;
};

export const getEmpWagesById = async (id: string) => {
  // Step 1: Get wage records for the employee
  const wageRecords = await EmpWagesModel.find({ employeeId: id }).lean();
  if (!wageRecords || wageRecords.length === 0) return null;

  // Step 2: Get shift schedule to get work hours per day
  const shift = await usershiftschedule.findOne({ employeeId: id }).lean();
  const workhrs = shift ? Number(shift.workhrs || 0) : 0;

  // Step 3: Get rate from the wage record's classType
  const rate = Number(wageRecords[0]?.classType?.rate || 0);

  // Step 4: Calculate total
  let totalhours = 0;
  let totalearnings = 0;
  const monthlyMap = new Map<string, { year: number; month: number; totalhours: number }>();

  wageRecords.forEach((record) => {
    const date = new Date(record.createdDate || record.updatedDate || new Date());
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const key = `${year}-${month}`;

    totalhours += workhrs;

    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, {
        year,
        month,
        totalhours: workhrs,
      });
    } else {
      monthlyMap.get(key)!.totalhours += workhrs;
    }
  });

  totalearnings = totalhours * rate;

  // Step 5: Add to existing structure
  const base = wageRecords[0]; // assuming 1 record contains the structure you want
  return {
    ...base,
    totalhours,
    totalearnings,
    monthlyData: Array.from(monthlyMap.values()),
  };
};