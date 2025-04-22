import { Request, ResponseToolkit } from '@hapi/hapi';
import UserModel from "../../models/users"
import  getallsettinglist, { updateUserAccess } from "../../operations/roleaccess"
import { IAccessModel } from '../../../types/models.types';

export default{

  //Update the role access

   async updateroleAccessById(req: Request, h: ResponseToolkit) {
      try {
        const rawPayload = req.payload as Partial<IAccessModel>;
        const { _id } = req.params;
    
        const user = await UserModel.findById(_id);
        if (!user) {
          return h.response({ message: 'User not found' }).code(404);
        }
            
       
        const accessPayload: Partial <IAccessModel> = {
         employeeId: user._id.toString(),
         employeeName: user.userName || "",
         contact: user.email || "",
         designation: Array.isArray(user.role) ? user.role : [user.role],
         dateOfJoining: user.createdDate || new Date(),
       
         roleAccess: {
           admin: rawPayload.roleAccess?.admin || false,
           adminmodules: {
             dashboard: rawPayload.roleAccess?.adminmodules?.dashboard || false,
             evaluation: rawPayload.roleAccess?.adminmodules?.evaluation || false,
             student: rawPayload.roleAccess?.adminmodules?.student || false,
             employees: rawPayload.roleAccess?.adminmodules?.employees || false,
             courses: rawPayload.roleAccess?.adminmodules?.courses || false,
             classes: rawPayload.roleAccess?.adminmodules?.classes || false,
             invoice: rawPayload.roleAccess?.adminmodules?.invoice || false,
             analytics: rawPayload.roleAccess?.adminmodules?.analytics || false,
             messages: rawPayload.roleAccess?.adminmodules?.messages || false,
             settings: rawPayload.roleAccess?.adminmodules?.settings || false,
           },
           academicCoach: rawPayload.roleAccess?.academicCoach || false,
           academicmodules: {
             dashboard: rawPayload.roleAccess?.academicmodules?.dashboard || false,
             scheduledevaluation: rawPayload.roleAccess?.academicmodules?.scheduledevaluation || false,
             scheduledtrail: rawPayload.roleAccess?.academicmodules?.scheduledtrail || false,
             students: rawPayload.roleAccess?.academicmodules?.students || false,
             teachers: rawPayload.roleAccess?.academicmodules?.teachers || false,
             messages: rawPayload.roleAccess?.academicmodules?.messages || false,
             support: rawPayload.roleAccess?.academicmodules?.support || false,
           },
           supervisor: rawPayload.roleAccess?.supervisor || false,
           supervisormodules: {
             dashboard: rawPayload.roleAccess?.supervisormodules?.dashboard || false,
             recuirement: rawPayload.roleAccess?.supervisormodules?.recuirement || false,
             meeting: rawPayload.roleAccess?.supervisormodules?.meeting || false,
             teachers: rawPayload.roleAccess?.supervisormodules?.teachers || false,
             messages: rawPayload.roleAccess?.supervisormodules?.messages || false,
             support: rawPayload.roleAccess?.supervisormodules?.support || false,
           },
           student: rawPayload.roleAccess?.student || false,
           studentmodules: {
             dashboard: rawPayload.roleAccess?.studentmodules?.dashboard || false,
             recuirement: rawPayload.roleAccess?.studentmodules?.recuirement || false,
             meeting: rawPayload.roleAccess?.studentmodules?.meeting || false,
             teachers: rawPayload.roleAccess?.studentmodules?.teachers || false,
             messages: rawPayload.roleAccess?.studentmodules?.messages || false,
             suppor: rawPayload.roleAccess?.studentmodules?.suppor || false, // typo preserved
           },
           teacher: rawPayload.roleAccess?.teacher || false,
           teachermodules: {
             dashboard: rawPayload.roleAccess?.teachermodules?.dashboard || false,
             recuirement: rawPayload.roleAccess?.teachermodules?.recuirement || false,
             meeting: rawPayload.roleAccess?.teachermodules?.meeting || false,
             teachers: rawPayload.roleAccess?.teachermodules?.teachers || false,
             messages: rawPayload.roleAccess?.teachermodules?.messages || false,
             support: rawPayload.roleAccess?.teachermodules?.support || false,
           },
         },
       
         status: rawPayload.status ?? "active",
         createdDate: new Date(),
         createdBy: rawPayload.createdBy ?? "system",
         updatedDate: new Date(),
         updatedBy: rawPayload.updatedBy ?? "system",
       };
       
       
       
    
        const roleAccess = await updateUserAccess(accessPayload);
    
        return h.response({
          message: 'Access assigned successfully',
          user,
          roleAccess,
        }).code(200);
    
      } catch (error) {
        console.error(error);
        return h.response({ message: 'Internal Server Error' }).code(500);
      }
    },
    
    
   //getlist for Employeelist
    
   async getsettinglist(req: Request, h: ResponseToolkit) {
    try {
      const { employeeName, designation, fromDate, toDate } = req.query;
  
      const result = await getallsettinglist({ employeeName, designation, fromDate, toDate });
  
      return h.response({
        status: 'success',
        data: result,
      }).code(200);
    } catch (error) {
      console.error(error);
      return h.response({ message: 'Internal Server Error' }).code(500);
    }
  },
  




  }