// config/email.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('📧 Email Configuration:');
console.log(`   Host: ${process.env.EMAIL_HOST}`);
console.log(`   Port: ${process.env.EMAIL_PORT}`);
console.log(`   User: ${process.env.EMAIL_USER}`);

// Clean password (remove spaces)
const emailPass = process.env.EMAIL_PASS?.replace(/\s/g, '') || '';

// Create transporter with Gmail settings
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: emailPass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Send email function
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@tourvibe.com',
      to,
      subject,
      html: html || text,
      text: text || html?.replace(/<[^>]*>/g, '') || '',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    // Log for debugging
    console.log('📧 To:', to);
    console.log('📧 Subject:', subject);
    return { error: error.message, messageId: null };
  }
};

// Password Reset Email
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #f59e0b;">🔐 Reset Your Password</h1>
      <p>Hello ${user.name},</p>
      <p>We received a request to reset your password.</p>
      <p><a href="${resetUrl}" style="display: inline-block; padding: 12px 30px; background: #f59e0b; color: white; text-decoration: none; border-radius: 8px;">Reset Password</a></p>
      <p>Or copy this link: ${resetUrl}</p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Reset Your Password - TourVibe',
    html,
  });
};

export default { sendEmail, sendPasswordResetEmail };