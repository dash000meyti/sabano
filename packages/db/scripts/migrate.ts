import { runMigrations } from '../src/migrate';
import { DATABASE_PATH } from '../src/paths';

runMigrations();
console.log(`Migrations applied to ${DATABASE_PATH}`);
