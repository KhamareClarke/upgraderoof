import nodemailer from 'nodemailer';

export type MailConfig = {
  transporter: nodemailer.Transporter;
  from: string;
  to: string;
};

/**
 * Gmail SMTP via Nodemailer. Use a Google **App Password**, not your normal
 * Gmail password (Account → Security → 2-Step Verification → App passwords).
 */
export function getMailConfig(): MailConfig {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s/g, '');

  if (!user || !pass) {
    throw new Error(
      'Missing SMTP_USER or SMTP_PASS. Add them to your environment (e.g. .env.local).'
    );
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const from = process.env.EMAIL_FROM?.trim() || user;
  const to = process.env.EMAIL_TO?.trim() || 'upgraderoofs@yahoo.com';

  return { transporter, from, to };
}

/** Short message for JSON responses — details stay in server logs */
export function mailErrorResponseMessage(error: unknown): string {
  const err = error as { code?: string; message?: string };
  if (err?.code === 'EAUTH') {
    return 'We could not deliver your message by email. Please call us or try again later.';
  }
  if (
    typeof err?.message === 'string' &&
    (err.message.includes('Missing SMTP_USER') ||
      err.message.includes('Missing SMTP_PASS'))
  ) {
    return 'This form is temporarily unavailable. Please contact us by phone.';
  }
  return 'Failed to send your message. Please try again later or contact us by phone.';
}
