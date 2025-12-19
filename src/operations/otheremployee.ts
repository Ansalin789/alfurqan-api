import { IOtherEmployee, IOtherEmployeeCreate } from "../../types/models.types"
import IOtherEmployeeModel from "../models/otheremployee"
import User from "../models/users"
import ShiftSchedule from "../models/usershiftschedule"
import SalaryAndWages from "../models/empwages";
import RoleAccessControleModel from "../models/role_access";
import { Types } from "mongoose";
import { appStatus, role } from "../config/messages";
import { notFound } from "@hapi/boom";
import ModuleAndPermissionsModel from "../models/module_permission_access";
import { getDefaultPermissions } from "./role_access_service";
import { map } from "lodash";

/**
 * Creates a new user.
 *
 * @param {IOtherEmployeeCreate} payload - The data of the user to be created.
 */
export const saveOtherEmployee = async (payload: IOtherEmployeeCreate): Promise<IOtherEmployee | { error: any }> => {
  const otherempdetails = {} as IOtherEmployee;
  otherempdetails.preferedWorkingHours = payload.preferedWorkingHours;
  const preffredToTime = (payload.preferedShiftFrom) + otherempdetails.preferedWorkingHours;
  otherempdetails.preferedShiftTo = preffredToTime;
  const newOtherEmployee = new IOtherEmployeeModel(payload);
  const generateRoleId = generateAFTCode("AFOEMP");
  otherempdetails.employeeId = generateRoleId;

  // Convert file to string (Base64 encoding)
  const savedOtherEmployee = await newOtherEmployee.save();
  // Add salary and wage records with error handling
  const salaryRecords = [
    {
      employeeName: savedOtherEmployee.firstName + " " + savedOtherEmployee.lastName,
      employeeId: savedOtherEmployee.employeeId,
      classType: {
        className: "FIXEDSALARY",
        hoursMins: "1 month",
        rate: 10,
        currency: "$",
      },
      status: "Active",
      createdDate: new Date(),
      createdBy: "Admin",
      updatedDate: new Date(),
      updatedBy: "Admin"
    },
  ];
  try {
    await SalaryAndWages.insertMany(salaryRecords);
    console.log("Salary and wage records inserted successfully.");
  } catch (error) {
    console.error("Error inserting salary and wage records:", error);
    // Optionally, throw or handle error based on your application flow
  }
  const saveUser = await createOtherEmployeePortal(savedOtherEmployee)
  createShiftSchedule(savedOtherEmployee, saveUser);
  const rolecreate = createRoleBasedAccessForOtherEmp(saveUser);
  console.log("rolecreate", rolecreate);
  return savedOtherEmployee;
}

