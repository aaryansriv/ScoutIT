"use client";

import { useState } from "react";
import { Company } from "@/lib/mock-data";
import { useCompanyNotes, Contact } from "@/hooks/use-company-notes";
import { 
  Building2, MapPin, Users, 
  Briefcase, ExternalLink, Link as LinkIcon, Save, Plus, Trash2, Globe, Minimize2, X, ChevronLeft, ChevronRight 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CompanyLogo } from "@/components/ui/company-logo";

interface ProfileOverlayProps {
  companies: Company[];
  activeIndex: number;
  onNext: () => void;
  onPrev: () => void;
  onMinimize: () => void;
  onClose: (id: string) => void;
}

export function ProfileOverlay({ 
  companies, 
  activeIndex, 
  onNext, 
  onPrev, 
  onMinimize,
  onClose
}: ProfileOverlayProps) {
  const company = companies[activeIndex];
  const { data, updateData, isLoaded } = useCompanyNotes(company?.slug || "");
  
  const [newContact, setNewContact] = useState({ name: "", role: "", linkedin: "" });
  const [isAddingContact, setIsAddingContact] = useState(false);

  if (!company) return null;

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.linkedin.trim()) return;
    
    let url = newContact.linkedin.trim();
    if (!url.startsWith("http")) url = "https://" + url;
    
    const contact: Contact = {
      id: Math.random().toString(36).substr(2, 9),
      name: newContact.name.trim() || "Unknown",
      role: newContact.role.trim() || "Employee",
      linkedin: url
    };
    
    updateData({ contacts: [...(data.contacts || []), contact] });
    setNewContact({ name: "", role: "", linkedin: "" });
    setIsAddingContact(false);
  };

  const handleRemoveContact = (id: string) => {
    const updated = (data.contacts || []).filter(c => c.id !== id);
    updateData({ contacts: updated });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute inset-x-4 bottom-4 top-24 z-40 flex justify-center pointer-events-none"
    >
      <div className="w-full max-w-7xl h-full flex flex-col pointer-events-auto bg-[#050505]/90 backdrop-blur-2xl rounded-t-[2rem] rounded-b-2xl border border-white/10 shadow-2xl overflow-hidden shadow-blue-900/20">
        
        {/* Overlay Header & Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button 
                onClick={onPrev}
                disabled={companies.length <= 1}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-slate-400 min-w-[3rem] text-center">
                {activeIndex + 1} / {companies.length}
              </span>
              <button 
                onClick={onNext}
                disabled={companies.length <= 1}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="h-4 w-px bg-white/20 mx-2" />
            <h3 className="text-sm font-semibold text-white truncate max-w-[200px]">{company.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={onMinimize}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title="Minimize to Dock"
            >
              <Minimize2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onClose(company.id)}
              className="p-2 rounded-lg hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-colors"
              title="Close Profile"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Company Profile & Contacts */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              
              {/* Premium Hero Section */}
              <section 
                className="relative p-6 md:p-8 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl"
                style={{ 
                  background: `linear-gradient(145deg, rgba(20,20,20,0.8) 0%, rgba(10,10,10,0.9) 100%)` 
                }}
              >
                {/* Ambient Background Glow */}
                <div 
                  className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none"
                  style={{ backgroundColor: company.logo_color || "#3b82f6" }}
                />
                
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                  {/* Premium Logo Wrapper */}
                  <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold shadow-2xl flex-shrink-0 border border-white/20 bg-white overflow-hidden relative group">
                    <CompanyLogo 
                      url={company.logo_url || `https://logo.clearbit.com/${company.domain || company.name.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'}`}
                      name={company.name}
                      fallbackInitial={company.logo_initial}
                      fallbackColor={company.logo_color}
                      className="w-full h-full object-contain p-3 z-0 transition-transform duration-500 group-hover:scale-110"
                      iconClassName="w-10 h-10"
                    />
                  </div>
                  
                  <div className="flex-1 pt-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{company.name}</h1>
                      {company.hiring && (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                          Actively Hiring
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400 mb-6">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                        <Building2 className="w-3.5 h-3.5 text-slate-300" />
                        <span className="capitalize text-slate-300">{company.company_type}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
                        <MapPin className="w-3.5 h-3.5 text-slate-300" />
                        <span className="text-slate-300">{company.location_name}, {company.city}</span>
                      </div>
                      {company.domain && (
                        <a href={`https://${company.domain}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:text-white transition-colors">
                          <Globe className="w-3.5 h-3.5" />
                          <span>{company.domain}</span>
                        </a>
                      )}
                    </div>
                    
                    <div className="flex gap-4">
                      <button className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        View {company.roles_count} Open Roles
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Employee Contacts Data Table */}
              <section className="rounded-[2rem] border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-xl">
                <div className="p-6 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      Employee Contacts
                    </h2>
                  </div>
                  {!isAddingContact && (
                    <button 
                      onClick={() => setIsAddingContact(true)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Contact
                    </button>
                  )}
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Contact Name</th>
                        <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">LinkedIn</th>
                        <th className="px-6 py-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {isLoaded && (!data.contacts || data.contacts.length === 0) && !isAddingContact && (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-xs">
                            No contacts saved yet.
                          </td>
                        </tr>
                      )}
                      
                      {isLoaded && data.contacts?.map((contact) => (
                        <tr key={contact.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-3">
                            <span className="font-medium text-white text-sm">{contact.name}</span>
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-slate-300 text-xs px-2 py-0.5 rounded bg-white/5 border border-white/5">{contact.role || '—'}</span>
                          </td>
                          <td className="px-6 py-3">
                            <a 
                              href={contact.linkedin} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <LinkIcon className="w-3 h-3" />
                              <span className="max-w-[120px] truncate">{contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
                            </a>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button 
                              onClick={() => handleRemoveContact(contact.id)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {/* Add Contact Form Row */}
                      {isAddingContact && (
                        <tr className="bg-blue-500/5 border-t border-blue-500/20">
                          <td colSpan={4} className="px-6 py-3">
                            <form onSubmit={handleAddContact} className="flex flex-wrap items-center gap-3">
                              <input 
                                type="text"
                                value={newContact.name}
                                onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                                placeholder="Name"
                                className="flex-1 min-w-[120px] bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500 text-white placeholder:text-slate-500"
                                autoFocus
                              />
                              <input 
                                type="text"
                                value={newContact.role}
                                onChange={(e) => setNewContact({...newContact, role: e.target.value})}
                                placeholder="Role"
                                className="flex-1 min-w-[120px] bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500 text-white placeholder:text-slate-500"
                              />
                              <input 
                                type="url"
                                value={newContact.linkedin}
                                onChange={(e) => setNewContact({...newContact, linkedin: e.target.value})}
                                placeholder="LinkedIn URL"
                                required
                                className="flex-[2] min-w-[150px] bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-blue-500 text-white placeholder:text-slate-500"
                              />
                              <div className="flex items-center gap-1.5 justify-end">
                                <button 
                                  type="button"
                                  onClick={() => setIsAddingContact(false)}
                                  className="px-2 py-1.5 text-xs font-medium text-slate-400 hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button 
                                  type="submit"
                                  disabled={!newContact.linkedin.trim()}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                                >
                                  Save
                                </button>
                              </div>
                            </form>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

            </div>

            {/* Right Column: Private Workspace */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-0 p-6 rounded-[2rem] border border-blue-500/20 bg-[#0A0A0A] shadow-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
                    Private Workspace
                  </h2>
                  <p className="text-xs text-slate-400">
                    Data securely stored only in your local browser.
                  </p>
                </div>

                <div className="mb-6 group">
                  <label className="block text-[10px] font-semibold text-slate-300 mb-2 flex items-center gap-1.5 tracking-wider uppercase">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    Custom Career Page
                  </label>
                  <div className="relative">
                    <input 
                      type="url"
                      value={data?.careerPage || ""}
                      onChange={(e) => updateData({ careerPage: e.target.value })}
                      placeholder="https://careers.example.com"
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder:text-slate-600 group-hover:border-white/20"
                    />
                    {data?.careerPage && (
                      <a 
                        href={data.careerPage} 
                        target="_blank" 
                        rel="noreferrer"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-white transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="mb-2 group">
                  <label className="block text-[10px] font-semibold text-slate-300 mb-2 flex items-center gap-1.5 tracking-wider uppercase">
                    <Save className="w-3.5 h-3.5 text-blue-400" />
                    Personal Notes
                  </label>
                  <textarea 
                    value={data?.notes || ""}
                    onChange={(e) => updateData({ notes: e.target.value })}
                    placeholder="Thoughts, interview prep, referrals..."
                    rows={8}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-white placeholder:text-slate-600 resize-none group-hover:border-white/20 custom-scrollbar leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
