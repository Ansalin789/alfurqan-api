import { z } from "zod";
import { ResponseToolkit, Request } from "@hapi/hapi";
import { zodCourseSchema } from "../../models/course";
import { createCourses, getAllCourse,ListCourseLevels, UpdateAllLevel } from "../../operations/course";
import { zodGetAllRecordsQuerySchema } from "../../shared/zod_schema_validation";

const createCourseValidation = z.object({
  payload: zodCourseSchema.pick({
    course: true,
    courseName: true,
    level: true,
    status: true,
    createdBy: true,
    lastUpdatedBy: true,
  }).partial(),
});

const createCourseValidations = z.object({
    query: zodGetAllRecordsQuerySchema.pick({
      searchText: true,
      sortBy: true,
      sortOrder: true,
      offset: true,
      limit: true,
      courseId:true,
    })
  });
  
  

export default {
  async createCourses(req: Request, h: ResponseToolkit) {
    try {
      const { payload } = createCourseValidation.parse({ payload: req.payload });

      const result = await createCourses({
        course: {
          courseId: payload.course?.courseId || "",
          courseTitle: payload.course?.courseTitle || "",
          courseDuration: payload.course?.courseDuration || "",
          courseDescription: payload.course?.courseDescription || "",
          courseLevel: payload.course?.courseLevel || "",
        },
        courseName: payload.courseName || "",
        level: (payload.level || []).map((lvl) => ({
            levelId: lvl?.levelId || "",  
            contentLevel: lvl?.contentLevel || "",
            descriptions: typeof lvl?.descriptions === "string"
              ? Buffer.from(lvl.descriptions) // Convert string to Buffer if necessary
              : lvl?.descriptions || Buffer.from(''), // Default to empty Buffer if undefined
            duration: lvl?.duration || "",
          })),
          
        status: payload.status || "Active",
        createdDate: new Date(),
        createdBy: payload.createdBy || "System",
        lastUpdatedDate: new Date(),
        lastUpdatedBy: payload.lastUpdatedBy || "System",
      });
      
      return h.response({ message: "Course created successfully", data: result }).code(201);
    } catch (error) {
      console.error(" Error creating course:", error);
      return h.response({ error: "Failed to create course", details: error }).code(500);
    }
  },


 async getAllCourse(req: Request, h: ResponseToolkit) {
     try {
       // Ensure req.query is treated as an object
       const queryParams = req.query as Record<string, any>;
   
       // Parse and validate the request query using zod
       const parsedQuery = createCourseValidations.parse({
         query: {
           ...queryParams,
           filterValues: (() => {
             try {
               return queryParams?.filterValues
                 ? JSON.parse(queryParams.filterValues as string)
                 : {};
             } catch {
               throw new Error("Invalid filterValues JSON format.");
             }
           })(),
         },
       });
   
       const query = parsedQuery.query;
   
       // Call your service or database function to fetch data
       const result = await getAllCourse(query);
   
       // Return the response
       return h.response(result).code(200);
     } catch (error) {
       // Handle errors (validation or other errors)
       return h.response({ error }).code(400);
     }
   },



   async UpdateAllCourseLevel(req: Request, h: ResponseToolkit) {
    try {
      // Parse and validate the payload using Zod schema
      const { payload } = createCourseValidation.parse({
        payload: req.payload,
      });
  
      console.log("Payload received:", req.payload);
  
      // Ensure that courseId is provided
      const courseId = payload.course?.courseId;
      if (!courseId) {
        return h.response({ error: "Course ID is required" }).code(400); // Respond with an error if courseId is missing
      }
  
      // Create new level objects from payload (handle as an array)
      const newLevels = (payload.level ?? []).map(level => ({
        levelId: level.levelId || "",  // Use default empty string if not present
        contentLevel: level.contentLevel || "",
        descriptions: typeof level.descriptions === "string"
          ? Buffer.from(level.descriptions)  // If descriptions is a string, convert to Buffer
          : level.descriptions || Buffer.from(""),  // Default to empty buffer if undefined
        duration: level.duration || "",
      }));
  
      // Call the UpdateAllLevel function with courseId and levels array
      const result = await UpdateAllLevel(courseId, {
        level: newLevels,
        status: payload.status,
        lastUpdatedBy: payload.lastUpdatedBy,
      });
  
      return h.response({ message: "Course level updated successfully", data: result }).code(200);
    } catch (error) {
      console.error("Error updating course level:", error);
      return h.response({ error: "Failed to update course level" }).code(500);
    }
  },


  async getAllCourseLevelByCourseId(req: Request, h: ResponseToolkit) {
    try {
      const parsedQuery = createCourseValidations.parse({ query: req.query });
      const { courseId, searchText, sortBy, sortOrder, offset, limit } = parsedQuery.query;
  
      if (!courseId) {
        throw new Error("courseId is required");
      }
  
      // Convert offset and limit from string to number or undefined
      const params = {
        searchText,
        sortBy,
        sortOrder,
        offset: offset !== null ? Number(offset) : undefined,
        limit: limit !== null ? Number(limit) : undefined,
      };
  
      const result = await ListCourseLevels(courseId, params);
  
      return h.response(result).code(200);
    } catch (error) {
      console.error("Error in getAllCourseLevelByCourseId:", error);
      return h.response({ error }).code(400);
    }
  }
  
  
  
  
  
  
}  