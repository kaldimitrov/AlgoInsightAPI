import { Languages } from 'src/docker/enums/languages';
import { ExecutionStatus } from 'src/history/enums/executionStatus';
import {MigrationInterface, QueryRunner, Table} from 'typeorm';

export class CreateExecutionHistoryTable1701712578051 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'execution_history',
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true,
          generationStrategy: 'uuid',
          default: 'uuid_generate_v4()',
        },
        {
          name: 'execution_time',
          type: 'int',
          isNullable: true,
        },
        {
          name: 'stats',
          type: 'jsonb',
          default: "'[]'::jsonb",
        },
        {
          name: 'max_memory',
          type: 'decimal',
          isNullable: true,
        },
        {
          name: 'max_cpu',
          type: 'decimal',
          isNullable: true,
        },
        {
          name: 'status',
          type: 'enum',
          enum: Object.values(ExecutionStatus),
          default: `'${ExecutionStatus.PENDING}'`,
        },
        {
          name: 'language',
          type: 'enum',
          enum: Object.values(Languages),
        },
        {
          name: 'logs',
          type: 'text',
          default: '\'\''
        },
        {
          name: 'start_time',
          type: 'bigint',
          isNullable: true,
        },
        {
          name: 'end_time',
          type: 'bigint',
          isNullable: true,
        },
        {
          name: 'user_id',
          type: 'int',
        },
        {
          name: 'created_at',
          type: 'timestamp',
          default: 'now()',
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          default: 'now()',
        },
      ],
      foreignKeys: [
        {
          columnNames: ['user_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        },
      ],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }
}
