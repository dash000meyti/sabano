import 'server-only';

/** Sends a plain-text notification if SMTP is configured; silently no-ops otherwise. */
export async function notify(subject: string, text: string): Promise<void> {
  const host = process.env.SMTP_HOST;
  const to = process.env.NOTIFY_EMAIL;
  if (!host || !to) return;
  try {
    const nodemailer = await import('nodemailer');
    const transport = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    await transport.sendMail({ from: process.env.SMTP_FROM ?? process.env.SMTP_USER, to, subject, text });
  } catch (err) {
    console.error('[sabano] Failed to send notification email', err);
  }
}
