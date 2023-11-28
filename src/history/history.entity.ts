import { ApiHideProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import EntityHelper from 'src/helpers/EntityHelper';
import { ExecutionStatus } from './enums/executionStatus';
import { ExecutionStats } from './dto/stats.dto';
import { User } from 'src/user/user.entity';

@Entity('execution_history')
export class History {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  execution_time: number | null;

  @Column('jsonb', { array: true, nullable: true })
  stats: ExecutionStats[] | null;

  @Column({
    type: 'enum',
    enum: ExecutionStatus,
    default: ExecutionStatus.PENDING,
  })
  status: ExecutionStatus;

  @Column({ nullable: true })
  start_time: number | null;

  @Column({ nullable: true })
  end_time: number | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column()
  user_id: number;

  constructor(partial: Partial<History>) {
    Object.assign(this, partial);
  }
}
