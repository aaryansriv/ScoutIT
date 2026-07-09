import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Map — ScoutIT",
  description:
    "Discover tech companies across India on an interactive map. Filter by tech stack, company type, hiring status, and location.",
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
