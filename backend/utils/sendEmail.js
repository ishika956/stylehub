// HTTP-API mailer via Brevo — works on hosts that block SMTP (e.g. Render free tier)
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.BREVO_API_KEY) {
    console.log(`[email skipped - no BREVO_API_KEY] To: ${to} | Subject: ${subject}`);
    return;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: process.env.EMAIL_FROM_NAME || "StyleHub",
        email: process.env.EMAIL_FROM, // must be a verified sender in Brevo
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("[brevo error]", res.status, detail);
    throw new Error("Failed to send email");
  }

  return res.json();
};

module.exports = sendEmail;