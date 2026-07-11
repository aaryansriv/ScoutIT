import mockData from './mock-companies-v2.json';
import landmarkData from './landmarks.json';

export type Company = {
  city: string;
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  company_type: string;
  hiring: boolean;
  logo_initial: string;
  logo_color: string;
  roles_count: number;
  tech_stack: string[];
  location_name: string;
  domain?: string;
  logo_url?: string;
};

export type Landmark = {
  id: string;
  name: string;
  city: string;
  type: 'historical' | 'mall' | 'landmark';
  lat: number;
  lng: number;
  description: string;
};

export const MOCK_COMPANIES: Company[] = mockData as Company[];
export const LANDMARKS: Landmark[] = landmarkData as Landmark[];
