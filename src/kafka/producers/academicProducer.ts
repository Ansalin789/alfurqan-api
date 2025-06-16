import { sendMessage } from "../producer";

export const academicDashboardCard = async(payload : any)=>{
    await sendMessage('academicDashboardCard',payload);
}

export const academicStudentList = async( payload : any ) =>{
    await sendMessage('academicStudentList',payload);
}

export const academicStudentProfile = async( payload : any ) =>{
    await sendMessage('academicStudentProfile',payload);
}

//this one is not used yet
export const academicDashboardTeachersCount = async (payload : any) =>{
    await sendMessage('academicDashboardTeachersCount',payload);
}