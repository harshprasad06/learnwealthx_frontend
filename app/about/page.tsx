import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.learnwealthx.in";

// ─── PAGE METADATA ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
    title: "About LearnWealthX (Learn Wealth) – Our Mission, Story & Team",
    description:
        "Learn about LearnWealthX (also known as Learn Wealth) – India's trusted online learning platform. Discover our mission to make quality skill-building education affordable and accessible for everyone.",
    alternates: {
        canonical: `${SITE_URL}/about`,
    },
    openGraph: {
        title: "About LearnWealthX – Our Mission & Story",
        description:
            "LearnWealthX is India's trusted online learning platform. Learn about our mission to make quality education affordable and accessible.",
        url: `${SITE_URL}/about`,
        siteName: "LearnWealthX",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "About LearnWealthX" }],
        type: "website",
        locale: "en_IN",
    },
    twitter: {
        card: "summary_large_image",
        title: "About LearnWealthX – Our Mission & Story",
        description: "LearnWealthX is India's trusted online learning platform.",
        images: ["/og-image.png"],
    },
};

// ─── SCHEMA MARKUP ─────────────────────────────────────────────────────────────
const aboutPageSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${SITE_URL}/about#webpage`,
    url: `${SITE_URL}/about`,
    name: "About LearnWealthX",
    description:
        "LearnWealthX (Learn Wealth) is India's trusted online skill-development platform founded to make quality education accessible and affordable for all learners.",
    isPartOf: {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "LearnWealthX",
        url: SITE_URL,
    },
    about: {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "LearnWealthX",
        url: SITE_URL,
        description:
            "LearnWealthX is an Indian online learning platform offering expert-led courses in digital skills, video editing, web development, and more.",
        foundingDate: "2024",
        slogan: "Learn Skills That Change Your Life",
        address: {
            "@type": "PostalAddress",
            addressCountry: "IN",
        },
    },
    inLanguage: "en-IN",
    breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
            {
                "@type": "ListItem",
                position: 1,
                name: "LearnWealthX Home",
                item: SITE_URL,
            },
            {
                "@type": "ListItem",
                position: 2,
                name: "About LearnWealthX",
                item: `${SITE_URL}/about`,
            },
        ],
    },
};

// ─── BRAND VALUES DATA ─────────────────────────────────────────────────────────
const values = [
    {
        icon: "🎯",
        title: "Practical Learning",
        description:
            "Every LearnWealthX course is designed with real-world application in mind. We teach skills you can use from day one.",
    },
    {
        icon: "💡",
        title: "Expert Instruction",
        description:
            "LearnWealthX courses are created and taught by industry practitioners with years of real-world experience.",
    },
    {
        icon: "♾️",
        title: "Lifetime Access",
        description:
            "When you enroll in a LearnWealthX course, you own it forever. No subscriptions, no expiry dates.",
    },
    {
        icon: "🌍",
        title: "Accessible to All",
        description:
            "LearnWealthX believes quality education should not be gated by price. We offer India's most affordable premium courses.",
    },
    {
        icon: "📈",
        title: "Career Growth",
        description:
            "Our learners see real results. LearnWealthX courses have helped thousands land jobs, grow freelancing, and scale businesses.",
    },
    {
        icon: "🤝",
        title: "Community First",
        description:
            "Join the LearnWealthX learner community — a supportive network of like-minded people growing together.",
    },
];

const stats = [
    { label: "Learners", value: "10,000+", sub: "Across India" },
    { label: "Courses", value: "30+", sub: "Expert-curated" },
    { label: "Completion Rate", value: "92%", sub: "Learners finishing courses" },
    { label: "Avg. Rating", value: "4.8/5", sub: "Based on reviews" },
];

