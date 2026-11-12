import { createInterface } from 'node:readline/promises';
import { runMigrations } from '../src/migrate';
import { createUser } from '../src/users';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const email = process.env.ADMIN_EMAIL ?? (await rl.question('Email: '));
const name = process.env.ADMIN_NAME ?? ((await rl.question('Name (مدیر سایت): ')) || 'مدیر سایت');
const password = process.env.ADMIN_PASSWORD ?? (await rl.question('Password (min 10 chars): '));
rl.close();

runMigrations();
const user = await createUser({ email, name, password, role: 'admin' });
console.log(`Admin ${user.email} created.`);
