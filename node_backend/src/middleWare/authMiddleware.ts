const bcrypt= require ('bcryptjs');
import * as jwt from 'jsonwebtoken';
import { dataSource } from '../../db/connection'; // assuming this is where your TypeORM dataSource is configured
import { Employee } from '../userModule/userEntity'; // assuming you have an Employee entity
import { promises } from 'dns';
import { UserController } from '../userModule/userController';
import { ResponseToolkit } from 'hapi';
import { generateJwt } from '../utils/jwt';

export async function handleToken(req: any) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token missing or invalid format');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;

    // Token is valid and not expired
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      throw new Error('Token expired. Please log in again.');
    }

    throw new Error('Invalid token.');
  }
}




export async function login(email: string, password: string){
    const employeeRepo = dataSource.getRepository(Employee);
  
    const user = await employeeRepo.findOneBy({ email });
  console.log("user"+user)
    if (!user) {
      throw new Error('User not found');
    }
  
    const isPasswordValid = password==user.password;
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    const role=user.role
  
    const token = await generateJwt(user)
    console.log("generated"+token)
    return {token,role};
  }
  