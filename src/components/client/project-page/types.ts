export interface Project {
  id: string;
  name: string;
  description: string;
  companyName: string;
  companyLogo?: string;
  field: string;
  location: string;
  projectType: string;
  rating: number;
  teamSize: number;
  openPositions: number;
  technologies: string[];
  startDate: string;
  duration: string;
  benefits: string[];
}