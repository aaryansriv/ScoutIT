"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { FilterSidebar } from "@/components/map/filter-sidebar";
import { SearchBar } from "@/components/map/search-bar";
import { CityQuickNav } from "@/components/map/city-quick-nav";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { CompanySidebar } from "@/components/map/company-sidebar";
import { Company, MOCK_COMPANIES } from "@/lib/mock-data";
import { List } from "lucide-react";

// Leaflet must be loaded client-side only (no SSR)
const MapView = dynamic(() => import("@/components/map/map-view"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-sm">Loading map…</p>
      </div>
    </div>
  ),
});

export interface FilterState {
  city: string;
  companyType: string;
  industry: string;
  hiring: boolean | null;
  internships: boolean | null;
  techStack: string[];
  minEmployees: number;
  maxEmployees: number;
}

const DEFAULT_FILTERS: FilterState = {
  city: "",
  companyType: "",
  industry: "",
  hiring: null,
  internships: null,
  techStack: [],
  minEmployees: 0,
  maxEmployees: 100000,
};

export default function MapPage() {
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleDeleteCompany = (id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  };

  // Filter companies based on active filters
  const filteredCompanies = companies.filter((c) => {
    if (filters.city && c.city !== filters.city) {
      return false;
    }
    if (filters.companyType && c.company_type !== filters.companyType) return false;
    if (filters.hiring === true && !c.hiring) return false;
    if (filters.hiring === false && c.hiring) return false;
    return true;
  });

  // Automatically open right sidebar if city is selected
  useEffect(() => {
    if (filters.city) {
      setRightSidebarOpen(true);
    }
  }, [filters.city]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black relative">
      {/* Map — fills space and establishes stacking context */}
      <div className="absolute inset-0 z-0">
        <MapView 
          companies={filteredCompanies} 
          filters={filters} 
          selectedCompany={selectedCompany} 
          onDeleteCompany={handleDeleteCompany} 
        />
      </div>

      <Navbar
        activeCity={filters.city}
        onCitySelect={(city) => setFilters((f) => ({ ...f, city }))}
        searchBar={
          <SearchBar
            onCitySelect={(city) => setFilters((f) => ({ ...f, city }))}
            onToggleSidebar={() => setSidebarOpen((o) => !o)}
            sidebarOpen={sidebarOpen}
          />
        }
      />

      {/* Floating UI Layer */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        
        {/* Filter sidebar - floating panel */}
        <motion.aside
          initial={{ x: -400, opacity: 0 }}
          animate={{ x: sidebarOpen ? 0 : -400, opacity: sidebarOpen ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="absolute left-6 top-28 bottom-24 w-[340px] pointer-events-auto shadow-2xl rounded-3xl overflow-hidden border border-white/10"
        >
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onClose={() => setSidebarOpen(false)}
          />
        </motion.aside>

        {/* Right sidebar - company list */}
        <motion.aside
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: rightSidebarOpen ? 0 : 400, opacity: rightSidebarOpen ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className="absolute right-0 top-0 bottom-0 pointer-events-auto z-40"
        >
          <CompanySidebar 
            companies={filteredCompanies} 
            city={filters.city} 
            onClose={() => setRightSidebarOpen(false)} 
            onCompanyClick={(company) => setSelectedCompany(company)}
            onDeleteCompany={handleDeleteCompany}
          />
        </motion.aside>

        {/* Right sidebar toggle button (visible when closed) */}
        <AnimatePresence>
          {!rightSidebarOpen && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={() => setRightSidebarOpen(true)}
              className="absolute right-6 top-28 w-12 h-12 rounded-full glass-dark backdrop-blur-xl shadow-2xl border border-white/10 flex items-center justify-center text-muted-foreground hover:text-white pointer-events-auto transition-colors z-30"
            >
              <List className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
