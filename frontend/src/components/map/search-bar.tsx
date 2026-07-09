"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin, Building2, SlidersHorizontal, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Fuse from "fuse.js";
import { Company } from "@/lib/mock-data";

interface SearchBarProps {
  onCitySelect: (city: string) => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  companies?: Company[];
  onCompanySelect?: (company: Company) => void;
}

const CITIES = [
  "Bengaluru", "Noida", "Hyderabad", "Pune", "Chennai",
  "Mumbai", "Gurugram", "Delhi", "Kochi", "Chandigarh",
  "Kolkata", "Ahmedabad", "Jaipur", "Indore", "Coimbatore",
];

export function SearchBar({ onCitySelect, onToggleSidebar, sidebarOpen, companies = [], onCompanySelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Fuse instances
  const cityFuse = useMemo(() => new Fuse(CITIES, { threshold: 0.3 }), []);
  const companyFuse = useMemo(() => new Fuse(companies, {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'tech_stack', weight: 1 },
      { name: 'company_type', weight: 0.5 },
    ],
    threshold: 0.3,
    ignoreLocation: true,
  }), [companies]);

  // Compute search results dynamically
  const citySuggestions = useMemo(() => {
    if (!query) return CITIES.slice(0, 4);
    return cityFuse.search(query).map(r => r.item).slice(0, 4);
  }, [query, cityFuse]);

  const companySuggestions = useMemo(() => {
    if (!query) return companies.slice(0, 4);
    return companyFuse.search(query).map(r => r.item).slice(0, 6); // show up to 6 companies
  }, [query, companyFuse, companies]);

  const hasSuggestions = query.length >= 1 && (citySuggestions.length > 0 || companySuggestions.length > 0);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-3">
        {/* Sidebar toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
          className={cn(
            "w-10 h-10 rounded-full border transition-all flex-shrink-0 flex items-center justify-center",
            sidebarOpen
              ? "bg-primary text-white border-primary/40"
              : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-white/10"
          )}
          title="Toggle filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </motion.button>

        {/* Search input */}
        <div className="relative flex-1 group z-50">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search city, company, or tech stack…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className={cn(
              "w-full sm:w-[260px] md:w-[360px] h-10 pl-10 pr-10 rounded-full text-sm font-medium",
              "bg-black/20 border border-white/10",
              "text-foreground placeholder:text-muted-foreground/70",
              "focus:outline-none focus:border-primary/50 focus:bg-black/40 focus:ring-1 focus:ring-primary/20",
              "transition-all shadow-lg"
            )}
            id="map-search"
            aria-label="Search companies, cities, or tech stacks"
            aria-expanded={open}
            aria-autocomplete="list"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setOpen(false); inputRef.current?.focus(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown suggestions */}
      <AnimatePresence>
        {open && hasSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-3 left-0 right-0 glass-dark border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-2xl z-50 max-h-[400px] overflow-y-auto"
          >
            {citySuggestions.length > 0 && (
              <div>
                <div className="px-4 pt-3 pb-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Cities
                </div>
                {citySuggestions.map((city) => (
                  <button
                    key={city}
                    onClick={() => {
                      setQuery(city);
                      setOpen(false);
                      onCitySelect(city);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
                  >
                    <span>{city}</span>
                  </button>
                ))}
              </div>
            )}

            {companySuggestions.length > 0 && (
              <div className={cn("pb-2", citySuggestions.length > 0 ? "border-t border-white/5" : "")}>
                <div className="px-4 pt-3 pb-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-3 h-3" /> Companies & Tech
                </div>
                {companySuggestions.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setQuery(c.name);
                      setOpen(false);
                      if (onCompanySelect) onCompanySelect(c);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {/* Logo fallback */}
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                         <img 
                            src={`https://www.google.com/s2/favicons?sz=64&domain=${c.domain || c.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'}`}
                            alt={c.name}
                            className="w-full h-full object-contain p-1"
                            onError={(e) => {
                              e.currentTarget.style.setProperty('display', 'none', 'important');
                              if (e.currentTarget.nextElementSibling) {
                                (e.currentTarget.nextElementSibling as HTMLElement).style.setProperty('display', 'flex', 'important');
                              }
                            }}
                          />
                          <div className="hidden w-full h-full flex items-center justify-center text-white font-bold text-xs" style={{ background: c.logo_color }}>
                            {c.logo_initial}
                          </div>
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-medium text-foreground truncate">{c.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{c.location_name}</span>
                      </div>
                    </div>
                    
                    {/* Tech stack badges preview */}
                    <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {c.tech_stack.slice(0, 2).map(tech => (
                        <span key={tech} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] whitespace-nowrap">
                          {tech}
                        </span>
                      ))}
                      {c.tech_stack.length > 2 && <span className="text-[10px] text-muted-foreground">+{c.tech_stack.length - 2}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
