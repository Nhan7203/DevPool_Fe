export interface Professional {
  id: string;
  name: string;
  title: string;
  avatar: string;
  location: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  skills: Array<{ name: string; level: 'Cơ bản' | 'Khá' | 'Giỏi' | 'Chuyên gia' }>;
  availability: 'available' | 'busy' | 'unavailable';
  completedProjects: number;
  description: string;
  isOnline: boolean;
  experience: number;
  category: string;
  languages: string[];
  certifications: string[];
  responseTime: string;
  successRate: number;
}