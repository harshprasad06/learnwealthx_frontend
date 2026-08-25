import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bundles",
  description:
    "Every LearnWealthX bundle and the courses inside it. One payment, lifetime access to the whole bundle.",
};

export default function BundlesLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
