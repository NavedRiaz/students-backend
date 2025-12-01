import { StudentRefactor1764607640962 } from 'src/migrations/1764607640962-StudentRefactor';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'pass123',
  database: 'postgres',
  entities: [],
  migrations: [StudentRefactor1764607640962],
});

// Running migratoins
// npx typeorm migration:create src/migrations/{name of the file}

// NOTE: you must build your nestjs project so as to get the dist output before a migration can run
