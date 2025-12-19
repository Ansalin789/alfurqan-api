import mongoose, { Schema } from "mongoose";
import { IModulePermissionAccess } from "../../types/models.types";
import { z } from "zod";

export const modulePermissionAccessSchema = new Schema<IModulePermissionAccess>({
    role: {
        roleId: {
            type: String,
            required: true
        },
        roleName: {
            type: String,
            required: true
        }

    },
    moduleName: {
        type: String,
        enum: ["ACADEMICCOACH", "SUPERVISOR", "TEACHER", "ADMIN"],
        required: true
    },
    moduleAccessPermission: [
        {
            key: {
                type: String,
                required: true
            }, // dynamic key
            isEnabled: {
                type: Boolean,
                default: true
            },

            permission: {
                read: {
                    type: Boolean,
                    default: false
                },
                write: {
                    type: Boolean,
                    default: false
                },
                delete: {
                    type: Boolean,
                    default: false
                }
            }
        }
    ],
    status: {
        type: String,
        require: true,
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
        collection: "modulePermissionAccess",
        timestamps: true
    }
);

export const zodModulePermissionAccess = z.object({
    role: z.object({
        roleId: z.string(),
        roleName: z.string()
    }),
    moduleName: z.enum(["ACADEMICCOACH", "SUPERVISOR", "TEACHER", "ADMIN"]),
    moduleAccessPermission: z.array(z.object({
        key: z.string(),
        isEnabled: z.boolean().optional(),
        permission: z.object({
            read: z.boolean().optional(),
            write: z.boolean().optional(),
            delete: z.boolean().optional() ,
        })
    })),
    status: z.enum(["ACTIVE", "IN_ACTIVE", "DELETED"]).optional(),
    createdDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }).transform((val) => new Date(val)).optional(),
    createdBy: z.string().optional(),
    updatedDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {   
        message: "Invalid date format",
    }).transform((val) => new Date(val)).optional(),
    updatedBy: z.string().optional(),
});

export default mongoose.model<IModulePermissionAccess>("ModulePermissionAccess", modulePermissionAccessSchema);

