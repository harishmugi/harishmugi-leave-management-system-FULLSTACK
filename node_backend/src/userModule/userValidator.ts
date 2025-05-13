import {UserService}from './userServices'
export class UserValidator{

    static async checkUserAlreadyExist(email:string){
const employee=await UserService.getEmployee(email)
      if(employee){
        throw new Error('User with this email already exists');
    }  
    }   static async isUser(email:string){
        const employee=await UserService.getEmployee(email)
              if(!employee){
                throw new Error('User with this email already exists');
            }  
            }
}