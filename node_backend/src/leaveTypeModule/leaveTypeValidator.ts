import {LeaveTypeService}from './leaveTypeServices'
export class LeaveTypeValidator{

    static async checkLeaveTypeAlreadyExist(leave_type:string){
const type=await LeaveTypeService.getLeaveType(leave_type)
      if(type){
        throw new Error('Leave type already exists');
    }  
    }
}