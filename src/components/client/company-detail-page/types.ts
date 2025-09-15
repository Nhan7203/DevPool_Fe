// types/company.ts
export interface Company {
  id: string
  name: string
  logo?: string
  field: string
  location: string
  employeeCount: string
  rating: number
  reviewCount: number
  description: string
  website?: string
  phone?: string
  email?: string
  founded?: string
  specialties: string[]
  benefits: string[]
  companySize: string
  workingHours: string
  workingModel: string
}

export interface Project {
  id: string
  title: string
  company: string
  description: string
  skills: string[]
  teamSize: number
  duration: string
  startDate: string
  location: string
  timeline: string
  budget: number
  budgetType: "fixed" | "hourly"
  applicants: number
  posted: string
  companyLogo?: string
  rating?: number
}