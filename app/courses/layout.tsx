import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Browse all LearnWealthX courses. Master in-demand skills with expert-led online courses. Start learning today.",
};

export default function CoursesLayout({
  children,
}: { children: React.ReactNode }) {
  return children;
}
