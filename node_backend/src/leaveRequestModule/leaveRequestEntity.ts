import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { LeaveType } from "../leaveTypeModule/leaveTypeEntity";
import { Employee } from "../userModule/userEntity";

@Entity()
export class LeaveRequest {
  static find(arg0: { status: string; manager_approval: string; }) {
    throw new Error('Method not implemented.');
  }
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  employee_id: string;

  @ManyToOne(() => Employee, (employee) => employee.leaveRequests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: "employee_id" })
  employee: Employee;

  @Column({ nullable: true })
  leave_type_id: number | null;

  @ManyToOne(() => LeaveType, (leaveType) => leaveType.leaveRequests, {
    nullable: true,
  })
  @JoinColumn({ name: "leave_type_id" })
  leaveType: LeaveType | null;

  @Column()
  reason: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({
    type: 'enum',
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending',
  })
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

  @Column({
    type: 'enum',
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  })
  manager_approval: 'Pending' | 'Approved' | 'Rejected';

  @Column({
    type: 'enum',
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  })
  HR_approval: 'Pending' | 'Approved' | 'Rejected';

  @Column({
    type: 'enum',
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  })
  director_approval: 'Pending' | 'Approved' | 'Rejected';

  @CreateDateColumn()
  raisedDate: Date;

  @Column({
    type: 'enum',
    enum: ['manager', 'hr', 'director'],
    nullable: true, // You can make it nullable if not every request will have it
  })
  approvalLevel: 'manager' | 'hr' | 'director' | null;
}
