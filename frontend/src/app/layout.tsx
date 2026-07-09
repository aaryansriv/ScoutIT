import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { Navbar } from "@/components/navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ScoutIT — Google Maps for Tech Careers in India",
  description:
    "Discover thousands of software companies, startups, product companies, and MNCs across India on an interactive map. Built for students, freshers, and job seekers.",
  keywords: [
    "IT companies India",
    "software companies India",
    "tech jobs India",
    "company discovery",
    "tech companies map",
    "freshers jobs",
    "startups India",
  ],
  openGraph: {
    title: "ScoutIT — Google Maps for Tech Careers in India",
    description:
      "Explore India's tech ecosystem on a map. Find companies near you, filter by tech stack, and discover hidden opportunities.",
    type: "website",
    siteName: "ScoutIT",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScoutIT — Google Maps for Tech Careers in India",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <main>{children}</main>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
