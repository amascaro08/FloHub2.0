import nodemailer from 'nodemailer';
import { Registration } from '@shared/schema';

// Create a Nodemailer transporter
let transporter: nodemailer.Transporter;

// Initialize the transporter
const initializeTransporter = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      // If email credentials aren't available, use a console-based transport
      transporter = {
        sendMail: async (mailOptions: any) => {
          console.log('\n-------- EMAIL WOULD HAVE BEEN SENT --------');
          console.log('From:', mailOptions.from);
          console.log('To:', mailOptions.to);
          console.log('Subject:', mailOptions.subject);
          console.log('HTML Content Summary:', mailOptions.html.substring(0, 150) + '...');
          console.log('----------------------------------------\n');
          return { messageId: 'mock-id-' + Date.now() };
        }
      } as any;
      console.log('Using console transport for emails (no credentials provided)');
      return;
    }

    // Create a real SMTP transporter with provided credentials
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    console.log('Email transporter initialized with real credentials');
  } catch (error) {
    console.error('Failed to initialize email transporter:', error);
    // Fallback to console transport
    transporter = {
      sendMail: async (mailOptions: any) => {
        console.log('\n-------- EMAIL WOULD HAVE BEEN SENT (FALLBACK) --------');
        console.log('From:', mailOptions.from);
        console.log('To:', mailOptions.to);
        console.log('Subject:', mailOptions.subject);
        console.log('HTML Content Summary:', mailOptions.html.substring(0, 150) + '...');
        console.log('----------------------------------------\n');
        return { messageId: 'mock-id-' + Date.now() };
      }
    } as any;
  }
};

// Initialize the transporter when the module is loaded
initializeTransporter();

// Logo base64 encoded for email embedding
const floHubLogoBase64 = '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';

// Email template for registration confirmation
const getRegistrationConfirmationEmail = (registration: Registration) => {
  return {
    subject: "Welcome to FloHub - You're In! 🚀",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="data:image/png;base64,${floHubLogoBase64}" alt="FloHub Logo" style="width: 150px; height: auto;" />
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">Hi ${registration.firstName},</p>
        
        <p style="font-size: 16px; line-height: 1.6;">Thanks so much for registering your interest in FloHub — I'm genuinely thrilled to have you onboard.</p>
        
        <p style="font-size: 16px; line-height: 1.6;">I started building FloHub because I was overwhelmed by juggling too many apps to manage my work, personal life, tasks, calendar, notes, and meetings. Nothing really worked the way I needed it to. So, I decided to create something better — a single intelligent hub that brings it all together.</p>
        
        <p style="font-size: 16px; line-height: 1.6;">FloHub is still in its early days, but I'm incredibly excited about what's coming. I can't wait to show you what we've been working on and to get it in your hands.</p>
        
        <p style="font-size: 16px; line-height: 1.6;">Your support means everything. As one of the first to join, your feedback will help shape the future of FloHub. I want to build something truly useful — and I can't do it without you.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea;">
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 5px;">Talk soon,</p>
          <p style="font-size: 16px; font-weight: bold; margin-top: 0;">Alvaro</p>
          <p style="font-size: 14px; color: #666; margin-top: 0;">Founder of FloHub</p>
        </div>
        
        <div style="margin-top: 30px; padding: 15px; background-color: #f7f7f7; border-radius: 5px; font-size: 14px; color: #666; text-align: center;">
          <p style="margin: 0;">You're receiving this email because you registered for early access to FloHub.</p>
        </div>
      </div>
    `,
  };
};

// Email template for admin notification
const getAdminNotificationEmail = (registration: Registration) => {
  return {
    subject: "FloHub - New Registration Alert",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="data:image/png;base64,${floHubLogoBase64}" alt="FloHub Logo" style="width: 150px; height: auto;" />
        </div>
        <h2>New User Registration</h2>
        <p>A new user has registered interest in FloHub:</p>
        <ul style="line-height: 1.6;">
          <li><strong>Name:</strong> ${registration.firstName}</li>
          <li><strong>Email:</strong> ${registration.email}</li>
          <li><strong>Role:</strong> ${registration.role}</li>
          <li><strong>Devices:</strong> ${registration.devices?.join(', ') || 'Not specified'}</li>
          <li><strong>Has Gmail:</strong> ${registration.hasGmail ? 'Yes' : 'No'}</li>
          ${registration.gmailAccount ? `<li><strong>Gmail Account:</strong> ${registration.gmailAccount}</li>` : ''}
          <li><strong>Why interested:</strong> ${registration.why}</li>
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
    
    // Send the email
    await transporter.sendMail({
      from: `"Alvaro from FloHub" <${process.env.EMAIL_USER || 'flohub@example.com'}>`,
      to: registration.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });
    
    console.log(`Confirmation email sent to ${registration.email}`);
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // As a fallback, log the email that would have been sent
    const emailContent = getRegistrationConfirmationEmail(registration);
    console.log('\n-------- CONFIRMATION EMAIL (FALLBACK) --------');
    console.log('To:', registration.email);
    console.log('Subject:', emailContent.subject);
    console.log('Content Preview:', emailContent.html.substring(0, 150) + '...');
    console.log('----------------------------------------\n');
    return false;
  }
};

// Function to send admin notification email
export const sendAdminNotification = async (registration: Registration): Promise<boolean> => {
  try {
    const emailContent = getAdminNotificationEmail(registration);
    
    // If EMAIL_USER is available, send to that address, otherwise use admin@flohub.com
    const adminEmail = process.env.EMAIL_USER || 'admin@flohub.com';
    
    await transporter.sendMail({
      from: `"FloHub Registration System" <${process.env.EMAIL_USER || 'noreply@flohub.com'}>`,
      to: adminEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    });
    
    console.log(`Admin notification email sent to ${adminEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    // As a fallback, log the email that would have been sent
    const emailContent = getAdminNotificationEmail(registration);
    console.log('\n-------- ADMIN EMAIL (FALLBACK) --------');
    console.log('Subject:', emailContent.subject);
    console.log('To:', process.env.EMAIL_USER || 'admin@flohub.com');
    console.log('Content Preview:', emailContent.html.substring(0, 150) + '...');
    console.log('----------------------------------------\n');
    return false;
  }
};