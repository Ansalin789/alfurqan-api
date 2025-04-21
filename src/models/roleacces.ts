import mongoose, { Schema } from "mongoose";
import {  IAccessModel } from "../../types/models.types";
import { z } from "zod";

const roleAccess = new Schema<IAccessModel>(
  {
    employeeId: { type: String, required: false },
    employeeName: { type: String, required: false },
    contact: { type: String, required: false },
    designation: {  type: [String], required: false },
    dateOfJoining:{ type: Date, required: false },
    roleAccess :{

    admin: {type: Boolean, required: false},
    adminmodules: 
    {
        dasboard : { type: Boolean, required: false },
        evaluation: { type: Boolean, required: false },
        student: { type: Boolean, required: false },
        employees: { type: Boolean, required: false },
        courses: { type: Boolean, required: false },
        classes: { type: Boolean, required: false },
        invoice: { type: Boolean, required: false },
        analytics: { type: Boolean, required: false },
        messages: { type: Boolean, required: false },
        settings: {type: Boolean, required:false},
      },

      academicCoach: {type: Boolean, required: false},
      academicmodules: 
      {
          dashboard : { type: Boolean, required: false },
          scheduledevaluation: { type: Boolean, required: false },
          scheduledtrail: { type: Boolean, required: false },
          students: { type: Boolean, required: false },
          teachers: { type: Boolean, required: false },
          messages: { type: Boolean, required: false },
          support: {type: Boolean, required:false},
        },

      supervisor: {type: Boolean, required: false},
      supervisormodules: 
      {
          dashboard : { type: Boolean, required: false },
          recuirement: { type: Boolean, required: false },
          meeting: { type: Boolean, required: false },
          teachers: { type: Boolean, required: false },
          messages: { type: Boolean, required: false },
          support: { type: Boolean, required: false },
        },

        teacher: {type: Boolean, required: false},
        teachermodules: 
        {
            dashboard : { type: Boolean, required: false },
            recuirement: { type: Boolean, required: false },
            meeting: { type: Boolean, required: false },
            teachers: { type: Boolean, required: false },
            messages: { type: Boolean, required: false },
            support: { type: Boolean, required: false },
          }, 

          student: {type: Boolean, required: false},
          studentmodules: 
          {
              dashboard : { type: Boolean, required: false },
              recuirement: { type: Boolean, required: false },
              meeting: { type: Boolean, required: false },
              teachers: { type: Boolean, required: false },
              messages: { type: Boolean, required: false },
              support: { type: Boolean, required: false },
            }, 


  
      },
     
      status: { type: String, required: false },
      createdDate: { type: Date, required: true, default: Date.now },
      createdBy: { type: String, required: true },
      updatedDate: { type: Date, required: true, default: Date.now },
      updatedBy: { type: String, required: false },
    },
   {
    collection: "roleAccess",
    timestamps: false,
   }
);


export const zodroleAccessSchema = z.object({
  employeeId: z.string().optional(),
  employeeName: z.string().optional(),
  contact: z.string().optional(),
  designation: z.array(z.string()).min(1),
  dateOfJoining: z.string().optional(),

  roleAccess: z.object({
    admin: z.boolean().optional(),
    adminmodules: z.object({
      dasboard: z.boolean().optional(),
      evaluation: z.boolean().optional(),
      student: z.boolean().optional(),
      employees: z.boolean().optional(),
      courses: z.boolean().optional(),
      classes: z.boolean().optional(),
      invoice: z.boolean().optional(),
      analytics: z.boolean().optional(),
      messages: z.boolean().optional(),
      settings: z.boolean().optional(),
    }).optional(),

    academicCoach: z.boolean().optional(),
    academicmodules: z.object({
      dashboard: z.boolean().optional(),
      scheduledevaluation: z.boolean().optional(),
      scheduledtrail: z.boolean().optional(),
      students: z.boolean().optional(),
      teachers: z.boolean().optional(),
      messages: z.boolean().optional(),
      support: z.boolean().optional(),
    }).optional(),

    supervisor: z.boolean().optional(),
    supervisormodules: z.object({
      dashboard: z.boolean().optional(),
      recuirement: z.boolean().optional(),
      meeting: z.boolean().optional(),
      teachers: z.boolean().optional(),
      messages: z.boolean().optional(),
      support: z.boolean().optional(),
    }).optional(),

    teacher: z.boolean().optional(),
    teachermodules: z.object({
      dashboard: z.boolean().optional(),
      recuirement: z.boolean().optional(),
      meeting: z.boolean().optional(),
      teachers: z.boolean().optional(),
      messages: z.boolean().optional(),
      support: z.boolean().optional(),
    }).optional(),

    student: z.boolean().optional(),
    studentmodules: z.object({
      dashboard: z.boolean().optional(),
      recuirement: z.boolean().optional(),
      meeting: z.boolean().optional(),
      teachers: z.boolean().optional(),
      messages: z.boolean().optional(),
      support: z.boolean().optional(),
    }).optional(),
  }),

  status: z.string().optional(),
  createdDate: z.union([z.string(), z.date()]).optional(),
  createdBy: z.string(),
  updatedDate: z.union([z.string(), z.date()]).optional(),
  updatedBy: z.string().optional(),
});

export default mongoose.model<IAccessModel>("roleAccess", roleAccess);

