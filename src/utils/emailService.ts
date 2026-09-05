import { Resend } from "resend";

type SendEmailOptions = { to: string | string[]; subject: string; html: string; from?: string; };

const escapeHtml = (value: string) => value
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const siteUrl = process.env.USER_FRONTEND_URL || "https://nazarify.vercel.app";
const logoUrl = "https://nazarify.vercel.app/logo.png";

const emailLayout = (content: string, previewText: string) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nazarify</title>
  </head>
  <body style="margin:0; padding:0; background-color:#0f172a; font-family:Arial, Helvetica, sans-serif; color:#172554;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${previewText}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0f172a;">
      <tr>
        <td align="center" style="padding:36px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;">
            <tr>
              <td align="center" style="padding:0 0 24px;">
                <a href="${siteUrl}" style="text-decoration:none;">
                  <img src="${logoUrl}" alt="Nazarify" width="76" height="76" style="display:block; width:76px; height:76px; object-fit:cover; border:4px solid #007bff; border-radius:22px; background-color:#ffffff;">
                </a>
              </td>
            </tr>
            <tr>
              <td style="background-color:#ffffff; border:1px solid #dbe5f0; border-radius:24px; overflow:hidden;">
                <div style="height:6px; background-color:#007bff; line-height:6px; font-size:0;">&nbsp;</div>
                <div style="padding:38px 42px 34px;">${content}</div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:24px 20px 0; color:#94a3b8; font-size:12px; line-height:20px;">
                <p style="margin:0 0 6px; font-weight:bold; color:#cbd5e1;">Nazarify &bull; Build something remarkable</p>
                <p style="margin:0 0 6px;">You received this email because you have an account with Nazarify.</p>
                <p style="margin:0;">&copy; 2026 Nazarify. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const emailButton = (label: string) => `<a href="${siteUrl}" style="display:inline-block; background-color:#007bff; color:#ffffff; padding:14px 24px; border-radius:10px; font-size:14px; font-weight:bold; text-decoration:none;">${label}</a>`;

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
    html: emailLayout(`
      <p style="margin:0 0 12px; color:#007bff; font-size:13px; font-weight:bold; letter-spacing:1px; text-transform:uppercase;">Welcome aboard</p>
      <h1 style="margin:0 0 16px; color:#172554; font-size:30px; line-height:38px;">Welcome to Nazarify, ${safeName}!</h1>
      <p style="margin:0 0 26px; color:#64748b; font-size:16px; line-height:26px;">Your account is ready. Discover services, share your ideas, and turn them into something real with our creative community.</p>
      ${emailButton("Explore Nazarify")}
    `, "Your Nazarify account is ready. Welcome aboard!"),
  });
}

export async function sendBookingConfirmationEmail(to: string, name: string, title: string) {
  const safeName = escapeHtml(name);
  const safeTitle = escapeHtml(title);
  return sendEmail({
    to,
    subject: "Your Nazarify service request was received",
    html: emailLayout(`
      <p style="margin:0 0 12px; color:#007bff; font-size:13px; font-weight:bold; letter-spacing:1px; text-transform:uppercase;">Service request</p>
      <h1 style="margin:0 0 16px; color:#172554; font-size:30px; line-height:38px;">Request received</h1>
      <p style="margin:0 0 22px; color:#64748b; font-size:16px; line-height:26px;">Hello ${safeName}, we have received your request and our team will review it shortly.</p>
      <div style="margin:0 0 28px; padding:18px 20px; background-color:#eff6ff; border:1px solid #bfdbfe; border-radius:14px;">
        <p style="margin:0 0 6px; color:#64748b; font-size:12px; font-weight:bold; letter-spacing:.8px; text-transform:uppercase;">Request title</p>
        <p style="margin:0; color:#172554; font-size:17px; line-height:25px; font-weight:bold;">${safeTitle}</p>
      </div>
      ${emailButton("View Nazarify")}
    `, "Your Nazarify service request has been received."),
  });
}
