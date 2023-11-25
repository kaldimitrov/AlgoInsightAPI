import { Roles } from "src/user/enums/roles";
import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class AddLimitsPerUser1700932452714 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'role',
                type: 'enum',
                enum: Object.values(Roles),
                default: `'${Roles.USER}'`,
            }),
        );

        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'max_memory_limit',
                type: 'decimal',
                precision: 12,
                scale: 2,
                default: 512.00,
            }),
        );

        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'execution_concurrency',
                type: 'int',
                default: 2,
            }),
        );

        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'max_code_length',
                type: 'int',
                default: 10000,
            }),
        );

        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'max_runtime_duration',
                type: 'int',
                default: 60000,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
