import React, { useEffect } from 'react';
import { Link } from 'wouter';

export default function TermsOfService() {
  useEffect(() => {
    document.title = "Terms of Service - FloHub";
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
            Terms of Service
          </h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>Welcome to FloHub ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of the FloHub application and website (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms.</p>
            
            <h2>2. Accounts and Registration</h2>
            <p>To access certain features of the Service, you may be required to register for an account. When you register, you must provide accurate and complete information. You are solely responsible for the activity that occurs on your account, and you must keep your account password secure.</p>
            
            <h2>3. Beta Program</h2>
            <p>The FloHub Service is currently in beta testing. By participating in our beta program, you acknowledge that:</p>
            <ul>
              <li>The Service may contain bugs, errors, or other issues</li>
              <li>The Service may not be available at all times</li>
              <li>Features and functionality may change without notice</li>
              <li>We may collect feedback and usage data to improve the Service</li>
            </ul>
            
            <h2>4. Intellectual Property Rights</h2>
            <p>The FloHub Service, including all content, features, and functionality, is owned by us and is protected by intellectual property laws. Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.</p>
            
            <p>FloHub, the FloHub logo, and FloCat mascot are proprietary to FloHub and may not be reproduced, imitated, or used in whole or in part without our prior written permission. All rights not expressly granted herein are reserved.</p>
            
            <h2>5. User Content</h2>
            <p>You retain all rights to any content you submit, post, or display on or through the Service. By providing content to the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content in connection with operating and improving the Service.</p>
            
            <h2>6. Privacy</h2>
            <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and share information about you.</p>
            
            <h2>7. Disclaimers</h2>
            <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>
            
            <h2>8. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL FLOHUB, ITS AFFILIATES, OR THEIR RESPECTIVE OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR ACCESS TO OR USE OF, OR YOUR INABILITY TO ACCESS OR USE, THE SERVICE.</p>
            
            <h2>9. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. If we make changes, we will provide notice by posting the updated Terms on the Service and updating the "Last Updated" date. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.</p>
            
            <h2>10. Termination</h2>
            <p>We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
            
            <h2>11. Contact Information</h2>
            <p>If you have any questions or concerns about these Terms, please contact us at: flohubofficial@gmail.com</p>
            
            <p><strong>Last Updated:</strong> May 20, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}