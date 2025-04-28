import { IEmpwages, IEmpwagesCreate } from "../../types/models.types";
import  EmpWagesModel from "../models/empwages"


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

export const getEmpWagesById = async (
  id: string
): Promise<IEmpwages | null> => {
  return EmpWagesModel.find({
    employeeId: id,
  }).lean();
};