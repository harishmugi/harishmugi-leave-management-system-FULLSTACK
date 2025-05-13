import { DataSource } from "typeorm";
import { Employee } from "../src/userModule/userEntity";
import { LeaveRequest } from "../src/leaveRequestModule/leaveRequestEntity";
import {LeaveType} from '../src/leaveTypeModule/leaveTypeEntity'; 
import {LeaveBalance} from '../src/leaveBalanceModule/leaveBalanceEntity'

const dataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "Mopimapla@143",
    database: "leave_data",
    entities: [Employee,LeaveRequest,LeaveType,LeaveBalance],
    synchronize: true,
    driver: require("mysql2")
})




dataSource.initialize().then(() => {
    console.log("databasde run aaguthu !")
}).catch((err) => {
    console.log("erroe adikkuthu : " + err)
})


export { dataSource }