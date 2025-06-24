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

export const academicDashboardTeachersStudentCount = async (payload : any) =>{
    await sendMessage('academicDashboardTeachersStudentCount',payload);
}

export const academicTeacherStudentList = async (payload : any) =>{
    await sendMessage('academicTeacherStudentList',payload);
}

export const academicAvailableTeachers = async (payload : any) =>{
    await sendMessage('academicAvailableTeachers',payload);
}

export const academicTeacherSchedule =  async (payload : any) =>{
    await sendMessage('academicTeacherSchedule',payload)
}