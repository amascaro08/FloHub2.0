import React from 'react';
import { Link } from 'wouter';
import { FloHubLogoImage } from '@/assets/FloHubLogoImage';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center">
            <FloHubLogoImage className="h-10 w-auto" />
          </Link>
          <Link href="/" className="text-teal-600 hover:text-teal-800 transition-colors">
            &larr; Back to Home
          </Link>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          
          <div className="prose max-w-none">
            <p>Last Updated: May 16, 2025</p>
            
            <h2>1. Introduction</h2>
            <p>
              Welcome to FloHub ("we," "our," or "us"). We respect your privacy and are committed to protecting 
              your personal data. This privacy policy explains how we collect, use, and protect your personal information 
              when you use our service.
            </p>
            
            <h2>2. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul>
              <li>
                <strong>Account Information:</strong> When you register for an account, we collect your name, 
                email address, and other contact details.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you use our service, including features accessed, 
                time spent on the platform, and interaction with widgets.
              </li>
              <li>
                <strong>Device Information:</strong> Information about the device you use to access our service, 
                including device type, operating system, and browser type.
              </li>
              <li>
                <strong>Content:</strong> Any content you create, upload, or store using our service, such as tasks, 
                notes, calendar events, and journal entries.
              </li>
            </ul>
            
            <h2>3. How We Use Your Information</h2>
            <p>We use your personal information for the following purposes:</p>
            <ul>
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To allow you to participate in interactive features of our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our service</li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent and address technical issues</li>
              <li>To personalize your experience and provide content recommendations</li>
            </ul>
            
            <h2>4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized access, 
              alteration, disclosure, or destruction. However, please be aware that no method of transmission over the 
              internet or method of electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            
            <h2>5. Sharing Your Information</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information with:</p>
            <ul>
              <li>
                <strong>Service Providers:</strong> We may employ third-party companies to facilitate our service, 
                provide the service on our behalf, or assist us in analyzing how our service is used.
              </li>
              <li>
                <strong>Business Partners:</strong> We may share your information with our business partners to 
                offer you certain products, services, or promotions.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose your information if required to do so by law 
                or in response to valid requests by public authorities.
              </li>
            </ul>
            
            <h2>6. Your Data Rights</h2>
            <p>Depending on your location, you may have certain rights regarding your personal data, including:</p>
            <ul>
              <li>The right to access personal data we hold about you</li>
              <li>The right to request correction of inaccurate data</li>
              <li>The right to request deletion of your data</li>
              <li>The right to restrict or object to processing</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
            
            <h2>7. Children's Privacy</h2>
            <p>
              Our service is not intended for use by children under the age of 13. We do not knowingly collect personal 
              information from children under 13. If we become aware that we have collected personal data from children 
              without verification of parental consent, we take steps to remove that information from our servers.
            </p>
            
            <h2>8. Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new 
              Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy 
              Policy periodically for any changes.
            </p>
            
            <h2>9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@flohub.io.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;