"use client";

import { motion } from "framer-motion";
import { X, Search, ChevronRight, HelpCircle, Trash2 } from "lucide-react";
import { Company } from "@/lib/mock-data";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CompanySidebarProps {
  companies: Company[];
  city: string;
  onClose: () => void;
  onCompanyClick?: (company: Company) => void;
  onDeleteCompany?: (id: string) => void;
}

export function CompanySidebar({ companies, city, onClose, onCompanyClick, onDeleteCompany }: CompanySidebarProps) {
  const [query, setQuery] = useState("");

  const filtered = companies.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.tech_stack.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  const displayCity = city || "All Cities";

  return (
    <div className="h-full w-[400px] flex flex-col bg-[#111111]/95 backdrop-blur-xl shadow-2xl overflow-hidden border-l border-white/5">
      
      {/* Header */}
      <div className="px-6 py-6 border-b border-white/5 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Startups in {displayCity}</h2>
            <p className="text-sm text-muted-foreground mt-1">Tap a company to view details</p>
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
            placeholder="Search companies or tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-white placeholder:text-muted-foreground"
          />
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-medium">Filter by role</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground rotate-90" />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
        {filtered.map(company => (
          <CompanyCard 
            key={company.id} 
            company={company} 
            onClick={() => onCompanyClick?.(company)} 
            onDelete={(e) => { e.stopPropagation(); onDeleteCompany?.(company.id); }}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            No companies found.
          </div>
        )}
      </div>
      
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
            src={`https://logo.clearbit.com/${company.domain || company.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'}`}
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
                {company.location_name}
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
