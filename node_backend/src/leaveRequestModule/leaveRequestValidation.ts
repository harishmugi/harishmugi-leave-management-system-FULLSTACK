import {UserService}from '../userModule/userServices'
export class LeaveRequestValidator{

    static async checkUserExist(employee_id:string){
const employee=await UserService.getEmployee(employee_id)
      if(!employee){
        throw new Error('User does not exist');
    }  
    }
}

// utils/dateValidator.ts

// Function to validate if a date is valid
export function isValidDate(date: any): boolean {
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  }
  