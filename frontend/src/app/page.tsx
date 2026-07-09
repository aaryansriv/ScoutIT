"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import {
  Map, Search, Building2, Users, Briefcase, ArrowRight,
  Zap, Shield, Globe, TrendingUp, ChevronRight, Star,
  Code2, Cpu, Cloud, Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { Navbar } from "@/components/navbar";

/* ─── Static data ─────────────────────────────────────────────────────────── */

const CITIES = [
  "Bengaluru", "Noida", "Hyderabad", "Pune", "Chennai",
  "Mumbai", "Gurugram", "Delhi", "Kochi", "Chandigarh"
];

const STATS = [
  { value: "50,000+", label: "Companies Indexed", icon: Building2, color: "text-blue-400" },
  { value: "50+",     label: "Cities Covered",   icon: Globe,      color: "text-violet-400" },
  { value: "200K+",   label: "Jobs Tracked",      icon: Briefcase,  color: "text-emerald-400" },
  { value: "2M+",     label: "Students Helped",   icon: Users,      color: "text-amber-400" },
];

const FEATURES = [
  {
    icon: Map,
    title: "Interactive Map Discovery",
    description:
      "Explore thousands of tech companies, IT parks, and startups on a live, filterable map. Zoom into any city and see opportunities you never knew existed.",
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
  },
  {
    icon: Search,
    title: "Smart Filters",
    description:
      "Filter by tech stack, company type, hiring status, industry, size, and distance. Find Python startups under 200 employees in Noida in seconds.",
    color: "from-violet-500/20 to-violet-600/5",
    iconColor: "text-violet-400",
  },
  {
    icon: Briefcase,
    title: "Rich Company Profiles",
    description:
      "Careers pages, LinkedIn, funding, Glassdoor ratings, tech stack, freshers score, office locations, nearby metro stations — all in one place.",
    color: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
  },
  {
    icon: TrendingUp,
    title: "Application Tracker",
    description:
      "Track every application from Applied → OA → Interview → HR → Offer. Never lose track of where you stand with any company.",
    color: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-400",
  },
  {
    icon: Zap,
    title: "Instant Autocomplete",
    description:
      "Search by company name, city, tech stack, or role. Results appear as you type — powered by a blazing-fast PostgreSQL fuzzy search engine.",
    color: "from-rose-500/20 to-rose-600/5",
    iconColor: "text-rose-400",
  },
  {
    icon: Shield,
    title: "Freshers Friendly Score",
    description:
      "Each company gets a Freshers Friendly Score based on hiring patterns, review data, and campus recruitment history. No guesswork.",
    color: "from-cyan-500/20 to-cyan-600/5",
    iconColor: "text-cyan-400",
  },
];

const TECH_STACK_BADGES = [
  { icon: Code2, label: "React" },
  { icon: Database, label: "Python" },
  { icon: Cloud, label: "AWS" },
  { icon: Cpu, label: "ML/AI" },
];

const COMPANY_TYPES = [
  { label: "🦄 Unicorns",       color: "border-violet-500/40 text-violet-300 bg-violet-500/10" },
  { label: "🚀 Startups",       color: "border-blue-500/40 text-blue-300 bg-blue-500/10" },
  { label: "🏭 MNCs",           color: "border-emerald-500/40 text-emerald-300 bg-emerald-500/10" },
  { label: "📦 Product Cos",    color: "border-amber-500/40 text-amber-300 bg-amber-500/10" },
  { label: "🛠 Service Cos",    color: "border-rose-500/40 text-rose-300 bg-rose-500/10" },
];

/* ─── Animation variants ──────────────────────────────────────────────────── */

