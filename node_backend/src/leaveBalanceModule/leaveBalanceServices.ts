import { dataSource } from '../../db/connection';
import { LeaveBalance } from './leaveBalanceEntity';

export interface LeaveBalanceData {
     
         id: string;
         employee_id: string;
         leave_type_id: number;
         allocated_leave: number;
         used_leave: number;
         remaining_leave: number;
     
}

export class LeaveBalanceService {

    //CREATE LEAVE BALANCE================================================================================================================================

    static async createLeaveBalance(leaveBalanceData: LeaveBalanceData): Promise<LeaveBalance> {
        const leaveBalanceRepository = dataSource.getRepository(LeaveBalance);
console.log("hitted again")
        try {
            const leaveBalance = leaveBalanceRepository.create({ ...leaveBalanceData });

            await leaveBalanceRepository.save(leaveBalance);

            return leaveBalance;
        } catch (error) {
            console.error('Error creating leaveBalance!:', error);
            throw new Error('Failed to create leaveBalance!');
        }
    }


    //GET USERS==================================================================================================================================

    static async getAllLeaveBalance(id): Promise<LeaveBalance[]> {


        try {
            const leaveBalanceRepository = dataSource.getRepository(LeaveBalance);
            return await leaveBalanceRepository.find({where: { employee_id: id },relations: ['leaveType']})
        } catch (error) { console.error('Error in getting!', error); throw new Error('Failed to get!') }
    }


    //UPDATE=================================================================================================================================

    static async updateLeaveBalance(id: string, updateData: Partial<LeaveBalance>): Promise<LeaveBalance | null> {
        const leaveBalanceRepository = dataSource.getRepository(LeaveBalance);
        const leaveBalance = await leaveBalanceRepository.findOneBy({ id });

        if (!leaveBalance) {
            return null;
        }


        try {
            const updated = leaveBalanceRepository.merge(leaveBalance, updateData);
            return await leaveBalanceRepository.save(updated);
        } catch (error) {
            console.error('Error in updating!', error);
            throw new Error('Failed to update!')
        }


    }

    //DELETE===============================================================================================================================
    static async deleteLeaveBalance(id: string): Promise<boolean> {
        const leaveBalanceRepository = dataSource.getRepository(LeaveBalance);
        try {
            const result = await leaveBalanceRepository.delete(id);
            return result.affected !== 0; // true if deletion occurred
        } catch (error) {
            console.error('Error in deletion!', error);
            throw new Error('Failed to delete!')
        }
    }

    static async initializeLeaveBalancesForEmployee(employeeId: string) {
      const leaveTypeRepo = dataSource.getRepository(LeaveType);
      const leaveBalanceRepo = dataSource.getRepository(LeaveBalance);
  
      const leaveTypes = await leaveTypeRepo.find();
  
      const leaveBalances = leaveTypes.map(type => {
        const balance = new LeaveBalance();
        balance.employee_id = employeeId;
        balance.leave_type_id = type.id;
        balance.allocated_leave = 20; // or custom per type
        balance.used_leave = 0;
        balance.remaining_leave = 20;
        return balance;
      });
  
      await leaveBalanceRepo.save(leaveBalances);
    }



}



import { LeaveType } from '../leaveTypeModule/leaveTypeEntity';


