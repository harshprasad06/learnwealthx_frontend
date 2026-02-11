'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <main className="flex-1">
        <section className="py-10 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Welcome to LearnWealthX. By accessing or using our platform, you agree to be bound by these Terms of Service. 
              Please read them carefully before using our services.
            </p>

            <div className="space-y-6 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  1. Acceptance of Terms
                </h2>
                <p>
                  By accessing or using LearnWealthX, you acknowledge that you have read, understood, and agree to be bound 
                  by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, you 
                  must not use our platform.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  2. Account Registration
                </h2>
                <p className="mb-2">To access certain features, you must create an account. You agree to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and update your account information to keep it accurate</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  3. Course Access and Usage
                </h2>
                <p className="mb-2">When you purchase a course on LearnWealthX:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You receive lifetime access to the purchased course content</li>
                  <li>Access is personal and non-transferable</li>
                  <li>You may not share, resell, or redistribute course materials</li>
                  <li>You may not record, download, or copy course videos without permission</li>
                  <li>Course content is for personal educational use only</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  4. Payment Terms
                </h2>
                <p className="mb-2">Payment and pricing:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>All prices are displayed in Indian Rupees (₹) unless otherwise stated</li>
                  <li>Payments are processed securely through our payment gateway partners</li>
                  <li>You agree to provide valid payment information</li>
                  <li>We reserve the right to change course prices at any time</li>
                  <li>Price changes do not affect courses already purchased</li>
                  <li>All sales are final unless otherwise stated in our Refund Policy</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  5. Affiliate Program
                </h2>
                <p className="mb-2">If you participate in our affiliate program:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>You must complete KYC verification before receiving payouts</li>
                  <li>Commissions are calculated based on successful course purchases through your referral links</li>
                  <li>Commission rates are subject to change with prior notice</li>
                  <li>You may not create fake accounts or engage in fraudulent activities</li>
                  <li>Payouts are processed according to our payout schedule and policies</li>
                  <li>We reserve the right to terminate affiliate accounts for violations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  6. Intellectual Property
                </h2>
                <p className="mb-2">
                  All content on LearnWealthX, including courses, videos, text, graphics, logos, and software, is the property 
                  of LearnWealthX or its content creators and is protected by copyright and other intellectual property laws.
                </p>
                <p className="mb-2">You may not:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Reproduce, distribute, or create derivative works from our content</li>
                  <li>Use our content for commercial purposes without authorization</li>
                  <li>Remove copyright or proprietary notices from content</li>
                  <li>Reverse engineer or attempt to extract source code from our platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  7. User Conduct
                </h2>
                <p className="mb-2">You agree not to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Use the platform for any illegal or unauthorized purpose</li>
                  <li>Violate any laws in your jurisdiction</li>
                  <li>Transmit any viruses, malware, or harmful code</li>
                  <li>Interfere with or disrupt the platform&apos;s security or functionality</li>
                  <li>Attempt to gain unauthorized access to any part of the platform</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Post false, misleading, or defamatory content</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  8. Reviews and Feedback
                </h2>
                <p>
                  You may submit reviews and ratings for courses you have purchased. Reviews must be honest, accurate, and 
                  not contain offensive, defamatory, or inappropriate content. We reserve the right to remove reviews that 
                  violate our guidelines.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  9. Platform Availability
                </h2>
                <p>
                  We strive to maintain platform availability but do not guarantee uninterrupted access. We may perform 
                  maintenance, updates, or experience technical issues that temporarily affect availability. We are not 
                  liable for any losses resulting from platform unavailability.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  10. Account Termination
                </h2>
                <p className="mb-2">
                  We reserve the right to suspend or terminate your account at any time if you:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Violate these Terms of Service</li>
                  <li>Engage in fraudulent or illegal activities</li>
                  <li>Fail to pay required fees</li>
                  <li>Provide false information during registration or KYC</li>
                </ul>
                <p className="mt-2">
                  Upon termination, your access to the platform will be revoked, but you may retain access to courses 
                  already purchased, subject to our discretion.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  11. Limitation of Liability
                </h2>
                <p>
                  To the maximum extent permitted by law, LearnWealthX shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly 
                  or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of 
                  the platform.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  12. Indemnification
                </h2>
                <p>
                  You agree to indemnify and hold harmless LearnWealthX, its officers, directors, employees, and agents from 
                  any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the 
                  platform, violation of these terms, or infringement of any rights of another party.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  13. Changes to Terms
                </h2>
                <p>
                  We reserve the right to modify these Terms of Service at any time. We will notify users of material 
                  changes via email or platform notification. Your continued use of the platform after changes become 
                  effective constitutes acceptance of the revised terms.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  14. Governing Law
                </h2>
                <p>
                  These Terms of Service shall be governed by and construed in accordance with the laws of India. Any 
                  disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in India.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  15. Contact Information
                </h2>
                <p>
                  If you have any questions about these Terms of Service, please contact us through our{' '}
                  <a
                    href="/contact"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Contact page
                  </a>
                  .
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
