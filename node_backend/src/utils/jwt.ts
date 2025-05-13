const bcrypt= require ('bcryptjs');
import * as jwt from 'jsonwebtoken';
import { dataSource } from '../../db/connection'; 
import { Employee } from '../userModule/userEntity'; 
import { promises } from 'dns';

export async function  generateJwt(userData:Employee){

    const token = jwt.sign(
        {userData},
        process.env.JWT_SECRET!, 
        { expiresIn: '1h' }
    );

    console.log(token+"==============================")
    return token;
}