const fadeUp: any = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-animated opacity-80" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(oklch(0.65 0.20 250) 1px, transparent 1px),
                              linear-gradient(90deg, oklch(0.65 0.20 250) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center max-w-5xl mx-auto px-6"
        >
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 text-sm text-muted-foreground border border-white/10"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            India&apos;s first map-first company discovery platform
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-5xl md:text-7xl lg:text-8xl font-heading font-black mb-6 leading-[1.05]"
          >
            Google Maps
            <br />
            <span className="text-gradient">for Tech Careers</span>
            <br />
            <span className="text-foreground/70">in India</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Stop applying to only TCS and Infosys. Discover{" "}
            <strong className="text-foreground">thousands of hidden companies</strong> —
            startups, product companies, and MNCs — visualized on an interactive map
            across every major Indian tech hub.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <Link href="/map">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="h-14 px-8 text-base rounded-2xl bg-primary hover:bg-primary/90 glow-brand font-semibold gap-2"
                >
                  <Map className="w-5 h-5" />
                  Explore the Map
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </motion.div>
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-base rounded-2xl border-white/15 bg-white/5 hover:bg-white/10 font-semibold gap-2"
              >
                <Star className="w-4 h-4" />
                How it works
              </Button>
            </motion.div>
          </motion.div>

          {/* City chips */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {CITIES.map((city, i) => (
              <motion.div key={city} variants={fadeUp} custom={i * 0.5}>
                <Link href={`/map?city=${encodeURIComponent(city)}`}>
                  <motion.span
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass border border-white/10 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors cursor-pointer"
                  >
                    📍 {city}
                  </motion.span>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Company type badges */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap justify-center gap-2"
          >
            {COMPANY_TYPES.map(({ label, color }, i) => (
              <motion.span
                key={label}
                variants={fadeUp}
                custom={i}
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${color}`}
              >
                {label}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-muted-foreground" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="relative py-20 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {STATS.map(({ value, label, icon: Icon, color }, i) => (
              <motion.div
                key={label}
                variants={fadeUp}
                custom={i}
                className="text-center p-6 rounded-2xl glass border border-white/5 hover:border-primary/20 transition-colors"
              >
                <div className={`inline-flex p-3 rounded-xl bg-white/5 mb-3 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-3xl font-heading font-black text-foreground mb-1">
                  {value}
                </div>
                <div className="text-sm text-muted-foreground">{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="py-28 max-w-6xl mx-auto px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-sm text-primary font-semibold mb-4 bg-primary/10 px-4 py-1.5 rounded-full">
            <Zap className="w-3.5 h-3.5" />
            Everything you need
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-gradient mb-4">
            Built for India&apos;s job seekers
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Every feature is designed around one mission: helping you discover
            companies you never knew existed.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {FEATURES.map(({ icon: Icon, title, description, color, iconColor }, i) => (
            <motion.div
              key={title}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -4, scale: 1.01 }}
              className="group p-6 rounded-2xl border border-white/5 hover:border-primary/20 bg-card transition-all duration-300 cursor-default relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-xl bg-white/5 mb-4 group-hover:scale-110 transition-transform ${iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Problem Section ───────────────────────────────────────────────── */}
      <section className="py-24 bg-card/30 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-heading font-black mb-4">
              Why does this exist?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Students know TCS, Infosys, Wipro. But every tech hub in India has{" "}
              <strong className="text-foreground">hundreds of unknown companies</strong>{" "}
              with open positions.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                platform: "Google Maps",
                problem: "Shows inconsistent results, misses hundreds of IT companies, can't filter by hiring status",
                emoji: "🗺️",
              },
              {
                platform: "LinkedIn",
                problem: "Requires you to already know the company name. Can't simply explore all companies in Noida",
                emoji: "💼",
              },
              {
                platform: "Job Portals",
                problem: "Focus on jobs, not companies. You miss opportunities because you don't know those companies exist",
                emoji: "📋",
              },
            ].map(({ platform, problem, emoji }, i) => (
              <motion.div
                key={platform}
                variants={fadeUp}
                custom={i}
                className="p-6 rounded-2xl glass border border-white/5"
              >
                <div className="text-4xl mb-3">{emoji}</div>
                <h3 className="font-heading font-bold text-lg mb-2 text-foreground">
                  {platform}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{problem}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="py-28 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative p-12 rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-violet-500/10 to-cyan-500/10 rounded-3xl" />
          <div className="absolute inset-0 border border-primary/20 rounded-3xl" />

          <div className="relative z-10">
            <div className="text-5xl mb-4">🚀</div>
            <h2 className="text-4xl md:text-5xl font-heading font-black mb-4">
              Stop limiting yourself to
              <br />
              <span className="text-gradient">5 company names</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Open the map. Search your city. Find 500+ companies you&apos;ve never heard of.
              Your dream company might be 3km away.
            </p>
            <Link href="/map">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block"
              >
                <Button
                  size="lg"
                  className="h-14 px-10 text-base rounded-2xl bg-primary hover:bg-primary/90 glow-brand font-semibold gap-2"
                >
                  <Map className="w-5 h-5" />
                  Open the Map — It&apos;s Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-primary" />
            <span className="font-heading font-bold text-gradient">ScoutIT</span>
            <span className="text-muted-foreground text-sm">— Google Maps for Tech Careers in India</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Built for India&apos;s students & freshers · Open source soon
          </p>
        </div>
      </footer>
    </div>
  );
}
