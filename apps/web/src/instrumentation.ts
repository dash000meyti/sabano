/** Runs once when the server starts. The work itself is Node-only (see server-start.ts). */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startServer } = await import('./server-start');
    await startServer();
  }
}
