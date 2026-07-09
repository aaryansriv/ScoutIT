"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MOCK_COMPANIES } from "@/lib/mock-data";
import { useCompanyNotes } from "@/hooks/use-company-notes";
import { 
  ArrowLeft, Building2, MapPin, Code2, Users, 
  Briefcase, ExternalLink, Link, Save, Plus, X 
} from "lucide-react";
import { motion } from "framer-motion";

export default function CompanyPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const company = MOCK_COMPANIES.find((c) => c.slug === slug);
  const { data, updateData, isLoaded } = useCompanyNotes(slug);
  
  const [newLinkedin, setNewLinkedin] = useState("");

  if (!company) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-4 text-white">
        <h1 className="text-2xl font-bold">Company Not Found</h1>
        <button onClick={() => router.push("/map")} className="text-blue-500 hover:underline">
          Return to Map
        </button>
      </div>
    );
  }

  const handleAddLinkedin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkedin.trim()) return;
    
    // Check if valid URL format roughly
    let url = newLinkedin.trim();
    if (!url.startsWith("http")) {
      url = "https://" + url;
    }
    
    updateData({ linkedIns: [...data.linkedIns, url] });
    setNewLinkedin("");
  };

  const handleRemoveLinkedin = (index: number) => {
    const updated = [...data.linkedIns];
    updated.splice(index, 1);
    updateData({ linkedIns: updated });
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <button 
            onClick={() => router.push("/map")}
            className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Map
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Company Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Hero Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-8 rounded-2xl border border-white/10 overflow-hidden"
            style={{ 
              background: `linear-gradient(145deg, rgba(20,20,20,1) 0%, rgba(10,10,10,1) 100%)` 
            }}
          >
            {/* Background Glow */}
            <div 
              className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[100px] opacity-20"
              style={{ backgroundColor: company.logo_color || "#3b82f6" }}
            />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
              <div 
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold shadow-2xl flex-shrink-0 border border-white/20"
                style={{ backgroundColor: company.logo_color || "#3b82f6", color: "#fff" }}
              >
                {company.logo_initial || <Building2 className="w-10 h-10" />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white tracking-tight">{company.name}</h1>
                  {company.hiring && (
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      Actively Hiring
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-slate-400 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    <span className="capitalize">{company.company_type}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{company.location_name}</span>
                  </div>
                  {company.roles_count > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" />
                      <span>{company.roles_count} Open Roles</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Tech Stack */}
          {company.tech_stack && company.tech_stack.length > 0 && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 rounded-2xl border border-white/5 bg-white/[0.02]"
            >
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-400" />
                Tech Stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {company.tech_stack.map((tech) => (
                  <span 
                    key={tech} 
                    className="px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors cursor-default"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.section>
          )}

        </div>

        {/* Right Column: Private Workspace */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="p-6 rounded-2xl border border-blue-500/20 bg-blue-500/[0.02] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              Private Workspace
            </h2>
            <p className="text-sm text-slate-400 mb-8">
              Data saved here is private and stored only on your browser.
            </p>

            {/* Career Page Link */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Custom Career Page
              </label>
              <input 
                type="url"
                value={data.careerPage}
                onChange={(e) => updateData({ careerPage: e.target.value })}
                placeholder="https://careers.example.com"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
              />
            </div>

            {/* General Notes */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Save className="w-4 h-4" />
                Personal Notes
              </label>
              <textarea 
                value={data.notes}
                onChange={(e) => updateData({ notes: e.target.value })}
                placeholder="Thoughts on this company, interview prep, referrals..."
                rows={5}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600 resize-y"
              />
            </div>

            {/* Employee LinkedIns */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Employee Contacts
              </label>
              
              <div className="space-y-3 mb-4">
                {data.linkedIns.map((link, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-3 group hover:bg-white/10 transition-colors">
                    <a 
                      href={link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 truncate"
                    >
                      <Link className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{link.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
                    </a>
                    <button 
                      onClick={() => handleRemoveLinkedin(i)}
                      className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {data.linkedIns.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-2">No contacts saved yet.</p>
                )}
              </div>

              <form onSubmit={handleAddLinkedin} className="flex gap-2">
                <input 
                  type="text"
                  value={newLinkedin}
                  onChange={(e) => setNewLinkedin(e.target.value)}
                  placeholder="LinkedIn Profile URL"
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!newLinkedin.trim()}
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        </motion.div>
      </main>
    </div>
  );
}
