import { dataSource } from '../../db/connection';
import { LeaveType } from './leaveTypeEntity';

export interface LeaveTypeData {
       id: number;
       leave_type: string;
     
}

export class LeaveTypeService {

    //CREATE LEAVE TYPE================================================================================================================================

    static async createLeaveType(leaveTypeData: LeaveTypeData): Promise<LeaveType> {
        const leaveTypeRepository = dataSource.getRepository(LeaveType);

        try {
            const leaveType = leaveTypeRepository.create({ ...leaveTypeData });

            await leaveTypeRepository.save(leaveType);

            return leaveType;
        } catch (error) {
            console.error('Error creating leaveType!:', error);
            throw new Error('Failed to create leaveType!');
        }
    }


    //GET USERS==================================================================================================================================

    static async getAllLeaveType(): Promise<LeaveType[]> {


        try {
            const leaveTypeRepository = dataSource.getRepository(LeaveType);
            return await leaveTypeRepository.find();
        } catch (error) { console.error('Error in getting!', error); throw new Error('Failed to get!') }
    }
    
    static async getLeaveType(leave_type: string): Promise<LeaveType | null> {
        try {
            const leaveTypeRepository = dataSource.getRepository(LeaveType);
            return await leaveTypeRepository.findOneBy({ leave_type }); // Pass as an object
        } catch (error) {
            console.error('Error in getting leave type!', error);
            throw new Error('Failed to get leave type!');
        }
    }
    


    //UPDATE=================================================================================================================================

    static async updateLeaveType(id: number, updateData: Partial<LeaveType>): Promise<LeaveType | null> {
        const leaveTypeRepository = dataSource.getRepository(LeaveType);
        const leaveType = await leaveTypeRepository.findOneBy({ id });

        if (!leaveType) {
            return null;
        }


        try {
            const updated = leaveTypeRepository.merge(leaveType, updateData);
            return await leaveTypeRepository.save(updated);
        } catch (error) {
            console.error('Error in updating!', error);
            throw new Error('Failed to update!')
        }


    }

    //DELETE===============================================================================================================================
    static async deleteLeaveType(id: string): Promise<boolean> {
        const leaveTypeRepository = dataSource.getRepository(LeaveType);
        try {
            const result = await leaveTypeRepository.delete(id);
            return result.affected !== 0; // true if deletion occurred
        } catch (error) {
            console.error('Error in deletion!', error);
            throw new Error('Failed to delete!')
        }
    }



}
