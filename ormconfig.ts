import { DataSource } from 'typeorm';
const SnakeNamingStrategy = require('typeorm-naming-strategies').SnakeNamingStrategy;

export const connectionSource = new DataSource({
  migrationsTableName: 'migrations',
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'DB_USER',
  password: 'DB_PASSWORD',
  database: 'DB_NAME',
  logging: false,
  synchronize: false,
  name: 'default',
  entities: ['dist/src/**/**.entity.js'],
  migrations: ['dist/src/migrations/*.js'],
  namingStrategy: new SnakeNamingStrategy(),
});
