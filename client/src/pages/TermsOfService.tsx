import React from 'react';
import { Link } from 'wouter';
import { FloHubLogoImage } from '@/assets/FloHubLogoImage';

const TermsOfService: React.FC = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          
          <div className="prose max-w-none">
            <p>Last Updated: May 16, 2025</p>
            
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using FloHub's service, you agree to be bound by these Terms of Service and all applicable laws 
              and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this service.
            </p>
            
            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily access and use FloHub's service for personal, non-commercial purposes. 
              This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
              <li>Attempt to decompile or reverse engineer any software contained in FloHub</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
            <p>
              This license shall automatically terminate if you violate any of these restrictions and may be terminated by 
              FloHub at any time. Upon terminating your viewing of these materials or upon the termination of this license, 
              you must destroy any downloaded materials in your possession, whether in electronic or printed format.
            </p>
            
            <h2>3. Account Terms</h2>
            <p>
              To access certain features of the service, you may be required to register for an account. You are responsible 
              for maintaining the security of your account and password. FloHub cannot and will not be liable for any loss or 
              damage from your failure to comply with this security obligation.
            </p>
            
            <h2>4. Content and Conduct</h2>
            <p>
              You are responsible for all content posted and activity that occurs under your account. You may not use the service 
              for any illegal or unauthorized purpose. You must not, in the use of the service, violate any laws in your jurisdiction.
            </p>
            
            <h2>5. Service Modifications</h2>
            <p>
              FloHub reserves the right to modify or discontinue, temporarily or permanently, the service (or any part thereof) 
              with or without notice at any time. FloHub shall not be liable to you or to any third party for any modification, 
              suspension, or discontinuance of the service.
            </p>
            
            <h2>6. Limitation of Liability</h2>
            <p>
              In no event shall FloHub or its suppliers be liable for any damages (including, without limitation, damages for 
              loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials 
              on FloHub's website, even if FloHub or a FloHub authorized representative has been notified orally or in writing 
              of the possibility of such damage.
            </p>
            
            <h2>7. Accuracy of Materials</h2>
            <p>
              The materials appearing on FloHub's website could include technical, typographical, or photographic errors. 
              FloHub does not warrant that any of the materials on its website are accurate, complete, or current. FloHub 
              may make changes to the materials contained on its website at any time without notice.
            </p>
            
            <h2>8. Links</h2>
            <p>
              FloHub has not reviewed all of the sites linked to its website and is not responsible for the contents of any 
              such linked site. The inclusion of any link does not imply endorsement by FloHub of the site. Use of any such 
              linked website is at the user's own risk.
            </p>
            
            <h2>9. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit 
              to the exclusive jurisdiction of the courts in that location.
            </p>
            
            <h2>10. Changes to Terms</h2>
            <p>
              FloHub may revise these terms of service for its website at any time without notice. By using this website, 
              you are agreeing to be bound by the then current version of these terms of service.
            </p>
            
            <h2>11. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at terms@flohub.io.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;