import { Request, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import { LeaveBalanceService, LeaveBalanceData } from './leaveBalanceServices';
import { LeaveBalance } from './leaveBalanceEntity';
import * as Jwt from 'jsonwebtoken';
import { UserService } from '../userModule/userServices';
import { dataSource } from '../../db/connection';
interface DecodedToken extends Jwt.JwtPayload {
  email: string; // The token contains an 'email' property
}
export class LeaveBalanceController {
// CREATE LEAVE BALANCE
static async createLeaveBalance(request: Request, h: ResponseToolkit) {
  console.log("hitted");

  const authHeader = request.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return h.response({ error: 'No token provided' }).code(401);
  }

  let decoded: DecodedToken;
  try {
    decoded = Jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
  } catch (err) {
    return h.response({ error: 'Invalid token' }).code(401);
  }

  console.log('Decoded Email:', decoded.userData.email);

  const employee = await UserService.getEmployee(decoded.userData.email);
  if (!employee) {
    return h.response({ error: 'Employee not found' }).code(404);
  }

  const leaveBalanceData = request.payload as LeaveBalanceData;
  leaveBalanceData.employee_id = employee.id; // ✅ Set employee ID

  console.log("Leave Balance Payload:", leaveBalanceData);

  try {
    const leaveBalance = await LeaveBalanceService.createLeaveBalance(leaveBalanceData);
    return h.response({ message: 'Leave request created', leaveBalance }).code(201);
  } catch (error) {
    console.error('Error:', error);
    return h.response({ error: 'Failed to create leave request' }).code(500);
  }
}


  //GET LEAVE REQUEST=======================================================================================================================================


  static async getLeaveBalance(request: Request, h: ResponseToolkit) {
    try {
      const token = request.state.auth_token;
      if (!token) {
        return h.response({ error: 'No token provided' }).code(401);
      }
      const decoded = Jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
      console.log('Decoded Email:', decoded.userData.id);
      const userId = decoded.userData.id

      const employee = await UserService.getEmployee(decoded.userData.email)
      console.log("employeeeeee//", employee.id)
      if (employee) {
        const leaveBalances = await LeaveBalanceService.getAllLeaveBalance(employee.id);

        return h.response(leaveBalances).code(200);
      }
    } catch (error) {
      console.error('Error fetching leaveBalances:', error);
      return h.response({ error: 'Failed to fetch leaveBalances' }).code(500);
    }
  }



  //UPDATE========================================================================================================================================

  static async updateLeaveBalance(request: Request, h: ResponseToolkit) {
    const id = request.params.id;
    const updateData = request.payload as Partial<LeaveBalance>;

    try {
      const updatedLeaveBalance = await LeaveBalanceService.updateLeaveBalance(id, updateData);

      if (!updatedLeaveBalance) {
        return h.response({ error: 'Leave balance not found' }).code(404);
      }

      return h.response({ message: 'Leave balance updated', leaveBalance: updatedLeaveBalance }).code(200);
    } catch (error) {
      console.error('Error updating leave balance:', error);
      return h.response({ error: 'Failed to update leave balance' }).code(500);
    }
  } 
  
  static async  patchLeaveBalance(employeeId: string, leaveTypeId: number,daysTaken : number) {
  
    const balanceRepo =dataSource.getRepository(LeaveBalance);
    const balance = await balanceRepo.findOne({
      where: {
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
      },
    });
  
    if (!balance) {
      throw new Error('Leave balance record not found');
    }
  console.log(daysTaken)
    balance.remaining_leave -= daysTaken;
    balance.used_leave = daysTaken;
  
    await balanceRepo.save(balance);
    console.log(`✅ Leave balance updated: -${daysTaken} days`);
    return balance.remaining_leave
  }
  

  //DELETE========================================================================================================================================


  static async deleteLeaveBalance(request: Request, h: ResponseToolkit) {
    const id = request.params.id;

    try {
      const deleted = await LeaveBalanceService.deleteLeaveBalance(id);

      if (!deleted) {
        return h.response({ error: 'Leave balance not found' }).code(404);
      }

      return h.response({ message: 'Leave balance deleted successfully' }).code(200);
    } catch (error) {
      console.error('Error deleting leave balance:', error);
      return h.response({ error: 'Failed to delete leave balance' }).code(500);
    }
  }
}

//ROUTES==========================================================================================================================================
export const LeaveBalanceRoute: ServerRoute[] = [
  {
    method: 'POST',
    path: '/leaveBalance',
    handler: LeaveBalanceController.createLeaveBalance
  },

  {
    method: 'GET',
    path: '/leaveBalance',
    handler: LeaveBalanceController.getLeaveBalance
  },

  {
    method: 'PUT',
    path: '/leaveBalance/{id}',
    handler: LeaveBalanceController.updateLeaveBalance,
  },
  {
    method: 'PATCH',
    path: '/leaveBalance',
    handler: LeaveBalanceController.patchLeaveBalance,
  },

  {
    method: 'DELETE',
    path: '/leaveBalance/{id}',
    handler: LeaveBalanceController.deleteLeaveBalance,
  }
  //crud
]