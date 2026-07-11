import { useState, useEffect } from 'react';

export interface Contact {
  id: string;
  name: string;
  role: string;
  linkedin: string;
}

export interface CompanyNotesData {
  notes: string;
  linkedIns?: string[]; // Deprecated, kept for migration
  contacts: Contact[];
  careerPage: string;
}

const DEFAULT_NOTES: CompanyNotesData = {
  notes: '',
  contacts: [],
  careerPage: '',
};

export function useCompanyNotes(slug: string) {
  const [data, setData] = useState<CompanyNotesData>(DEFAULT_NOTES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`scoutit-notes-${slug}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Migration logic: convert old linkedIns array to contacts
        if (parsed.linkedIns && (!parsed.contacts || parsed.contacts.length === 0)) {
          parsed.contacts = parsed.linkedIns.map((url: string) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: "Unknown",
            role: "",
            linkedin: url
          }));
          // optionally delete linkedIns to clean up, but keeping it is fine
        }
        
        setData({ ...DEFAULT_NOTES, ...parsed });
      }
    } catch (e) {
      console.error('Failed to load notes from localStorage:', e);
    }
    setIsLoaded(true);
  }, [slug]);

  // Save to localStorage when data changes
  const updateData = (newData: Partial<CompanyNotesData>) => {
    const updated = { ...data, ...newData };
    setData(updated);
    try {
      localStorage.setItem(`scoutit-notes-${slug}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save notes to localStorage:', e);
    }
  };

  return {
    data,
    updateData,
    isLoaded,
  };
}
