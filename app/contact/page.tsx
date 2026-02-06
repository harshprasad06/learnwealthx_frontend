'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState } from 'react';

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now just simulate submit – backend contact endpoint can be added later
    if (submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      alert('Thanks for reaching out! We will get back to you shortly.');
      setSubmitting(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <main className="flex-1">
        <section className="py-10 sm:py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50">
                Contact Us
              </h1>
              <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Have questions about courses, payments, or affiliate earnings? Send us a message and
                our team will respond as soon as possible.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/40 p-6 sm:p-8">
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 px-3 py-2 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 px-3 py-2 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subject *
                      </label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 px-3 py-2 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        placeholder="How can we help?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Message *
                      </label>
                      <textarea
                        required
                        rows={5}
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-50 px-3 py-2 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        placeholder="Please share details so we can assist you faster."
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center px-5 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
                      >
                        {submitting ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/40 p-5">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                    Support
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    For urgent issues related to payments or payouts, please mention your registered
                    email and transaction details.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Email:{' '}
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      support@example.com
                    </span>
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/40 p-5">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
                    Business & Partnerships
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Want to launch your own courses or discuss affiliate partnerships? Reach out and
                    we’ll get back to you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

