const nodemailer = require("nodemailer");

// Stub-friendly mailer: works with any SMTP provider (Gmail, Mailtrap, SendGrid SMTP, etc.)
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_HOST) {
    console.log(`[email skipped - no SMTP configured] To: ${to} | Subject: ${subject}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "StyleHub <no-reply@stylehub.com>",
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