export const getOhterEmpCountriesCount = async () => {
  const otherEmpCountByCountry = await IOtherEmployeeModel.aggregate([
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

  const otherEmployeeCount = await IOtherEmployeeModel.countDocuments({
    status: "Active",
  }).exec();
  const results: any[] = [];
  for (const studentCountry of otherEmpCountByCountry) {
    let otherEmpCountryPercentage = ((studentCountry.count / otherEmployeeCount) * 100).toFixed(2);
    results.push({
      country: studentCountry._id,
      count: studentCountry.count,
      percentage: Number.parseFloat(otherEmpCountryPercentage),
    });
  }
  return { otherEmployeeCount, otherEmpCountByCountry: results };
};

export const UpdateOtherEmployee = async (
  employeeId: string,
  payload: Partial<IOtherEmployee>
) => {

    const updatedEmployee = await IOtherEmployeeModel.findByIdAndUpdate(
      employeeId,
      payload,
      { new: true }
    );

    if (!updatedEmployee) {
      return null;
    }

    if (!updatedEmployee) {
      return { error: "Employee not found" };
    }

    console.log("Updated Employee:", updatedEmployee);
    return updatedEmployee;
};

export const updateOtherEmployeeRoleById = async (
  id: string,
  payload: Partial<IOtherEmployee>
) => {
   if (!id) return "user not found";

  let updateQuery: any = {};

  if (payload.isRole === "Added" && payload.designation?.length) {
    updateQuery = {
      $addToSet: {
        designation: { $each: payload.designation }
      }
    };
  }

  if (payload.isRole === "Removed" && payload.designation?.length) {
    updateQuery = {
      $pull: {
        designation: { $in: payload.designation }
      }
    };
  }

  const updatedEmployee = await IOtherEmployeeModel.findByIdAndUpdate(
    id,
    updateQuery,
    { new: true }
  );

  if (!updatedEmployee || !updatedEmployee.designation) {
    return updatedEmployee;
  }


  // Update User Roles
  const userDetails = await User.findOne({ userId: updatedEmployee._id });
let updateUerDetails;
  if (userDetails) {

   updateUerDetails =await User.findByIdAndUpdate(
    userDetails._id ,
    { role: updatedEmployee.designation },
    { new: true }
  );
}

  const shiftSchedule = await ShiftSchedule.findOne({
    employeeId: userDetails?.userId,
  });

  if (shiftSchedule) {
    // Ensure all user roles exist in shift schedule
 
    await ShiftSchedule.findByIdAndUpdate(
    shiftSchedule._id,
    { role: updatedEmployee.designation },
    { new: true }
  );
    console.log("Shift Schedule Updated:", shiftSchedule);
  }

  let roleAccessControle = await RoleAccessControleModel.find({
    employeeId: userDetails?.userId,
  }); 

   console.log("roleAccessControle:", roleAccessControle);
      console.log("updateUerDetails:", updateUerDetails);

  if(updateUerDetails && roleAccessControle){
for (const roles of roleAccessControle) {
const roleIndexRemove =  map(payload.designation, async (roleName) => {
  if (payload.isRole === "Removed" && roles.roleName === roleName) {

   await RoleAccessControleModel.findOneAndUpdate(
      {
        employeeId: userDetails?.userId,   
        roleName: roleName,
      },
      {
        $set: { roleStatus: appStatus.INACTIVE },
      },
      { new: true }
    );
    console.log("roleName Remove", roleName);
    return roleName;
  }
});
const roleIndexAdd = map(payload.designation, async (roleName) => {
  if (payload.isRole === "Added" && roles.roleName !== roleName) {
    await createRoleBasedAccessForOtherEmp(updateUerDetails);
    console.log("roleName Added", roleName);
    return roleName;
  }
});
console.log("roleIndex", roleIndexRemove);
console.log("roleIndex", roleIndexAdd);
}
  } 
  // Update Shift Schedule Roles
  return updatedEmployee;
  
};


async function createOtherEmployeePortal(updateData: any) {
  const specialChars = '@#$%&*!';
  const randomNum = Math.floor(Math.random() * 1000); // Random number between 0-999
  const randomSpecial = specialChars[Math.floor(Math.random() * specialChars.length)]; // Random special character

  // Generate password
  const firstThreeChars = updateData.firstName.substring(0, 3); // First 3 characters of the username
  const reversedUsername = updateData.firstName.split('').reverse().join(''); // Reverse the username

  const password = `${firstThreeChars}${randomSpecial}${randomNum}${reversedUsername}`;

  let createOtherEmployeePortal = await User.create({
    userId: updateData._id,
    userName: updateData.firstName,
    email: updateData.email,
    password: password,
    profileImage: null,
    role: updateData.designation,
    gender: updateData.gender,
    country: updateData.country,
    status: "Active",
    createdBy: "Admin",
    createdDate: new Date,
    lastUpdatedBy: "Admin",
    updatedDate: new Date
  }
  );
  const saveOtherEmployee = await createOtherEmployeePortal.save();
  return saveOtherEmployee;
};

async function createShiftSchedule(saveOtherEmployee: any, saveUser: any) {
  const startDate = new Date();
  // Create end date by cloning the start date and adding 30 days
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 30);
  let createShift = await ShiftSchedule.create({
    academicCoachId: saveOtherEmployee.designation == "ACADEMICCOACH" ? saveUser.userId : null,
    teacherId: null,
    supervisorId: saveOtherEmployee.designation == "SUPERVISOR" ? saveUser.userId : null,
    employeeId: String(saveOtherEmployee._id),
    name: saveUser.userName,
    email: saveUser.email,
    role: saveUser.role,
    workhrs: saveOtherEmployee.preferedWorkingHours,
    startdate: startDate,
    enddate: endDate,
    fromtime: saveOtherEmployee.preferedShiftFrom,
    totime: saveOtherEmployee.preferedShiftTo,
    createdDate: new Date(),
    createdBy: "Admin",
    lastUpdatedBy: "Admin"
  }
  );
  console.log("createShift", createShift);
  await createShift.save();
  console.log("Student portal", saveOtherEmployee)
};

export const getOhterEmployeeById = async (
  id: string
): Promise<IOtherEmployee | null> => {
  return IOtherEmployeeModel.findOne({
    _id: new Types.ObjectId(id),
  }).lean();
};

async function createRoleBasedAccessForOtherEmp(saveUser: any) {
  console.log("createRoleBasedAccessForOtherEmp", saveUser);
  let createRole;
    console.log("roleName", saveUser.role);
    if (saveUser.role.map((roleName: any) => roleName === role.ACADEMICCOACH).includes(true)) {
      const generateRoleId = generateAFTCode("AC");
      createRole = await RoleAccessControleModel.create({
        roleId: generateRoleId,
        roleName: role.ACADEMICCOACH,
        employeeId: saveUser.userId,
        employeeName: saveUser.userName,
        employeeEmailId: saveUser.email,
        roleStatus: appStatus.ACTIVE,
        status: appStatus.ACTIVE,
        createdDate: new Date(),
        createdBy: "Admin",
      });
      const saveRole = await createRole.save();
      await getModuleAndPermissionsAccess(saveRole);
    } else if (saveUser.role.map((roleName: any) => roleName === role.SUPERVISOR).includes(true)) {
      const generateRoleId = generateAFTCode("SV");
      createRole = await RoleAccessControleModel.create({
        roleId: generateRoleId,
        roleName: role.SUPERVISOR,
        employeeId: saveUser.userId,
        employeeName: saveUser.userName,
        employeeEmailId: saveUser.email,
        roleStatus: appStatus.ACTIVE,
        status: appStatus.ACTIVE,
        createdDate: new Date(),
        createdBy: "Admin",
      });
      const saveRole = await createRole.save();
      await getModuleAndPermissionsAccess(saveRole);
    } else if (saveUser.role.map((roleName: any) => roleName === role.ADMIN).includes(true)) {
      const generateRoleId = generateAFTCode("AD");
      createRole = await RoleAccessControleModel.create({
        roleId: generateRoleId,
        roleName: role.ADMIN,
        employeeId: saveUser.userId,
        employeeName: saveUser.userName,
        employeeEmailId: saveUser.email,
        roleStatus: appStatus.ACTIVE,
        status: appStatus.ACTIVE,
        createdDate: new Date(),
        createdBy: "Admin",
      });
      const saveRole = await createRole.save();
      await getModuleAndPermissionsAccess(saveRole);
    } else {
      return notFound("Role not found");
    }
  
  return createRole;
}


function generateAFTCode(preName: string) {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `${preName}${num}`;
}

async function getModuleAndPermissionsAccess(roleAccessControlData: any) {
  // Logic to assign module and permissions based on role
  console.log("Assigning modules and permissions for role:", roleAccessControlData.roleName);
  const defaultModulePermissions = getDefaultPermissions(roleAccessControlData.roleName);
  // Assign modules and permissions for Academic Coach

  let moduleAndPermissions = await ModuleAndPermissionsModel.create({
    role: {
      roleId: roleAccessControlData._id,
      roleName: roleAccessControlData.roleName
    },
    moduleName: roleAccessControlData.roleName,
    moduleAccessPermission: defaultModulePermissions,
    status: appStatus.ACTIVE,
    createdDate: new Date(),
    createdBy: "Admin",
  });
  await moduleAndPermissions.save();
  return moduleAndPermissions;
}
