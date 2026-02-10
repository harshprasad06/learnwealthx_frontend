'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <main className="flex-1">
        <section className="py-10 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-4">
              Refund Policy
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                ⚠️ Important: All sales are final. We do not offer refunds for course purchases.
              </p>
            </div>

            <p className="text-gray-600 dark:text-gray-400 mb-8">
              At LearnWealthX, we are committed to providing high-quality educational content. This Refund Policy 
              outlines our policy regarding course purchases. Please read this policy carefully before making a purchase.
            </p>

            <div className="space-y-6 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  1. No Refund Policy
                </h2>
                <p className="mb-2">
                  <strong>All course purchases on LearnWealthX are final and non-refundable.</strong> Once you 
                  purchase a course, you will receive lifetime access to the course content, and no refunds 
                  will be provided under any circumstances, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Change of mind or dissatisfaction with the course content</li>
                  <li>Inability to complete the course due to personal circumstances</li>
                  <li>Technical issues (we will work to resolve technical problems, but refunds are not provided)</li>
                  <li>Not meeting personal expectations or learning goals</li>
                  <li>Duplicate purchases (please contact support for assistance with duplicate purchases)</li>
                  <li>Discount codes or promotional offers applied after purchase</li>
                  <li>Accidental purchases</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  2. Course Access
                </h2>
                <p>
                  When you purchase a course, you receive <strong>lifetime access</strong> to the course content. 
                  This means you can access and review the course materials at any time, as long as your account 
                  is active and the course remains available on our platform.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  3. Before You Purchase
                </h2>
                <p className="mb-2">We encourage you to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Review the course description, curriculum, and preview materials carefully</li>
                  <li>Read course reviews and ratings from other students</li>
                  <li>Check the course requirements and prerequisites</li>
                  <li>Ensure you have the necessary technical requirements to access the course</li>
                  <li>Contact us with any questions before making a purchase</li>
                </ul>
                <p className="mt-2">
                  By completing a purchase, you acknowledge that you have reviewed the course information and 
                  agree to our no-refund policy.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  4. Technical Support
                </h2>
                <p>
                  If you experience technical issues accessing your course, please contact our support team. 
                  We are committed to resolving technical problems and ensuring you can access your purchased 
                  content. However, technical issues do not qualify for refunds.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  5. Duplicate Purchases
                </h2>
                <p>
                  If you accidentally purchase the same course multiple times, please contact our support team 
                  immediately. While we cannot provide refunds, we may be able to assist you with account 
                  adjustments or provide access to alternative courses, subject to our discretion.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  6. Course Updates
                </h2>
                <p>
                  We may update or modify course content from time to time to improve quality or add new 
                  materials. As a course owner, you will have access to all updates and improvements at no 
                  additional cost. Course updates do not entitle you to a refund.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  7. Affiliate Commissions
                </h2>
                <p>
                  Since we do not offer refunds, affiliate commissions are final once a course purchase is 
                  completed and payment is successful. Affiliates will not experience commission reversals 
                  due to refund requests.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  8. Exceptions
                </h2>
                <p>
                  <strong>There are no exceptions to our no-refund policy.</strong> This policy applies to all 
                  course purchases regardless of the circumstances. We recommend carefully reviewing course 
                  information and ensuring the course meets your needs before completing your purchase.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  9. Contact Us
                </h2>
                <p>
                  If you have questions about this policy or need assistance with your course purchase, please 
                  contact us through our{' '}
                  <a
                    href="/contact"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Contact page
                  </a>
                  {' '}or email us at support@learnwealthx.com. Our support team is here to help with any 
                  questions or technical issues you may encounter.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                  10. Changes to This Policy
                </h2>
                <p>
                  We reserve the right to modify this Refund Policy at any time. Changes will be effective 
                  immediately upon posting on this page. Material changes will be communicated to users via 
                  email or platform notification. Continued use of our services after changes constitutes 
                  acceptance of the updated policy.
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
