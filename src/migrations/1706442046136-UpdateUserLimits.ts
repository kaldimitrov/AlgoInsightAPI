import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class UpdateUserLimits1706442046136 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'max_code_length');
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'max_files',
                type: 'int',
                default: 50,
            }),
        );

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
