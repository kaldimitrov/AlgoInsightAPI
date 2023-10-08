import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm"

export class CreateUsersTable1696773908810 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "users",
            columns: [
                { name: "id", type: "int", isPrimary: true, isGenerated: true, generationStrategy: "increment" },
                { name: "first_name", type: "varchar" },
                { name: "last_name", type: "varchar" },
                { name: "email", type: "varchar", isUnique: true },
                { name: "hashed_password", type: "varchar" },
                { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
                { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
            ]
        }), true);

        await queryRunner.createIndex("users", new TableIndex({
            name: "unique_users_email",
            columnNames: ["email"],
            isUnique: true,
        }));
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
