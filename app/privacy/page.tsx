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
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              We respect your privacy and are committed to protecting your personal information.
              This Privacy Policy explains how we collect, use, and safeguard your data when you use
              our course platform.
            </p>

            <div className="space-y-6 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  1. Information We Collect
                </h2>
                <p>
                  We collect information you provide directly to us, such as your name, email
                  address, and payment details when you create an account, purchase a course, or
                  participate in our affiliate program. We also collect usage data like pages
                  visited, course progress, and device information to improve the platform.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  2. How We Use Your Information
                </h2>
                <p>
                  We use your information to provide and maintain the platform, process payments,
                  deliver courses, track affiliate commissions, and communicate important updates.
                  We may also use aggregated, anonymized data for analytics and product
                  improvements.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  3. Payments & Security
                </h2>
                <p>
                  Payments are processed securely through trusted payment gateways. We do not store
                  your full card details on our servers. We implement reasonable technical and
                  organizational measures to protect your data from unauthorized access or misuse.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  4. Cookies & Tracking
                </h2>
                <p>
                  We use cookies and similar technologies to remember your preferences, maintain
                  sessions, and support features such as referral tracking and course progress.
                  You can control cookies through your browser settings, but some features may not
                  work correctly if cookies are disabled.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  5. Data Sharing
                </h2>
                <p>
                  We do not sell your personal data. We may share information with service
                  providers (such as payment processors or video hosting providers) only as needed
                  to operate the platform, under appropriate data protection agreements.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  6. Your Rights
                </h2>
                <p>
                  You can request access, correction, or deletion of your personal information
                  subject to applicable law. To exercise your rights, please contact our support
                  team using the Contact page.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  7. Changes to This Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time. If we make material changes,
                  we will notify you through the platform or by email. Continued use of the
                  platform after updates means you accept the revised policy.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  8. Contact Us
                </h2>
                <p>
                  If you have any questions about this Privacy Policy or how we handle your data,
                  please contact us via the{' '}
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

