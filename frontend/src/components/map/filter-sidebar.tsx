"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, Building2, MapPin, Code2, Users, Briefcase, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FilterState } from "@/app/map/page";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClose: () => void;
}

const COMPANY_TYPES = [
  { value: "startup",  label: "Startup",       emoji: "🚀" },
  { value: "product",  label: "Product",        emoji: "📦" },
  { value: "service",  label: "Service",        emoji: "🛠" },
  { value: "mnc",      label: "MNC",            emoji: "🌐" },
  { value: "unicorn",  label: "Unicorn",        emoji: "🦄" },
];

const INDUSTRIES = [
  "AI/ML", "SaaS", "FinTech", "EdTech", "HealthTech",
  "Gaming", "Cloud", "Cybersecurity", "E-commerce", "Blockchain",
];

const TECH_STACKS = [
  "Python", "Java", "React", "Node.js", "Spring Boot",
  "Angular", "AWS", "Azure", "Docker", "Kubernetes",
  "TensorFlow", "PyTorch", "SQL", "Power BI", "Go", "Rust",
];

const CITIES = [
  "Bengaluru", "Noida", "Hyderabad", "Pune", "Chennai",
  "Mumbai", "Gurugram", "Delhi", "Kochi", "Chandigarh",
  "Kolkata", "Ahmedabad", "Jaipur", "Indore", "Coimbatore",
];

const EMPLOYEE_RANGES = [
  { label: "1–10",      min: 1,    max: 10    },
  { label: "10–50",     min: 10,   max: 50    },
  { label: "50–200",    min: 50,   max: 200   },
  { label: "200–1000",  min: 200,  max: 1000  },
  { label: "1000+",     min: 1000, max: 100000 },
];

export function FilterSidebar({ filters, onChange, onClose }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["city", "type", "hiring", "industry"]));

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const update = (patch: Partial<FilterState>) =>
    onChange({ ...filters, ...patch });

  const toggleTech = (tech: string) => {
    const current = filters.techStack;
    update({
      techStack: current.includes(tech)
        ? current.filter((t) => t !== tech)
        : [...current, tech],
    });
  };

  const activeCount = [
    filters.city,
    filters.companyType,
    filters.industry,
    filters.hiring !== null,
    filters.internships !== null,
    filters.techStack.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="h-full w-full glass-dark backdrop-blur-2xl bg-black/40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-primary" />
          <span className="font-heading font-bold text-sm">Filters</span>
          {activeCount > 0 && (
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs px-1.5 py-0">
              {activeCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={() =>
                onChange({
                  city: "", companyType: "", industry: "",
                  hiring: null, internships: null, techStack: [],
                  minEmployees: 0, maxEmployees: 100000,
                })
              }
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-5">

        {/* City */}
        <FilterSection
          id="city"
          icon={MapPin}
          label="City"
          expanded={expandedSections.has("city")}
          onToggle={() => toggleSection("city")}
        >
          <div className="flex flex-wrap gap-1.5 pt-2">
            {CITIES.map((city) => (
              <FilterChip
                key={city}
                active={filters.city === city}
                onClick={() => update({ city: filters.city === city ? "" : city })}
              >
                {city}
              </FilterChip>
            ))}
          </div>
        </FilterSection>

        {/* Company Type */}
        <FilterSection
          id="type"
          icon={Building2}
          label="Company Type"
          expanded={expandedSections.has("type")}
          onToggle={() => toggleSection("type")}
        >
          <div className="flex flex-wrap gap-1.5 pt-2">
            {COMPANY_TYPES.map(({ value, label, emoji }) => (
              <FilterChip
                key={value}
                active={filters.companyType === value}
                onClick={() => update({ companyType: filters.companyType === value ? "" : value })}
              >
                {emoji} {label}
              </FilterChip>
            ))}
          </div>
        </FilterSection>

        {/* Hiring */}
        <FilterSection
          id="hiring"
          icon={Briefcase}
          label="Hiring Status"
          expanded={expandedSections.has("hiring")}
          onToggle={() => toggleSection("hiring")}
        >
          <div className="flex flex-wrap gap-1.5 pt-2">
            <FilterChip
              active={filters.hiring === true}
              onClick={() => update({ hiring: filters.hiring === true ? null : true })}
              activeColor="badge-hiring"
            >
              ✅ Actively Hiring
            </FilterChip>
            <FilterChip
              active={filters.internships === true}
              onClick={() => update({ internships: filters.internships === true ? null : true })}
              activeColor="badge-internship"
            >
              🎓 Internships
            </FilterChip>
          </div>
        </FilterSection>

        {/* Industry */}
        <FilterSection
          id="industry"
          icon={GraduationCap}
          label="Industry"
          expanded={expandedSections.has("industry")}
          onToggle={() => toggleSection("industry")}
        >
          <div className="flex flex-wrap gap-1.5 pt-2">
            {INDUSTRIES.map((ind) => (
              <FilterChip
                key={ind}
                active={filters.industry === ind}
                onClick={() => update({ industry: filters.industry === ind ? "" : ind })}
              >
                {ind}
              </FilterChip>
            ))}
          </div>
        </FilterSection>

        {/* Tech Stack */}
        <FilterSection
          id="tech"
          icon={Code2}
          label={`Tech Stack ${filters.techStack.length > 0 ? `(${filters.techStack.length})` : ""}`}
          expanded={expandedSections.has("tech")}
          onToggle={() => toggleSection("tech")}
        >
          <div className="flex flex-wrap gap-1.5 pt-2">
            {TECH_STACKS.map((tech) => (
              <FilterChip
                key={tech}
                active={filters.techStack.includes(tech)}
                onClick={() => toggleTech(tech)}
              >
                {tech}
              </FilterChip>
            ))}
          </div>
        </FilterSection>

        {/* Company Size */}
        <FilterSection
          id="size"
          icon={Users}
          label="Company Size"
          expanded={expandedSections.has("size")}
          onToggle={() => toggleSection("size")}
        >
          <div className="flex flex-col gap-1.5 pt-2">
            {EMPLOYEE_RANGES.map(({ label, min, max }) => {
              const active = filters.minEmployees === min && filters.maxEmployees === max;
              return (
                <button
                  key={label}
                  onClick={() =>
                    update(
                      active
                        ? { minEmployees: 0, maxEmployees: 100000 }
                        : { minEmployees: min, maxEmployees: max }
                    )
                  }
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 rounded-xl text-sm transition-all",
                    active
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent"
                  )}
                >
                  <span>{label} employees</span>
                  {active && <span className="text-xs">✓</span>}
                </button>
              );
            })}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function FilterSection({
  id, icon: Icon, label, expanded, onToggle, children,
}: {
  id: string;
  icon: React.ElementType;
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/8 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-primary" />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          className="text-muted-foreground text-xs"
        >
          ▼
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden px-4 pb-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({
  children, active, onClick, activeColor,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  activeColor?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
        active
          ? activeColor
            ? activeColor
            : "bg-primary/20 text-primary border-primary/30"
          : "text-muted-foreground border-white/10 hover:text-foreground hover:border-white/20 hover:bg-white/5"
      )}
    >
      {children}
    </motion.button>
  );
}
