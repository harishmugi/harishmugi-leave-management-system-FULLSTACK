import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany
  } from "typeorm";
  import { LeaveRequest } from "../leaveRequestModule/leaveRequestEntity";
  
  @Entity()
  export class Employee {
    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @Column()
    fullname: string;
  
    @Column()
    email: string;
  
    @Column()
    password: string;
  
    @Column({
      type: 'enum',
      enum: ['Employee', 'Manager', 'HR', 'Director'],
      default: 'Employee'
    })
    role: 'Employee' | 'Manager' | 'HR' | 'Director';
  
    // ✅ Self-referencing manager relationship
    @ManyToOne(() => Employee, employee => employee.subordinates, { nullable: true })
    @JoinColumn({ name: 'manager_id' })
    manager?: Employee;
  
    @OneToMany(() => Employee, employee => employee.manager)
    subordinates?: Employee[];
  
    @ManyToOne(() => Employee, { nullable: true })
    @JoinColumn({ name: "hr_id" })
    HR?: Employee;
  
    @ManyToOne(() => Employee, { nullable: true })
    @JoinColumn({ name: "director_id" })
    director?: Employee;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  
    @OneToMany(() => LeaveRequest, leaveRequest => leaveRequest.employee)
    leaveRequests: LeaveRequest[];
  }
  