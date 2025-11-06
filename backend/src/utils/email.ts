import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

type PasswordResetPayload = {
  to: string;
  token: string;
  userName?: string;
};

type TransportOptions = {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
};

const transportConfig: TransportOptions = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined,
  secure: process.env.SMTP_SECURE === "true",
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
};

const hasSmtpConfig = Boolean(transportConfig.host && transportConfig.port && transportConfig.user && transportConfig.pass);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: transportConfig.host,
      port: transportConfig.port,
      secure: transportConfig.secure,
      auth: {
        user: transportConfig.user,
        pass: transportConfig.pass,
      },
    })
  : null;

const getResetUrl = (token: string) => {
  const baseUrl = process.env.RESET_PASSWORD_URL || process.env.FRONTEND_URL || "http://localhost:3000/reset-password";
  const url = new URL(baseUrl);
  url.searchParams.set("token", token);
  return url.toString();
};

export async function sendPasswordResetEmail({ to, token, userName }: PasswordResetPayload): Promise<void> {
  const resetUrl = getResetUrl(token);
  const subject = "Reset your password";
  const greeting = userName ? `Hi ${userName},` : "Hello,";
  const text = `${greeting}\n\nWe received a request to reset your password. Use the link below to set a new password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;

  if (!transporter) {
    console.log("[Password Reset] No SMTP configured. Logging reset link for development:");
    console.log(`Recipient: ${to}`);
    console.log(`Reset URL: ${resetUrl}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || transportConfig.user,
    to,
    subject,
    text,
    html: `<p>${greeting}</p><p>We received a request to reset your password. Use the button below to set a new password.</p><p><a href="${resetUrl}">Reset password</a></p><p>If you did not request this, you can safely ignore this email.</p>`
  });
}
