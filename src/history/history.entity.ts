import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import EntityHelper from 'src/helpers/EntityHelper';
import { ExecutionStatus } from './enums/executionStatus';
import { ExecutionStats } from './dto/stats.dto';
import { User } from 'src/user/user.entity';

@Entity('execution_history')
export class History {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  execution_time?: number;

  @Column({ type: 'jsonb', array: true, nullable: true })
  stats?: ExecutionStats[];

  @Column({ type: 'decimal', array: true, nullable: true, ...EntityHelper.getDecimalTransformer() })
  max_memory?: number;

  @Column({ type: 'decimal', array: true, nullable: true, ...EntityHelper.getDecimalTransformer() })
  max_cpu?: number;

  @Column({
    type: 'enum',
    enum: ExecutionStatus,
    default: ExecutionStatus.PENDING,
  })
  status: ExecutionStatus;

  @Column({ nullable: true })
  start_time?: number;

  @Column({ nullable: true })
  end_time?: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column()
  user_id: number;

  constructor(partial: Partial<History>) {
    Object.assign(this, partial);
  }
}
