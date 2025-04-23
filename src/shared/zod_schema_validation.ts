import { z } from "zod";

export const zodGetAllRecordsQuerySchema = z.object({
  courseId:z.string().optional(),
  roomId:z.string().optional(),
  teacherId:z.string().optional(),
  studentId:z.string().optional(),
  supervisorId:z.string().optional(),
  academicCoachId: z.string().optional(),
  searchText: z.string().default(""),
  sortBy: z.string().default("lastUpdatedDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  offset: z.string().nullable().default(null),
  limit: z.string().nullable().default(null),
  trialClassStatus: z.string().optional(),
  filterValues : z.object({
    // Filter for courses: Array of course names or IDs, optional
    course: z.string()
      .optional(),
    // Filter for countries: Array of country codes or names, optional
    country: z.string()
      .optional(),
    // Filter for teachers: Array of Object IDs, optional, validated with regex
    teacher: z.string()
    .optional(),
    // Filter for status: Array of enums, optional, with default values
    status: z.string()
    .optional(),
    
  })

 });

export const zodGetAllUserRecordsQuerySchema = z.object({
  role: z.string().min(3),
  date:z.string().optional(),
});

export const zodAuthenticationSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});



export const zodAlStudentInvoiceSchemaValidation = z.object({
  sortBy: z.string().default("lastUpdatedDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  offset: z.string().nullable().default(null),
  limit: z.string().nullable().default(null),
  type: z.enum(["weekly", "monthly", "yearly"]).default("yearly"),
});


export const zodGetAllApplicantsRecordsQuerySchema = z.object({

  searchText: z.string().default(""),
  sortBy: z.string().default("positionApplied"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  offset: z.string().nullable().default(null),
  limit: z.string().nullable().default(null),
  filterValues : z.object({
    // Filter for status: Array of enums, optional, with default values
    applicationStatus: z.string()
    .optional()
  })
 });
