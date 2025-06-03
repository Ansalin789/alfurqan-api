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

    'supervisorcardcount' : async (data :any)=>{
       const cardcount = await dashboardWidgetSupervisorCounts(data.supervisorId);
       console.log("cardcount" ,cardcount);
       emitEventToClient('supervisordashboardcount',cardcount,data.supervisorId);
    },
};