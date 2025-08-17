import nodemailer from 'nodemailer';

export default async function sendMail({ to, subject, html, text }) {
  let transporter;

  // Use real SMTP if provided
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  } else {
    // Dev: auto-create an Ethereal account
    const test = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: test.smtp.host, port: test.smtp.port, secure: test.smtp.secure,
      auth: { user: test.user, pass: test.pass }
    });
  }

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || 'BookBuddy <no-reply@bookbuddy.local>',
    to, subject, html, text
  });

  // In dev, log preview URL
  if (nodemailer.getTestMessageUrl) {
    const url = nodemailer.getTestMessageUrl(info);
    if (url) console.log('✉️  Preview email:', url);
  }
}