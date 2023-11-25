import { ApiHideProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Unique } from 'typeorm';
import { Roles } from './enums/roles';
import EntityHelper from 'src/helpers/EntityHelper';

@Entity('users')
@Unique('unique_users_email', ['email'])
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @ApiHideProperty()
  @Column()
  hashedPassword: string;

  @Column({
    type: 'enum',
    enum: Roles,
    default: Roles.USER,
  })
  role: Roles;

  @Column('decimal', EntityHelper.getDecimalTransformer())
  max_memory_limit: number = 512.0;

  @Column({ default: 2 })
  execution_concurrency: number = 2;

  @Column({ default: 10000 })
  max_code_length: number = 10000;

  @Column({ default: 60000 })
  max_runtime_duration: number = 60000;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
