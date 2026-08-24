import "server-only";

import nodemailer from "nodemailer";

function requiredEmailEnvironment(
  name: "EMAIL_SERVER_USER" | "EMAIL_SERVER_PASSWORD" | "EMAIL_FROM",
) {
  const value = process.env[name]?.trim();
  if (!value)
    throw new Error(`${name} must be configured before sending email.`);
  return value;
}

function transporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: requiredEmailEnvironment("EMAIL_SERVER_USER"),
      pass: requiredEmailEnvironment("EMAIL_SERVER_PASSWORD"),
    },
  });
}

export async function sendAuthEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  await transporter().sendMail({
    from: requiredEmailEnvironment("EMAIL_FROM"),
    to,
    subject,
    text,
  });
}

export function sendPasswordResetEmail(to: string, url: string) {
  return sendAuthEmail({
    to,
    subject: "Reset your K-Coffee password",
    text: `We received a request to reset your K-Coffee password. Use this link to choose a new password:\n\n${url}\n\nIf you did not request this, you can safely ignore this email.`,
  });
}

export function sendVerificationEmail(to: string, url: string) {
  return sendAuthEmail({
    to,
    subject: "Verify your K-Coffee email address",
    text: `Welcome to K-Coffee. Verify your email address using this link:\n\n${url}\n\nIf you did not create an account, you can safely ignore this email.`,
  });
}

export function sendOrderNotificationEmail(to: string, subject: string, text: string) {
  return sendAuthEmail({ to, subject, text });
}

export function sendChangeEmailConfirmationEmail(to: string, newEmail: string, url: string) {
  return sendAuthEmail({
    to,
    subject: "Confirm your K-Coffee email change",
    text: `We received a request to change your K-Coffee sign-in email to ${newEmail}. Confirm this change using the link below:\n\n${url}\n\nIf you did not request this change, you can safely ignore this email.`,
  });
}
