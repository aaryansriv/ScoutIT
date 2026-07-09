import mockData from './mock-companies.json';

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
};

export const MOCK_COMPANIES: Company[] = mockData as Company[];
