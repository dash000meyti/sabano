import { runMigrations } from '../src/migrate';
import { seedDatabase } from '../src/seed';

const force = process.argv.includes('--force');
runMigrations();
const done = seedDatabase({ force });
console.log(done ? 'Database seeded.' : 'Database already has content (use --force to reseed).');
