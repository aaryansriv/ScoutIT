import { useState, useEffect } from 'react';

export interface CompanyNotesData {
  notes: string;
  linkedIns: string[];
  careerPage: string;
}

const DEFAULT_NOTES: CompanyNotesData = {
  notes: '',
  linkedIns: [],
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
        setData(JSON.parse(stored));
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
