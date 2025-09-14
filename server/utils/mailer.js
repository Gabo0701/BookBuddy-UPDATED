// Email Service using Nodemailer
// Handles email sending for authentication, notifications, and user communications
// Supports both production SMTP and development testing with Ethereal Email

import nodemailer from 'nodemailer';

/**
 * Send email using configured SMTP transport
 * Automatically switches between production SMTP and development test accounts
 * 
 * @param {Object} emailData - Email configuration object
 * @param {string} emailData.to - Recipient email address
 * @param {string} emailData.subject - Email subject line
 * @param {string} emailData.html - HTML email content
 * @param {string} emailData.text - Plain text email content
 * @returns {Promise<Object>} Email send result information
 */
export default async function sendMail({ to, subject, html, text }) {
  let transporter;

  // Production: Use configured SMTP server (e.g., Mailtrap, SendGrid, etc.)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,                    // SMTP server hostname
      port: Number(process.env.SMTP_PORT || 587),     // SMTP port (587 for TLS)
      secure: false,                                  // Use TLS (not SSL)
      auth: { 
        user: process.env.SMTP_USER,                 // SMTP username
        pass: process.env.SMTP_PASS                  // SMTP password
      }
    });
  } else {
    // Development: Create temporary Ethereal Email account for testing
    // Ethereal provides fake SMTP service for email testing
    const test = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: test.smtp.host,       // Ethereal SMTP host
      port: test.smtp.port,       // Ethereal SMTP port
      secure: test.smtp.secure,   // Ethereal security settings
      auth: { 
        user: test.user,          // Generated test username
        pass: test.pass           // Generated test password
      }
    });
  }

  // Send the email with configured transporter
  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM || 'BookBuddy <no-reply@bookbuddy.local>', // Sender address
    to,       // Recipient address
    subject,  // Email subject
    html,     // HTML email body
    text      // Plain text email body (fallback)
  });

  // Development: Log preview URL for Ethereal Email testing
  // Allows developers to view sent emails in browser
  if (nodemailer.getTestMessageUrl) {
    const url = nodemailer.getTestMessageUrl(info);
    if (url) console.log('✉️  Preview email:', url);
  }
}