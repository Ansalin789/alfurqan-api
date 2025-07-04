import { sendMessage } from "../producer";

export const sendInvoiceEvent = async (payload :any) =>{
    await sendMessage('invoice-paid',payload);
}
 
export const sendLogsToKafka = async (payload :any) => {
    await sendMessage('sendLogsToKafka', payload);
}