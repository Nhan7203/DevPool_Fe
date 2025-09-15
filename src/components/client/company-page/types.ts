export interface Company {
  id: string;
  name: string;
  field: string;
  logo: string;
  location: string;
  employees: string;
  employeeCount: number;
  rating: number;
  reviews: number;
  description: string;
  founded: number;
  website: string;
  isVerified: boolean;
  openPositions: number;
  benefits: string[];
  workingHours: string;
  companyType: "Startup" | "SME" | "Enterprise" | "MNC";
}
