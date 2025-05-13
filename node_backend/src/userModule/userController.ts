import { Request, ResponseToolkit, ServerRoute } from '@hapi/hapi';
import { UserService } from './userServices';
import { EmployeeData } from './userServices';
import { UserValidator } from './userValidator';
import * as Jwt from 'jsonwebtoken';
import { login } from '../middleWare/authMiddleware';

interface DecodedToken extends Jwt.JwtPayload {
  email: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export class UserController {
  // CREATE EMPLOYEE
  static async createEmployee(request: Request, h: ResponseToolkit) {
    const userData = request.payload as EmployeeData;
    try {
      await UserValidator.checkUserAlreadyExist(userData.email);
      const token = await UserService.createEmployee(userData);

      return h.response({
        message: 'Employee created successfully',
        token,
      }).code(201);
    } catch (error: any) {
      console.error('Error:', error.message);
      return h.response({ error: error.message || 'Failed to create employee' }).code(400);
    }
  }

  // LOGIN HANDLER
  static async login_handler(req: Request, h: ResponseToolkit) {
    const userData = req.payload as LoginPayload;
    try {
      // const user = await UserValidator.isUser(userData.email);
      const token = await login(userData.email, userData.password);

      const response = h.response({ message: 'Login successful', token })
        .state('role', token.role, {
          isHttpOnly: true,
          isSecure: process.env.NODE_ENV === 'production',
          path: '/',
          ttl: 60 * 60 * 1000, // 1 hour
        })
        .state('auth_token', token.token, {
          isHttpOnly: true,
          isSecure: process.env.NODE_ENV === 'production',
          path: '/',
          ttl: 60 * 60 * 1000, // 1 hour
        });

      return response.code(200);
    } catch (error: any) {
      console.error('Error:', error.message);
      return h.response({ error: error.message || 'Failed to login' }).code(401);
    }
  }

  // GET EMPLOYEES
  static async getEmployees(request: Request, h: ResponseToolkit) {
    try {
      const employees = await UserService.getAllEmployees();
      return h.response(employees).code(200);
    } catch (error) {
      console.error('Error fetching employees:', error);
      return h.response({ error: 'Failed to fetch employees' }).code(500);
    }
  }

  // GET EMPLOYEE
  static async getEmployee(req: Request, h: ResponseToolkit) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) {
        return h.response({ error: 'No token provided' }).code(401);
      }
      const decoded = Jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
      const employee = await UserService.getEmployee(decoded.email);

      if (!employee) {
        return h.response({ error: 'Employee not found' }).code(404);
      }

      return h.response({ message: 'Employee found', employee }).code(200);
    } catch (error) {
      console.error('Error fetching employee:', error);
      return h.response({ error: 'Failed to fetch employee' }).code(500);
    }
  }

  // UPDATE EMPLOYEE
  static async updateEmployee(request: Request, h: ResponseToolkit) {
    const id = request.params.id;
    const updateData = request.payload as Partial<Employee>;

    try {
      const updatedEmployee = await UserService.updateEmployee(id, updateData);

      if (!updatedEmployee) {
        return h.response({ error: 'Employee not found' }).code(404);
      }

      return h.response({ message: 'Employee updated', employee: updatedEmployee }).code(200);
    } catch (error) {
      console.error('Error updating employee:', error);
      return h.response({ error: 'Failed to update employee' }).code(500);
    }
  }

  // DELETE EMPLOYEE
  static async deleteEmployee(request: Request, h: ResponseToolkit) {
    const id = request.params.id;

    try {
      const deleted = await UserService.deleteEmployee(id);

      if (!deleted) {
        return h.response({ error: 'Employee not found' }).code(404);
      }

      return h.response({ message: 'Employee deleted successfully' }).code(200);
    } catch (error) {
      console.error('Error deleting employee:', error);
      return h.response({ error: 'Failed to delete employee' }).code(500);
    }
  }
}
import { Employee } from './userEntity';

export const userRoute: ServerRoute[] = [
  {
    method: 'POST',
    path: '/employees',
    handler: UserController.createEmployee,
  },
  {
    method: 'POST',
    path: '/login',
    handler: UserController.login_handler,
  },
  {
    method: 'GET',
    path: '/employees',
    handler: UserController.getEmployees,
  },
  {
    method: 'GET',
    path: '/employee',
    handler: UserController.getEmployee,
  },
  {
    method: 'PUT',
    path: '/employees/{id}',
    handler: UserController.updateEmployee,
  },
  {
    method: 'DELETE',
    path: '/employees/{id}',
    handler: UserController.deleteEmployee,
  },
];
