import { Resend } from "resend";

type SendEmailOptions = { to: string | string[]; subject: string; html: string; from?: string; };

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

export async function sendEmail({ to, subject, html, from = "onboarding@resend.dev", }: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  const resend = new Resend(apiKey);
  return resend.emails.send({ from, to, subject, html });
}

export async function sendWelcomeEmail(to: string, name: string) {
  const safeName = escapeHtml(name);
  return sendEmail({
    to,
    subject: "Welcome to Nazarify",
    html: `<h2>Welcome to Nazarify, ${safeName}!</h2><p>Your account has been created successfully.</p>`,
  });
}

export async function sendBookingConfirmationEmail(to: string, name: string, title: string) {
  const safeName = escapeHtml(name);
  const safeTitle = escapeHtml(title);
  return sendEmail({
    to,
    subject: "Your Nazarify service request was received",
    html: `<h2>Request received</h2><p>Hello ${safeName},</p><p>We received your service request: <strong>${safeTitle}</strong>.</p><p>Our team will review it and get back to you shortly.</p>`,
  });
}
