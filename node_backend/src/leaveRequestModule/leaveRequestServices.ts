import { In } from 'typeorm/find-options/operator/In';
import { dataSource } from '../../db/connection';
import { LeaveType } from '../leaveTypeModule/leaveTypeEntity';
import { Employee } from '../userModule/userEntity';
import { LeaveRequest } from './leaveRequestEntity';
import { LeaveBalance } from '../leaveBalanceModule/leaveBalanceEntity';
import { differenceInCalendarDays } from 'date-fns';
import { isValidDate } from './leaveRequestValidation';
import { LeaveBalanceController } from '../leaveBalanceModule/leaveBalanceController';

export class LeaveRequestService {
    static async createLeaveRequest(leaveRequestData: any) {
        const leaveRequestRepository = dataSource.getRepository(LeaveRequest);
        const leaveTypeRepository = dataSource.getRepository(LeaveType);
        const userRepository = dataSource.getRepository(Employee);

        // Add logging to inspect date fields
        console.log('Start Date:', leaveRequestData.startDate);
        console.log('End Date:', leaveRequestData.endDate);

        if (!isValidDate(leaveRequestData.startDate) || !isValidDate(leaveRequestData.endDate)) {
            console.error('Invalid date format');
            throw new Error('Invalid start or end date');
        }

        try {
            const leaveType = await leaveTypeRepository.findOne({ where: { id: leaveRequestData.leave_type_id } });
            if (!leaveType) throw new Error("Invalid leave type");

            const startDate = new Date(leaveRequestData.startDate);
            const endDate = new Date(leaveRequestData.endDate);

            // Additional validation for startDate and endDate logic
            if (startDate > endDate) {
                console.error('Start date cannot be after end date');
                throw new Error('Start date cannot be after end date');
            }

            const days = differenceInCalendarDays(endDate, startDate) + 1;

            leaveRequestData.manager_approval = 'Pending';
            leaveRequestData.HR_approval = 'Pending';
            leaveRequestData.director_approval = 'Pending';
            leaveRequestData.status = 'Pending';
            leaveRequestData.raisedDate = new Date();

            if (leaveType.leave_type === 'Sick Leave') {
                leaveRequestData.manager_approval = 'Approved';
                leaveRequestData.HR_approval = 'Approved';
                leaveRequestData.director_approval = 'Approved';
                leaveRequestData.status = 'Approved';
            }

            const leaveRequest = leaveRequestRepository.create({ ...leaveRequestData });
            await leaveRequestRepository.save(leaveRequest);

            if (leaveType.leave_type !== 'Sick Leave') {
                const employee = await userRepository.findOne({ where: { id: leaveRequestData.employee_id } });
                if (employee) await this.notifyApprovers(employee, days);
            }

            return leaveRequest;
        } catch (error) {
            console.error('Error creating leave request:', error);
            throw new Error('Failed to create leave request');
        }
    }

    static async notifyApprovers(employee: Employee, days: number) {
        const roles = ['manager'];
        if (days > 1) roles.push('HR');
        if (days > 5) roles.push('director');
        console.log(`Notify ${roles.join(', ')} for ${employee.fullname}`);
    }

    static async getAllLeaveRequest(employeeIds: string[]) {
        const repo = dataSource.getRepository(LeaveRequest);
        return repo.find({
            where: { employee: { id: In(employeeIds) } },
            relations: ['employee', 'leaveType'],
            order: { raisedDate: 'DESC' }
        });
    }

    static async getLeaveRequest(employeeId: string) {
        console.log("hitttted")
        const repo = dataSource.getRepository(LeaveRequest);
        return repo.find({
            where: { employee_id: employeeId },
            relations: ['employee', 'leaveType'],
            order: { raisedDate: 'DESC' }
        });
    }

    static async getLeaveRequestsForRole(roleId: string) {
        const employeeRepo = dataSource.getRepository(Employee);
        const leaveRepo = dataSource.getRepository(LeaveRequest);
        console.log("hittted")
        const roleEmployee = await employeeRepo.findOne({ where: { id: roleId } });
        if (!roleEmployee) throw new Error('Approver not found');
        console.log()
        const role = roleEmployee.role;
        console.log('Role:', role);

        if (role === 'Manager') {
            const employees = await employeeRepo.find({
                where: { manager: { id: roleEmployee.id } }
            });
            const employeeIds = employees.map(emp => emp.id);
            console.log('Direct reports:', employeeIds);
            if (employeeIds.length === 0) return [];
            return await LeaveRequestService.getAllLeaveRequest(employeeIds);

        } else if (role === 'HR') {
            return await leaveRepo.find({
                where: {
                    manager_approval: 'Approved',
                    HR_approval: 'Pending'
                },
                relations: ['employee', 'leaveType'],
                order: { raisedDate: 'DESC' }
            });

        } else if (role === 'Director') {
            console.log("role", role)
            return await leaveRepo.find({
                where: {
                    manager_approval: 'Approved',
                    HR_approval: 'Approved',
                    director_approval: 'Pending'
                },
                relations: ['employee', 'leaveType'],
                order: { raisedDate: 'DESC' }
            });

        } else if (role === "Employee") {
            return await leaveRepo.find({
                where: {
                    employee_id: roleEmployee.id

                },
                relations: ['employee', 'leaveType'],
                order: { raisedDate: 'DESC' }
            });

        } else {
            throw new Error('Invalid role');
        }
    }


    static async updateLeaveRequest(id: string, updateData: Partial<LeaveRequest>) {
        const repo = dataSource.getRepository(LeaveRequest);
        const balanceRepo = dataSource.getRepository(LeaveBalance);

        const request = await repo.findOne({ where: { id }, relations: ['employee', 'leaveType'] });
        if (!request) throw new Error('Leave request not found');

        const wasPending = request.status === 'Pending';
        const updated = repo.merge(request, updateData);

        const { manager_approval, HR_approval, director_approval } = updated;

        if ([manager_approval, HR_approval, director_approval].includes('Rejected')) {
            updated.status = 'Rejected';
        } else if (
            manager_approval === 'Approved' &&
            HR_approval === 'Approved' &&
            director_approval === 'Approved'
        ) {
            updated.status = 'Approved';


        } else {
            updated.status = 'Pending';
        }

        const saved = await repo.save(updated);



        if (wasPending && saved.status === 'Approved') {
            const days = differenceInCalendarDays(
                new Date(request.endDate),
                new Date(request.startDate)
            ) + 1;

            const balance = await LeaveBalanceController.patchLeaveBalance(
                updated.employee_id,
                saved.leaveType.id,
                days
            );

            if (balance < days) throw new Error('Insufficient leave balance');
        }

        return saved;
    }





    static async deleteLeaveRequest(id: string) {
        const repo = dataSource.getRepository(LeaveRequest);
        const result = await repo.delete(id);
        return result.affected !== 0;
    }
}
