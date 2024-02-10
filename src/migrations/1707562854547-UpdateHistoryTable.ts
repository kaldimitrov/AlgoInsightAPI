import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class UpdateHistoryTable1707562854547 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'execution_history',
            new TableColumn({
                name: "name", 
                type: "varchar" 
            }),
        );

        await queryRunner.addColumn(
            'execution_history',
            new TableColumn({
                name: 'files',
                type: 'jsonb',
                default: "'[]'::jsonb",
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
