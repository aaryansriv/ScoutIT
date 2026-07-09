"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin, Building2, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onCitySelect: (city: string) => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

const CITIES = [
  "Bengaluru", "Noida", "Hyderabad", "Pune", "Chennai",
  "Mumbai", "Gurugram", "Delhi", "Kochi", "Chandigarh",
  "Kolkata", "Ahmedabad", "Jaipur", "Indore", "Coimbatore",
];

// Mock companies for autocomplete
const MOCK_SUGGESTIONS = [
  { type: "company" as const, label: "Flipkart", value: "flipkart" },
  { type: "company" as const, label: "Zomato", value: "zomato" },
  { type: "company" as const, label: "PhonePe", value: "phonepe" },
  { type: "company" as const, label: "CRED", value: "cred" },
  { type: "company" as const, label: "Ola", value: "ola" },
  { type: "company" as const, label: "Byju's", value: "byjus" },
];

export function SearchBar({ onCitySelect, onToggleSidebar, sidebarOpen }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const citySuggestions = CITIES.filter((c) =>
    c.toLowerCase().startsWith(query.toLowerCase())
  ).slice(0, 4);

  const companySuggestions = MOCK_SUGGESTIONS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

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
        <div className="relative flex-1 group">
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
              "w-full sm:w-[260px] md:w-[320px] h-10 pl-10 pr-10 rounded-full text-sm font-medium",
              "bg-black/20 border border-white/10",
              "text-foreground placeholder:text-muted-foreground/70",
              "focus:outline-none focus:border-primary/50 focus:bg-black/40 focus:ring-1 focus:ring-primary/20",
              "transition-all"
            )}
            id="map-search"
            aria-label="Search companies, cities, or tech stacks"
            aria-expanded={open}
            aria-autocomplete="list"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-muted-foreground hover:text-foreground"
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
            className="absolute top-full mt-3 left-0 right-0 glass-dark border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-2xl z-50"
          >
            {citySuggestions.length > 0 && (
              <div>
                <div className="px-4 pt-3 pb-1 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Cities
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
                    <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span>{city}</span>
                  </button>
                ))}
              </div>
            )}

            {companySuggestions.length > 0 && (
              <div className="border-t border-white/5">
                <div className="px-4 pt-3 pb-1 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                  Companies
                </div>
                {companySuggestions.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => {
                      setQuery(c.label);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
                  >
                    <Building2 className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                    <span>{c.label}</span>
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
