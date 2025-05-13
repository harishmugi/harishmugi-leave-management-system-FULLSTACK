import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
  } from "typeorm";
  import { LeaveType } from "../leaveTypeModule/leaveTypeEntity";
  
  @Entity()
  export class LeaveBalance {
    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @Column()
    employee_id: string;
  
    @Column()
    leave_type_id: number;
  
    @ManyToOne(() => LeaveType, leaveType => leaveType.leaveBalances)
    @JoinColumn({ name: "leave_type_id" })
    leaveType: LeaveType;
  
    @Column()
    allocated_leave: number;
  
    @Column()
    used_leave: number;
  
    @Column()
    remaining_leave: number;
  }
  