import { IOtherEmployee, IOtherEmployeeCreate } from "../../types/models.types"
import IOtherEmployeeModel from "../models/otheremployee"
import User from "../models/users"
import ShiftSchedule from "../models/usershiftschedule"
import OtherEmpModel from "../models/otheremployee"
import { Types } from "mongoose"

/**
 * Creates a new user.
 *
 * @param {IOtherEmployeeCreate} payload - The data of the user to be created.
 */
export const saveOtherEmployee = async (payload: IOtherEmployeeCreate): Promise<IOtherEmployee | { error: any }> => {

const otherempdetails = {} as IOtherEmployee;

otherempdetails.preferedWorkingHours =  payload.preferedWorkingHours;
const preffredToTime = (payload.preferedShiftFrom) + otherempdetails.preferedWorkingHours;
otherempdetails.preferedShiftTo = preffredToTime;

         const newOtherEmployee = new IOtherEmployeeModel(payload);

         // Convert file to string (Base64 encoding)
          const savedOtherEmployee = await newOtherEmployee.save();
         const saveUser = await createTeacherPortalPortal(savedOtherEmployee)
         createShiftSchedule(savedOtherEmployee, saveUser);

          return savedOtherEmployee;

}

export const getOhterEmpCountriesCount = async() =>{

  const otherEmpCountByCountry = await OtherEmpModel.aggregate([
    {
      $match: {
        status: "Active", // Optional filter
      },
    },
    {
      $group: {
        _id: "$country",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 }, // Optional: sort descending
    },
  ]);
  
  const otherEmployeeCount = await OtherEmpModel.countDocuments({
    status: "Active",
  }).exec();
  
  const results: any[] = [];
  
  for (const studentCountry of otherEmpCountByCountry) {
    let otherEmpCountryPercentage = ((studentCountry.count / otherEmployeeCount) * 100).toFixed(2);
    results.push({
      country: studentCountry._id,
      count: studentCountry.count,
      percentage: parseFloat(otherEmpCountryPercentage),
    });
  }
  
  
  return { otherEmployeeCount, otherEmpCountByCountry: results };

};

 async function createTeacherPortalPortal(updateData:any) {
    const specialChars = '@#$%&*!';
    const randomNum = Math.floor(Math.random() * 1000); // Random number between 0-999
    const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)]; // Random special character
  
    // Generate password
    const firstThreeChars = updateData.firstName.substring(0, 3); // First 3 characters of the username
    const reversedUsername = updateData.firstName.split('').reverse().join(''); // Reverse the username
  
    const password = `${firstThreeChars}${randomSpecial}${randomNum}${reversedUsername}`;

  let createStudentPortal = await User.create({
    userId: updateData._id,
    userName: updateData.firstName,
    email:updateData.email,
    password: password,
    profileImage: null,
    role: updateData.designation,
    gender: updateData.gender,
    country: updateData.country,
    status: "Active",
    createdBy: "Admin",
    createdDate: new Date,
    lastUpdatedBy: "Admin" ,   
    updatedDate: new Date
  }
   );

   const saveStudent = await createStudentPortal.save();

  return saveStudent;
};
async function createShiftSchedule(saveStudent:any, saveUser: any) {


  const startDate = new Date();
  
  // Create end date by cloning the start date and adding 30 days
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 30);
  let createShift = await ShiftSchedule.create({
        academicCoachId : null,
        teacherId : null,
        supervisorId: null,
        employeeId: saveStudent._id.toString(),
        name: saveUser.userName,
        email: saveUser.email,
        role: saveUser.role[0],
        workhrs: saveStudent.preferedWorkingHours,
        startdate: startDate,
        enddate : endDate, 
        fromtime: saveStudent.preferedShiftFrom,
        totime: saveStudent.preferedShiftTo,
        createdDate: new Date(),
        createdBy: "Admin",
        lastUpdatedBy: "Admin"
    }
     );
     console.log("createShift", createShift);
     await createShift.save();
     
  console.log("Student portal",saveStudent )
};

export const getOhterEmployeeById = async (
  id: string
): Promise<IOtherEmployee | null> => {
  return IOtherEmployeeModel.findOne({
    _id: new Types.ObjectId(id),
  }).lean();
};