// ─── PAGE COMPONENT ────────────────────────────────────────────────────────────
export default function AboutPage() {
    return (
        <>
            {/* Schema injection */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
            />

            <div className="app-page">
                <Navbar />
                <main className="app-main">

                    {/* ── Hero ─────────────────────────────────────────────────── */}
                    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-24">
                        <div className="absolute inset-0 bg-black opacity-10" />
                        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
                            {/* Breadcrumb — visible navigation signal */}
                            <nav aria-label="Breadcrumb" className="mb-8">
                                <ol className="flex items-center justify-center gap-2 text-blue-200 text-sm">
                                    <li>
                                        <Link href="/" className="hover:text-white transition-colors">
                                            LearnWealthX
                                        </Link>
                                    </li>
                                    <li className="text-blue-400" aria-hidden="true">/</li>
                                    <li className="text-white font-medium">About</li>
                                </ol>
                            </nav>

                            <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-white">
                                About{" "}
                                <span className="text-yellow-300">LearnWealthX</span>
                            </h1>
                            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                                LearnWealthX is India&apos;s trusted online learning platform — built to make
                                expert-quality education affordable and accessible for every learner.
                            </p>
                        </div>
                    </section>

                    {/* ── Mission ──────────────────────────────────────────────── */}
                    <section className="py-16 bg-white dark:bg-gray-900 transition-colors">
                        <div className="max-w-5xl mx-auto px-4 sm:px-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-600 dark:text-blue-400 mb-3">
                                        Our Mission
                                    </p>
                                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6">
                                        Why LearnWealthX Exists
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                        <strong className="text-gray-900 dark:text-gray-100">LearnWealthX</strong> was
                                        founded on a simple belief: the best education should not be reserved for the
                                        privileged few. Every learner in India deserves access to world-class
                                        skill-building content — at a price they can afford.
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                                        We partnered with seasoned industry experts to build a catalog of practical,
                                        hands-on courses. At <strong className="text-gray-900 dark:text-gray-100">LearnWealthX</strong>,
                                        we don&apos;t teach theory — we teach skills that employers and clients actually
                                        pay for.
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        Today, over 10,000 learners have chosen{" "}
                                        <strong className="text-gray-900 dark:text-gray-100">LearnWealthX</strong> as
                                        their learning home — and we&apos;re just getting started.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {stats.map((stat) => (
                                        <div
                                            key={stat.label}
                                            className="app-card app-card-padding flex flex-col items-center text-center"
                                        >
                                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                                {stat.value}
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 mt-1">
                                                {stat.label}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.sub}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Values ───────────────────────────────────────────────── */}
                    <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors">
                        <div className="max-w-6xl mx-auto px-4 sm:px-6">
                            <div className="text-center mb-12">
                                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-600 dark:text-blue-400 mb-3">
                                    What We Stand For
                                </p>
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50">
                                    The LearnWealthX Promise
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {values.map((v) => (
                                    <div key={v.title} className="app-card app-card-padding">
                                        <div className="text-3xl mb-3">{v.icon}</div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-2">
                                            {v.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {v.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── Story ────────────────────────────────────────────────── */}
                    <section className="py-16 bg-white dark:bg-gray-900 transition-colors">
                        <div className="max-w-3xl mx-auto px-4 sm:px-6">
                            <div className="text-center mb-10">
                                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-600 dark:text-blue-400 mb-3">
                                    Our Story
                                </p>
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-50">
                                    How LearnWealthX Began
                                </h2>
                            </div>
                            <div className="prose prose-blue dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 space-y-4 leading-relaxed">
                                <p>
                                    <strong className="text-gray-900 dark:text-gray-100">LearnWealthX</strong> started
                                    with a frustration every self-taught professional knows: quality online courses
                                    were either too expensive, too generic, or taught by people who had never actually
                                    done the work they were teaching.
                                </p>
                                <p>
                                    Our founders set out to build something different. The name{" "}
                                    <strong className="text-gray-900 dark:text-gray-100">LearnWealthX</strong> reflects
                                    the core idea — that learning is the original wealth multiplier. Every skill you
                                    acquire is an asset that compounds over time.
                                </p>
                                <p>
                                    We built the{" "}
                                    <strong className="text-gray-900 dark:text-gray-100">LearnWealthX</strong> platform
                                    from the ground up with one goal: zero gap between what you learn and what the
                                    market needs. Every course on LearnWealthX is created by experts who are actively
                                    working in their field.
                                </p>
                                <p>
                                    Since launch, <strong className="text-gray-900 dark:text-gray-100">LearnWealthX</strong>{" "}
                                    has helped thousands of learners across India develop skills in video editing,
                                    digital marketing, web development, freelancing, and more — at a fraction of the
                                    cost of traditional learning.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ── FAQ (brand Q&A) ──────────────────────────────────────── */}
                    <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors">
                        <div className="max-w-3xl mx-auto px-4 sm:px-6">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                                    Frequently Asked Questions About LearnWealthX
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {[
                                    {
                                        q: "What is LearnWealthX?",
                                        a: "LearnWealthX is an Indian online learning platform offering affordable, expert-led courses in digital skills, creative arts, business, and technology. LearnWealthX was founded to make high-quality skill development accessible to every learner.",
                                    },
                                    {
                                        q: "Who is LearnWealthX for?",
                                        a: "LearnWealthX is for anyone who wants to grow — students, working professionals, freelancers, entrepreneurs, and career switchers. If you want to learn a new skill or upgrade an existing one, LearnWealthX has a course for you.",
                                    },
                                    {
                                        q: "How is LearnWealthX different from other platforms?",
                                        a: "Unlike large global platforms, LearnWealthX is built for Indian learners — with Indian pricing, India-relevant content, and courses taught by practitioners who understand the local job market and freelancing landscape.",
                                    },
                                    {
                                        q: "Is LearnWealthX legitimate?",
                                        a: "Yes. LearnWealthX is a registered Indian online learning platform with thousands of verified learners. All courses are reviewed before publishing, and you get a satisfaction guarantee.",
                                    },
                                    {
                                        q: "How do I contact LearnWealthX?",
                                        a: "You can reach LearnWealthX support through our contact page at learnwealthx.in/contact. Our team is available to assist with any questions about courses, payments, or your learning account.",
                                    },
                                ].map(({ q, a }) => (
                                    <details
                                        key={q}
                                        className="app-card app-card-padding group cursor-pointer"
                                    >
                                        <summary className="font-semibold text-gray-900 dark:text-gray-50 list-none flex items-center justify-between">
                                            {q}
                                            <span className="ml-4 text-blue-600 dark:text-blue-400 group-open:rotate-180 transition-transform">
                                                ▾
                                            </span>
                                        </summary>
                                        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {a}
                                        </p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ── CTA ──────────────────────────────────────────────────── */}
                    <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                                Ready to Learn with LearnWealthX?
                            </h2>
                            <p className="text-xl text-blue-100 mb-8">
                                Browse our full catalog of expert-led courses and start your LearnWealthX journey.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/courses"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-lg shadow-lg hover:bg-yellow-300 transition-all transform hover:scale-105"
                                >
                                    Browse LearnWealthX Courses →
                                </Link>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center justify-center px-8 py-4 bg-white bg-opacity-20 text-white font-semibold rounded-lg border-2 border-white hover:bg-opacity-30 transition-all"
                                >
                                    Contact LearnWealthX
                                </Link>
                            </div>
                        </div>
                    </section>

                </main>
                <Footer />
            </div>
        </>
    );
}
