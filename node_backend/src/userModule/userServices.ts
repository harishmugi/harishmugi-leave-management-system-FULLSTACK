import { dataSource } from '../../db/connection';
import { Employee } from './userEntity';
import { generateJwt } from '../utils/jwt';
import { LeaveBalanceService } from '../leaveBalanceModule/leaveBalanceServices';

export interface EmployeeData {
  email: string;
  fullname: string;
  password: string;
  role: 'Employee' | 'Manager' | 'HR' | 'Director';

  managerEmail?: string;
  hrEmail?: string;
  directorEmail?: string;

  created_at: string;
  updated_at: string;
}

export class UserService {
  static async createEmployee(employeeData: EmployeeData) {
    const employeeRepository = dataSource.getRepository(Employee);

    try {
      const managerRepo = dataSource.getRepository(Employee);

      // 1. Resolve manager
      let manager: Employee | null = null;
      if (employeeData.managerEmail) {
        manager = await managerRepo.findOneBy({ email: employeeData.managerEmail });
        if (!manager) throw new Error('Manager with the provided email does not exist.');
      }

      // 2. Resolve HR
      let HR: Employee | null = null;
      if (employeeData.hrEmail) {
        HR = await managerRepo.findOneBy({ email: employeeData.hrEmail });
        if (!HR) throw new Error('HR with the provided email does not exist.');
      }

      // 3. Resolve Director
      let director: Employee | null = null;
      if (employeeData.directorEmail) {
        director = await managerRepo.findOneBy({ email: employeeData.directorEmail });
        if (!director) throw new Error('Director with the provided email does not exist.');
      }

      // 4. Create employee with relationships
      const employee = employeeRepository.create({
        fullname: employeeData.fullname,
        email: employeeData.email,
        password: employeeData.password,
        role: employeeData.role,
        manager: manager || null,
        HR: HR || null,
        director: director || null,
        created_at: new Date(employeeData.created_at),
        updated_at: new Date(employeeData.updated_at),
      });

      // 5. Save to DB
      await employeeRepository.save(employee);

      // 6. Initialize leave balances
      await LeaveBalanceService.initializeLeaveBalancesForEmployee(employee.id);

      // 7. Generate and return token
      return generateJwt(employee);

    } catch (error) {
      console.error('Error creating employee:', error);
      throw new Error(error.message || 'Failed to create employee!');
    }
  }

  static async getAllEmployees(): Promise<Employee[]> {
    try {
      const employeeRepository = dataSource.getRepository(Employee);
      return await employeeRepository.find({
        relations: ['manager', 'HR', 'director'],
      });
    } catch (error) {
      console.error('Error getting employees:', error);
      throw new Error('Failed to get employees!');
    }
  }

  static async getEmployee(email: string): Promise<Employee | null> {
    try {
      const employeeRepository = dataSource.getRepository(Employee);
      return await employeeRepository.findOne({
        where: { email },
        relations: ['manager', 'HR', 'director'],
      });
    } catch (error) {
      console.error('Error getting employee:', error);
      throw new Error('Failed to get employee!');
    }
  }

  static async updateEmployee(id: string, updateData: Partial<Employee>): Promise<Employee | null> {
    const employeeRepository = dataSource.getRepository(Employee);
    const employee = await employeeRepository.findOneBy({ id });
    if (!employee) return null;

    try {
      const updated = employeeRepository.merge(employee, updateData);
      return await employeeRepository.save(updated);
    } catch (error) {
      console.error('Error updating employee:', error);
      throw new Error('Failed to update employee!');
    }
  }

  static async deleteEmployee(id: string): Promise<boolean> {
    const employeeRepository = dataSource.getRepository(Employee);
    try {
      const result = await employeeRepository.delete(id);
      return result.affected !== 0;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw new Error('Failed to delete employee!');
    }
  }
}
