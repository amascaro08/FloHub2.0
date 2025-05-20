import React, { useEffect } from 'react';
import { Link } from 'wouter';

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = "Privacy Policy - FloHub";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-primary-950 dark:to-neutral-900 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <a className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Home
            </a>
          </Link>
          <img 
            src="/attached_assets/FloHub_Logo_Transparent.png" 
            alt="FloHub Logo" 
            className="h-10"
          />
        </div>
        
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-primary-700 dark:text-primary-400 mb-6">
            Privacy Policy
          </h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="lead">Last Updated: May 20, 2025</p>
            
            <h2>1. Introduction</h2>
            <p>FloHub ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application and website (collectively, the "Service").</p>
            
            <h2>2. Information We Collect</h2>
            <h3>2.1 Information You Provide</h3>
            <p>We collect information you provide directly to us, including:</p>
            <ul>
              <li>Account information (name, email address, profile picture)</li>
              <li>Content you create (tasks, notes, calendar events, journal entries)</li>
              <li>Communications with us</li>
              <li>Device information (type, operating system)</li>
              <li>Beta program feedback</li>
            </ul>
            
            <h3>2.2 Information Collected Automatically</h3>
            <p>When you use our Service, we may automatically collect certain information, including:</p>
            <ul>
              <li>Usage information (features used, time spent, actions taken)</li>
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Cookies and similar technologies</li>
            </ul>
            
            <h3>2.3 Information from Third Parties</h3>
            <p>We may receive information about you from third parties, such as Google, when you choose to connect your account with these services.</p>
            
            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve the Service</li>
              <li>Process and complete transactions</li>
              <li>Send you technical notices, updates, and support messages</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Develop new products and services</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>Detect, investigate, and prevent security incidents</li>
            </ul>
            
            <h2>4. Sharing of Information</h2>
            <p>We may share your information in the following circumstances:</p>
            <ul>
              <li>With your consent</li>
              <li>With service providers who perform services on our behalf</li>
              <li>To comply with legal obligations</li>
              <li>In connection with a business transfer (merger, acquisition, etc.)</li>
              <li>To protect our rights and property</li>
            </ul>
            
            <h2>5. Third-Party Services</h2>
            <p>The Service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties, and we encourage you to read their privacy policies.</p>
            
            <h2>6. Data Security</h2>
            <p>We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access. However, no security system is impenetrable, and we cannot guarantee the security of your information.</p>
            
            <h2>7. Your Choices</h2>
            <p>You can access, update, or delete your account information at any time through your account settings. You may also contact us directly to request access to, correction of, or deletion of your personal information.</p>
            
            <h2>8. Children's Privacy</h2>
            <p>The Service is not intended for children under the age of 13, and we do not knowingly collect information from children under 13.</p>
            
            <h2>9. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. If we make changes, we will notify you by posting the updated policy and updating the "Last Updated" date. Your continued use of the Service after such changes constitutes your acceptance of the new Privacy Policy.</p>
            
            <h2>10. Contact Us</h2>
            <p>If you have any questions or concerns about this Privacy Policy, please contact us at: flohubofficial@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}