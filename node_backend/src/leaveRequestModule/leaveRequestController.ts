import { Request, ResponseToolkit } from '@hapi/hapi';
import * as Jwt from 'jsonwebtoken';
import Joi = require("joi")
import { LeaveRequestService } from './leaveRequestServices';

interface DecodedToken {
  userData: {
    id: string;
    role?: string;
  };
}

interface LeaveRequestPayload {
  startDate: string;
  endDate: string;
  reason: string;
  leave_type_id: number;
}

interface UpdateApprovalPayload {
  id: string;
  approved: boolean;
}

export class LeaveRequestController {
  private static async getDecodedToken(request: Request): Promise<DecodedToken> {
    const token = request.state.auth_token;
    if (!token) throw new Error('No token provided');

    try {
      return Jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
    } catch (err) {
      console.error('JWT verification failed:', err);
      throw new Error('Unauthorized');
    }
  }

  static async createLeaveRequest(request: Request, h: ResponseToolkit) {
    try {
      const decoded = await LeaveRequestController.getDecodedToken(request);
      const leaveData = request.payload as LeaveRequestPayload;

      leaveData['employee_id'] = decoded.userData.id;

      const leaveRequest = await LeaveRequestService.createLeaveRequest(leaveData);
      return h.response({ message: 'Leave request created', leaveRequest }).code(201);
    } catch (error) {
      console.error('Error creating leave request:', error);
      return h.response({ error: 'Failed to create leave request' }).code(
        error.message === 'Unauthorized' ? 401 : 500
      );
    }
  }

  static async getLeaveRequestsByRole(request: Request, h: ResponseToolkit) {
    try {
      const decoded = await LeaveRequestController.getDecodedToken(request);
      const leaveRequests = await LeaveRequestService.getLeaveRequestsForRole(decoded.userData.id);
      return h.response(leaveRequests).code(200);
    } catch (error) {
      console.error('Error fetching leave requests by role:', error);
      return h.response({ error: 'Failed to fetch leave requests' }).code(
        error.message === 'Unauthorized' ? 401 : 500
      );
    }
  }

  static async getLeaveRequestByEmployee(request: Request, h: ResponseToolkit) {
    try {
      const decoded = await LeaveRequestController.getDecodedToken(request);
      const leaveRequests = await LeaveRequestService.getLeaveRequestsForRole(decoded.userData.id);
      return h.response(leaveRequests).code(200);
    } catch (error) {
      console.error('Error fetching employee leave requests:', error);
      return h.response({ error: 'Failed to fetch employee leave requests' }).code(
        error.message === 'Unauthorized' ? 401 : 500
      );
    }
  }

  static async updateLeaveRequest(request: Request, h: ResponseToolkit) {
    try {
      const leaveId = request.params.id;
      const { id, approved } = request.payload as UpdateApprovalPayload;
      console.log(id)
      if (!['Manager', 'Hr', 'Director'].includes(id)) {
        return h.response({ error: 'Invalid approver role' }).code(400);
      }

      const approval = approved ? 'Approved' : 'Rejected';
      const updateData: Partial<any> = {};

      switch (id) {
        case 'Manager':
          updateData.manager_approval = approval;
          break;
        case 'Hr':
          updateData.HR_approval = approval;
          break;
        case 'Director':
          updateData.director_approval = approval;
          break;
      }

      const updatedLeave = await LeaveRequestService.updateLeaveRequest(leaveId, updateData);
      return h.response(updatedLeave).code(200);
    } catch (error) {
      console.error('Error updating leave request:', error);
      return h.response({ error: 'Failed to update leave request' }).code(500);
    }
  }

  static async deleteLeaveRequest(request: Request, h: ResponseToolkit) {
    try {
      const id = request.params.id;
      const deleted = await LeaveRequestService.deleteLeaveRequest(id);

      if (!deleted) {
        return h.response({ error: 'Leave request not found' }).code(404);
      }

      return h.response({ message: 'Leave request deleted' }).code(200);
    } catch (error) {
      console.error('Error deleting leave request:', error);
      return h.response({ error: 'Failed to delete leave request' }).code(500);
    }
  }
}
import { ServerRoute } from '@hapi/hapi';

export const LeaveRequestRoute: ServerRoute[] = [
  {
    method: 'POST',
    path: '/leaveRequest',
    handler: LeaveRequestController.createLeaveRequest,
    options: {
      validate: {
        payload: Joi.object({
          startDate: Joi.string().required(),
          endDate: Joi.string().required(),
          reason: Joi.string().required(),
          leave_type_id: Joi.number().required(), // <-- updated
        }),
        failAction: (request, h, err) => {
          console.error('Validation error:', err?.message);
          throw err;
        },
      },
    },
  },
  {
    method: 'GET',
    path: '/leaveRequests/approver',
    handler: LeaveRequestController.getLeaveRequestsByRole,
  },
  {
    method: 'GET',
    path: '/leaveRequests',
    handler: LeaveRequestController.getLeaveRequestByEmployee,
  },
  {
    method: 'PATCH',
    path: '/leaveRequest/{id}',
    handler: LeaveRequestController.updateLeaveRequest,
    options: {
      validate: {
        payload: Joi.object({
          id: Joi.string().valid('Manager', 'Hr', 'Director').required(),
          approved: Joi.boolean().required(),
        }),
        failAction: (request, h, err) => {
          console.error('Validation error:', err?.message);
          throw err;
        },
      },
    },
  },
  {
    method: 'DELETE',
    path: '/leaveRequest/{id}',
    handler: LeaveRequestController.deleteLeaveRequest,
  },
];
