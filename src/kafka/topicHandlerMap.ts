import { dashboardWidgetSupervisorCounts } from "../operations/dashboard";
import { getTotalAmountByCourse } from "../operations/invoice";
import { emitEventToClient } from "../shared/socket";

export const topicHandler: Record<string, (data: any) => Promise<void>> = {

    'invoice-paid':async(data : any) =>{
        console.log("invioce data " , data);
        const latestRevenue = await getTotalAmountByCourse('yearly');
        console.log("💰 Latest Revenue:", latestRevenue);
        emitEventToClient('revenueUpdated', latestRevenue,"6805da8c06542aa33858b889");
    },

    'supervisorcardcount': async (data :any)=>{
        console.log('running supervisor card count');
       const cardcount = await dashboardWidgetSupervisorCounts(data.supervisorId);
       console.log("cardcount" ,cardcount);
       emitEventToClient('supervisordashboardcount',cardcount,data.supervisorId);
    },

    'recruitmentlist': async({event , data} :{ event : string, data : any})=>{
        console.log('running recruitment list');
        if(event === 'create'){
            console.log('create event');
        }else if(event === 'update'){
            console.log('update event');
        }
        emitEventToClient('recruitmentlist',{event,data})
    },

    'addmeeting':async({event,data} : {event : string, data : any})=>{
      console.log('add meeting');
      emitEventToClient('addmeeting',{event,data},data.supervisor.supervisorId);
    },

    'supervisorteacherlist' : async(data : any)=>{
        console.log('supervisorteacherlist');
        emitEventToClient('supervisorteacherlist',data);
    },

    'supervisorfeedbacklist' : async (data : any) =>{
        console.log('supervisorfeedbacklist');
        emitEventToClient('supervisorfeedbacklist',data);
    }
};