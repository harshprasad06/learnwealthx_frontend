import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse every LearnWealthX course bundle. One payment, lifetime access to every course in the bundle. Start learning today.",
};

export default function CoursesLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
