import mongoose, { Schema } from "mongoose";
import { z } from "zod";
import { appStatus, commonMessages, role } from "../config/messages";
import { IRoleAccessControl } from "../../types/models.types";

const roleAccessControlSchema = new Schema<IRoleAccessControl>({
    
    roleId: {
        type: String,
       require: true 
    },
    roleName: {
        type: String,
        require: true
    },
    employeeId: {
        type: String,
        require: true
    },

    employeeName: {
        type: String,
        require: true
    },

    employeeEmailId: {
        type: String,
        require: true
    },
    roleStatus: {
        type: String,
        require: true
    },
    dateOfJoining: {
        type: Date,
        require: false
    },
    status: {
        type: String,
        require: true
    },

    createdDate:
    {
        type: Date,
        require: true
    },

    updatedDate:
    {
        type: Date,
        require: false
    },

    createdBy:
    {
        type: String,
        require: true
    },
    updatedBy:
    {
        type: String,
        require: false
    }
},
{
    collection: "roleAccessControl",
    timestamps: true
}
);
export const zodRoleAccessControlSchema = z.object({
    roleId: z.string(),
    roleName: z.enum([role.ACADEMICCOACH, role.SUPERVISOR, role.TEACHER, role.ADMIN]),
    employeeId: z.string(),
    employeeName: z.string(),
    employeeEmailId: z.string().email(),
    roleStatus: z.string(),
    dateOfJoining: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
        message: commonMessages.INVALID_DATE_FORMAT,
      }).transform((val) => new Date(val)).optional(),
    status:z.enum([appStatus.ACTIVE, appStatus.IN_ACTIVE, appStatus.DELETED]),
    createdDate:  z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
        message: commonMessages.INVALID_DATE_FORMAT,
      }).transform((val) => new Date(val)).optional(),
    createdBy: z.string(),
});
export default mongoose.model<IRoleAccessControl>("RoleAccessControl", roleAccessControlSchema);