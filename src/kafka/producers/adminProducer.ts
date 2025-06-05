import { sendMessage } from "../producer";

export const sendInvoiceEvent =async (payload :any) =>{
    await sendMessage('invoice-paid',payload);
}