import nodemailer from 'nodemailer';
import { Registration } from '@shared/schema';

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // Using Gmail as the email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email template for registration confirmation
const getRegistrationConfirmationEmail = (registration: Registration) => {
  return {
    subject: 'FloHub - Thanks for Your Interest!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #16A34A;">FloHub</h1>
        </div>
        <h2>Thanks for Registering Your Interest, ${registration.name}!</h2>
        <p>We're excited to have you join our community of early testers. Here's what happens next:</p>
        <ul>
          <li>We're currently preparing for our July 2025 beta release</li>
          <li>We'll keep you updated on our progress</li>
          <li>You'll be among the first to get access when we launch</li>
        </ul>
        <p>We've noted your preference for the <strong>${registration.plan}</strong> plan and that you primarily use <strong>${registration.device}</strong> devices.</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;">If you have any questions or feedback, feel free to reply to this email. We'd love to hear from you!</p>
        </div>
        <p>Thank you,<br>The FloHub Team</p>
      </div>
    `,
  };
};

// Email template for admin notification
const getAdminNotificationEmail = (registration: Registration) => {
  return {
    subject: 'FloHub - New Registration Alert',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #16A34A;">FloHub Admin Alert</h1>
        </div>
        <h2>New User Registration</h2>
        <p>A new user has registered interest in FloHub:</p>
        <ul>
          <li><strong>Name:</strong> ${registration.name}</li>
          <li><strong>Email:</strong> ${registration.email}</li>
          <li><strong>Plan:</strong> ${registration.plan}</li>
          <li><strong>Device:</strong> ${registration.device}</li>
          <li><strong>Date:</strong> ${new Date(registration.createdAt).toLocaleString()}</li>
        </ul>
        <p>You can view all registrations in the admin dashboard.</p>
      </div>
    `,
  };
};

// Function to send registration confirmation email
export const sendRegistrationConfirmation = async (registration: Registration): Promise<boolean> => {
  try {
    const emailContent = getRegistrationConfirmationEmail(registration);
    
    await transporter.sendMail({
      from: `"FloHub Team" <${process.env.EMAIL_USER}>`,
      to: registration.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });
    
    console.log(`Confirmation email sent to ${registration.email}`);
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
};

// Function to send admin notification email
export const sendAdminNotification = async (registration: Registration): Promise<boolean> => {
  try {
    const emailContent = getAdminNotificationEmail(registration);
    
    await transporter.sendMail({
      from: `"FloHub System" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to admin email (same as sender for now)
      subject: emailContent.subject,
      html: emailContent.html,
    });
    
    console.log('Admin notification email sent');
    return true;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return false;
  }
};