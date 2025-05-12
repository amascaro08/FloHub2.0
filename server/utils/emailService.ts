import nodemailer from 'nodemailer';
import { Registration, Update } from '@shared/schema';

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

// Email template for registration confirmation
const getRegistrationConfirmationEmail = (registration: Registration) => {
  return {
    subject: "Welcome to FloHub - Your Registration Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 38px; margin: 0; font-weight: bold;"><span style="color: #0D9488;">Flo</span><span style="color: #F97316;">Hub</span></h1>
          <p style="color: #666; margin-top: 5px; font-size: 16px;">Your all-in-one purrfect LifeOS</p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6;">Hi ${registration.firstName},</p>
        
        <p style="font-size: 16px; line-height: 1.6;">Thanks so much for registering your interest in FloHub — I'm genuinely thrilled to have you onboard.</p>
        
        <p style="font-size: 16px; line-height: 1.6;">I started building FloHub because I was overwhelmed by juggling too many apps to manage my work, personal life, tasks, calendar, notes, and meetings. Nothing really worked the way I needed it to. So, I decided to create something better — a single intelligent hub that brings it all together.</p>
        
        <p style="font-size: 16px; line-height: 1.6;">FloHub is still in its early days, but I'm incredibly excited about what's coming. I can't wait to show you what we've been working on and to get it in your hands.</p>
        
        <p style="font-size: 16px; line-height: 1.6;">Your support means everything. As one of the first to join, your feedback will help shape the future of FloHub. I want to build something truly useful — and I can't do it without you.</p>
        
        <p style="font-size: 16px; line-height: 1.6;">To stay updated on the latest developments and announcements, make sure to check our updates page at <a href="https://flohub.replit.com/updates" style="color: #0D9488; text-decoration: underline;">flohub.replit.com/updates</a>. We'll be posting regular progress updates there!</p>
        
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
          <h1 style="font-size: 32px; margin: 0; font-weight: bold;"><span style="color: #0D9488;">Flo</span><span style="color: #F97316;">Hub</span> <span style="color: #666;">Admin</span></h1>
          <p style="color: #666; margin-top: 5px; font-size: 16px;">Registration Alert</p>
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
      from: `"Alvaro - FloHub Team" <${process.env.EMAIL_USER || 'flohub@example.com'}>`,
      to: registration.email,
      subject: emailContent.subject,
      html: emailContent.html,
      // Make the email appear more legitimate to reduce spam filtering
      headers: {
        'X-Priority': '1',
        'Importance': 'high',
        'X-MSMail-Priority': 'High',
        'X-Mailer': 'FloHubMailer'
      }
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
      // Make the email appear more legitimate to reduce spam filtering
      headers: {
        'X-Priority': '1',
        'Importance': 'high', 
        'X-MSMail-Priority': 'High',
        'X-Mailer': 'FloHubMailer'
      }
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

// Function to send update emails to registered users
export const sendUpdateEmail = async (
  update: Update, 
  recipients: Registration[]
): Promise<{success: boolean, sent: number, failed: number}> => {
  let successCount = 0;
  let failedCount = 0;
  
  try {
    for (const recipient of recipients) {
      try {
        await transporter.sendMail({
          from: `"FloHub Updates" <${process.env.EMAIL_USER || 'updates@flohub.com'}>`,
          to: recipient.email,
          subject: update.title,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 38px; margin: 0; font-weight: bold;"><span style="color: #0D9488;">Flo</span><span style="color: #F97316;">Hub</span></h1>
                <p style="color: #666; margin-top: 5px; font-size: 16px;">Your all-in-one purrfect LifeOS</p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6;">Hi ${recipient.firstName},</p>
              
              <div style="margin: 20px 0;">
                ${update.content}
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea;">
                <p style="font-size: 16px; line-height: 1.6; margin-bottom: 5px;">Best regards,</p>
                <p style="font-size: 16px; font-weight: bold; margin-top: 0;">The FloHub Team</p>
              </div>
              
              <div style="margin-top: 30px; padding: 15px; background-color: #f7f7f7; border-radius: 5px; font-size: 14px; color: #666; text-align: center;">
                <p style="margin: 0;">You're receiving this email because you registered for early access to FloHub.</p>
              </div>
            </div>
          `,
          headers: {
            'X-Priority': '1',
            'Importance': 'high',
            'X-MSMail-Priority': 'High',
            'X-Mailer': 'FloHubMailer'
          }
        });
        
        successCount++;
        console.log(`Update email sent to ${recipient.email}`);
      } catch (error) {
        failedCount++;
        console.error(`Failed to send update email to ${recipient.email}:`, error);
      }
      
      // Add a small delay between emails to prevent rate limiting
      if (recipients.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    return {
      success: failedCount === 0,
      sent: successCount,
      failed: failedCount
    };
  } catch (error) {
    console.error('Error in bulk update email sending:', error);
    return {
      success: false,
      sent: successCount,
      failed: failedCount + (recipients.length - successCount - failedCount)
    };
  }
};