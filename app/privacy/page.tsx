'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <main className="flex-1">
        <section className="py-10 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              We respect your privacy and are committed to protecting your personal information.
              This Privacy Policy explains how we collect, use, and safeguard your data when you use
              LearnWealthX platform. By using our services, you agree to the collection and use of 
              information in accordance with this policy.
            </p>

            <div className="space-y-6 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  1. Information We Collect
                </h2>
                <p className="mb-2">We collect several types of information:</p>
                <p className="mb-2"><strong>Personal Information:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                  <li>Name, email address, and phone number (when provided)</li>
                  <li>Payment information (processed securely through payment gateways)</li>
                  <li>Profile picture (if you sign up via Google OAuth)</li>
                  <li>Date of birth (for KYC verification, if applicable)</li>
                  <li>Bank account details (for affiliate payouts, after KYC approval)</li>
                </ul>
                <p className="mb-2"><strong>Usage Information:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Course progress and completion data</li>
                  <li>Pages visited and time spent on the platform</li>
                  <li>Device information (browser type, operating system)</li>
                  <li>IP address and location data</li>
                  <li>Referral link clicks and conversions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  2. How We Use Your Information
                </h2>
                <p className="mb-2">We use the collected information for the following purposes:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>To provide, maintain, and improve our platform and services</li>
                  <li>To process course purchases and manage your account</li>
                  <li>To deliver course content and track your learning progress</li>
                  <li>To calculate and process affiliate commissions and payouts</li>
                  <li>To verify identity through KYC processes for affiliate payouts</li>
                  <li>To send important updates, notifications, and marketing communications</li>
                  <li>To respond to your inquiries and provide customer support</li>
                  <li>To detect and prevent fraud, abuse, and security threats</li>
                  <li>To comply with legal obligations and enforce our terms</li>
                  <li>To analyze usage patterns and improve user experience</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  3. Data Security
                </h2>
                <p className="mb-2">
                  We implement industry-standard security measures to protect your personal information:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Encryption of data in transit using SSL/TLS protocols</li>
                  <li>Secure storage of sensitive information</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Payment information is processed through PCI-DSS compliant payment gateways</li>
                  <li>We do not store your full credit card details on our servers</li>
                </ul>
                <p className="mt-2">
                  However, no method of transmission over the internet or electronic storage is 100% secure. 
                  While we strive to protect your data, we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  4. Cookies & Tracking Technologies
                </h2>
                <p className="mb-2">We use cookies and similar tracking technologies for:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                  <li>Authentication and session management</li>
                  <li>Remembering your preferences and settings</li>
                  <li>Tracking course progress and completion</li>
                  <li>Tracking referral links and affiliate conversions</li>
                  <li>Analyzing platform usage and performance</li>
                  <li>Providing personalized content and recommendations</li>
                </ul>
                <p>
                  You can control cookies through your browser settings. However, disabling cookies may 
                  affect the functionality of certain features, such as staying logged in or tracking 
                  your course progress.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  5. Data Sharing and Disclosure
                </h2>
                <p className="mb-2">We do not sell your personal data. We may share your information with:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                  <li><strong>Service Providers:</strong> Payment processors, video hosting services, email service providers, and analytics tools (under strict data protection agreements)</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with prior notice)</li>
                  <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or that of our users</li>
                </ul>
                <p>
                  All third-party service providers are contractually obligated to protect your information 
                  and use it only for the purposes we specify.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  6. Your Rights and Choices
                </h2>
                <p className="mb-2">You have the following rights regarding your personal information:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal and contractual obligations)</li>
                  <li><strong>Data Portability:</strong> Request transfer of your data to another service</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</li>
                  <li><strong>Account Deletion:</strong> Request deletion of your account and associated data</li>
                </ul>
                <p>
                  To exercise these rights, please contact us through our{' '}
                  <a href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Contact page
                  </a>
                  . We will respond to your request within a reasonable timeframe.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  7. Data Retention
                </h2>
                <p>
                  We retain your personal information for as long as necessary to provide our services, 
                  comply with legal obligations, resolve disputes, and enforce our agreements. Course 
                  purchase records are retained for accounting and legal purposes. When you delete your 
                  account, we will delete or anonymize your personal information, except where we are 
                  required to retain it by law.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  8. Children's Privacy
                </h2>
                <p>
                  LearnWealthX is not intended for users under the age of 18. We do not knowingly collect 
                  personal information from children. If you believe we have collected information from a 
                  child, please contact us immediately, and we will take steps to delete such information.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  9. International Data Transfers
                </h2>
                <p>
                  Your information may be transferred to and processed in countries other than your country 
                  of residence. These countries may have data protection laws that differ from those in 
                  your country. We take appropriate safeguards to ensure your data is protected in 
                  accordance with this Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  10. Changes to This Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices 
                  or for legal, operational, or regulatory reasons. We will notify you of material changes 
                  by posting the updated policy on this page and updating the "Last updated" date. 
                  Continued use of the platform after changes become effective constitutes acceptance of 
                  the revised policy.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  11. Contact Us
                </h2>
                <p>
                  If you have any questions, concerns, or requests regarding this Privacy Policy or how we 
                  handle your personal information, please contact us through our{' '}
                  <a
                    href="/contact"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Contact page
                  </a>
                  {' '}or email us at info@learnwealthx.com.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

