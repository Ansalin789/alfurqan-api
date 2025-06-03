import { sendMessage } from "../producer";

export const sendInvoiceEvent =async (payload :any) =>{
    await sendMessage('invoice-paid',payload);
}
export const supervisorCardCount = async (payload : any) =>{
    await sendMessage('supervisorcardcount',payload);
}
