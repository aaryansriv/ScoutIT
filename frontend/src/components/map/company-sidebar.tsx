"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ChevronRight, HelpCircle, Trash2, ArrowLeft, MapPin, Briefcase, ExternalLink } from "lucide-react";
import { Company } from "@/lib/mock-data";
import Fuse from "fuse.js";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { CitySelector, CityTrigger, CityContent } from "./city-selector";

interface CompanySidebarProps {
  companies: Company[];
  allCompanies?: Company[];
  city: string;
  onCityChange?: (city: string) => void;
  onClose: () => void;
  onCompanyClick?: (company: Company) => void;
  onViewProfile?: (company: Company) => void;
  onDeleteCompany?: (id: string) => void;
}

export function CompanySidebar({ companies, allCompanies = [], city, onCityChange, onClose, onCompanyClick, onViewProfile, onDeleteCompany }: CompanySidebarProps) {
  const [query, setQuery] = useState("");
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);

  const companyFuse = useMemo(() => new Fuse(allCompanies, {
    keys: [
      { name: 'name', weight: 2 },
      { name: 'tech_stack', weight: 1 },
      { name: 'company_type', weight: 0.5 },
    ],
    threshold: 0.3,
    ignoreLocation: true,
  }), [allCompanies]);

  const filtered = useMemo(() => {
    if (!query) return companies;
    return companyFuse.search(query).map(r => r.item);
  }, [query, companies, companyFuse]);



  return (
    <div className="h-full w-[400px] flex flex-col bg-[#111111]/95 backdrop-blur-xl shadow-2xl overflow-hidden border-l border-white/5 relative">
      <AnimatePresence initial={false} mode="wait">
        {!activeCompany ? (
          <motion.div 
            key="list"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full absolute inset-0"
          >
            {/* Header */}
            <div className="px-6 py-6 border-b border-white/5 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col gap-1">
                  {query.length > 0 ? (
                    <h2 className="text-xl font-bold text-white tracking-tight">Search results</h2>
                  ) : (
                    <CitySelector 
                      cities={[
                        { id: "", name: "All Cities" },
                        ...Array.from(new Set(allCompanies.map(c => c.city))).sort().map(c => ({ id: c, name: c }))
                      ]}
                      selectedCityId={city || ""}
                      onCityChange={(selected) => onCityChange?.(selected.id)}
                    >
                      <CityTrigger />
                      <CityContent />
                    </CitySelector>
                  )}
                  <p className="text-sm text-muted-foreground mt-0.5">Tap a company to view details</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
                    <HelpCircle className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search globally across all cities..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-white placeholder:text-muted-foreground"
                />
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">
                  {query.length > 0 ? `Found ${filtered.length} matches` : "Filter by role"}
                </span>
                {!query && <ChevronRight className="w-4 h-4 text-muted-foreground rotate-90" />}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
              {filtered.map(company => (
                <CompanyCard 
                  key={company.id} 
                  company={company} 
                  onClick={() => {
                    setActiveCompany(company);
                    onCompanyClick?.(company);
                  }} 
                  onDelete={(e) => { e.stopPropagation(); onDeleteCompany?.(company.id); }}
                />
              ))}
              {filtered.length === 0 && (
                <div className="text-center text-muted-foreground py-10">
                  No companies found.
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full absolute inset-0 bg-[#111111]"
          >
            {/* Profile Header */}
            <div className="px-6 py-6 border-b border-white/5 shrink-0 flex items-center justify-between">
              <button 
                onClick={() => {
                  setActiveCompany(null);
                  // Optionally re-center map to city if needed, but keeping current zoom is fine
                }}
                className="flex items-center text-sm font-medium text-muted-foreground hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to list
              </button>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Profile Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <div className="flex items-start gap-5 mb-8">
                {/* Logo */}
                <div className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center bg-white shadow-xl overflow-hidden border border-white/10">
                  <img 
                    src={activeCompany.logo_url || `https://www.google.com/s2/favicons?sz=128&domain=${activeCompany.domain || activeCompany.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'}`}
                    alt={activeCompany.name}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      e.currentTarget.style.setProperty('display', 'none', 'important');
                      if (e.currentTarget.nextElementSibling) {
                        (e.currentTarget.nextElementSibling as HTMLElement).style.setProperty('display', 'flex', 'important');
                      }
                    }}
                  />
                  <div className="hidden w-full h-full flex items-center justify-center text-white font-bold text-2xl" style={{ background: activeCompany.logo_color || "#3b82f6" }}>
                    {activeCompany.logo_initial}
                  </div>
                </div>
                
                {/* Title & Info */}
                <div className="pt-1">
                  <h2 className="text-2xl font-bold text-white tracking-tight">{activeCompany.name}</h2>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1.5 text-primary" />
                      {activeCompany.location_name}, {activeCompany.city}
                    </div>
                    {activeCompany.domain && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <ExternalLink className="w-4 h-4 mr-1.5 text-blue-400" />
                        <a href={`https://${activeCompany.domain}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                          {activeCompany.domain}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                {/* Stats / Quick Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-white">{activeCompany.roles_count}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Open Roles</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-white capitalize">{activeCompany.company_type}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Company Type</span>
                  </div>
                </div>

                {/* About */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3 tracking-wide uppercase">About</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {activeCompany.name} is a leading {activeCompany.company_type} operating in {activeCompany.location_name}, {activeCompany.city}. 
                    They are currently {activeCompany.hiring ? 'actively hiring for multiple positions' : 'evaluating candidates'} across various tech stacks and domains.
                  </p>
                </div>
                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4">
                  <button className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center shadow-lg shadow-primary/20">
                    <Briefcase className="w-5 h-5 mr-2" />
                    View {activeCompany.roles_count} Open Roles
                  </button>
                  <button 
                    onClick={() => onViewProfile?.(activeCompany)}
                    className="w-full bg-white/5 text-white font-medium py-3.5 rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center border border-white/10"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CompanyCard({ company, onClick, onDelete }: { company: Company; onClick?: () => void; onDelete?: (e: React.MouseEvent) => void }) {
  const bg_color = company.logo_color || "#3b82f6";
  
  return (
    <motion.div 
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="bg-[#181818] rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors cursor-pointer group"
    >
      <div className="flex gap-4">
        {/* Logo */}
        <div 
          className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center bg-white shadow-lg overflow-hidden border border-white/10"
        >
          <img 
            src={company.logo_url || `https://www.google.com/s2/favicons?sz=128&domain=${company.domain || company.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'}`}
            alt={company.name}
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              e.currentTarget.style.setProperty('display', 'none', 'important');
              if (e.currentTarget.nextElementSibling) {
                (e.currentTarget.nextElementSibling as HTMLElement).style.setProperty('display', 'flex', 'important');
              }
            }}
          />
          <div className="hidden w-full h-full flex items-center justify-center text-white font-bold text-xl" style={{ background: bg_color }}>
            {company.logo_initial}
          </div>
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-white truncate pr-2">{company.name}</h3>
              <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {company.location_name}, {company.city}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-semibold text-white bg-white/10 px-2 py-0.5 rounded-full">
                {company.roles_count} roles
              </span>
              <button 
                onClick={onDelete}
                className="w-6 h-6 flex items-center justify-center rounded bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 ml-1"
                title="Delete Company"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
            </div>
          </div>
          
          {/* Tags */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar mask-gradient-r">
            {company.tech_stack.map((tag, i) => (
              <span key={i} className="text-[10px] font-medium text-white/80 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                {tag}
              </span>
            ))}
            {company.roles_count > company.tech_stack.length && (
              <span className="text-[10px] text-muted-foreground pl-1">
                +{company.roles_count - company.tech_stack.length} more
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
