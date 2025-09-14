import { useState, useMemo } from 'react';
import { Search, Filter, MapPin, Star, Clock, CheckCircle, MessageCircle, Heart, ChevronDown, X, Briefcase, DollarSign } from 'lucide-react';

interface Professional {
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

const mockProfessionals: Professional[] = [
  {
    id: '1',
    name: 'Nguyễn Thành Đạt',
    title: 'Senior Full-stack Developer',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    location: 'Hồ Chí Minh',
    hourlyRate: 800000,
    rating: 4.9,
    reviewCount: 127,
    skills: [
      { name: 'ReactJS', level: 'Chuyên gia' },
      { name: 'NodeJS', level: 'Chuyên gia' },
      { name: 'MongoDB', level: 'Giỏi' },
      { name: 'TypeScript', level: 'Giỏi' }
    ],
    availability: 'available',
    completedProjects: 89,
    description: 'Chuyên gia phát triển ứng dụng web với 8+ năm kinh nghiệm. Đã hoàn thành 200+ dự án thành công cho các startup và doanh nghiệp lớn.',
    isOnline: true,
    experience: 8,
    category: 'Web Development',
    languages: ['Tiếng Việt', 'English'],
    certifications: ['AWS Certified', 'React Certified'],
    responseTime: '< 1 giờ',
    successRate: 98
  },
  {
    id: '2',
    name: 'Trần Minh Anh',
    title: 'Mobile App Developer',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    location: 'Hà Nội',
    hourlyRate: 750000,
    rating: 4.8,
    reviewCount: 89,
    skills: [
      { name: 'Flutter', level: 'Chuyên gia' },
      { name: 'React Native', level: 'Giỏi' },
      { name: 'Firebase', level: 'Chuyên gia' },
      { name: 'Kotlin', level: 'Khá' }
    ],
    availability: 'busy',
    completedProjects: 65,
    description: 'Chuyên gia phát triển ứng dụng di động cross-platform. Tập trung vào UX/UI và performance optimization cho mobile apps.',
    isOnline: false,
    experience: 6,
    category: 'Mobile Development',
    languages: ['Tiếng Việt', 'English', '日本語'],
    certifications: ['Google Flutter Certified'],
    responseTime: '< 2 giờ',
    successRate: 95
  },
  {
    id: '3',
    name: 'Lê Hoàng Nam',
    title: 'DevOps Engineer',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    location: 'Đà Nẵng',
    hourlyRate: 900000,
    rating: 4.9,
    reviewCount: 156,
    skills: [
      { name: 'AWS', level: 'Chuyên gia' },
      { name: 'Docker', level: 'Chuyên gia' },
      { name: 'Kubernetes', level: 'Giỏi' },
      { name: 'Terraform', level: 'Giỏi' }
    ],
    availability: 'available',
    completedProjects: 112,
    description: 'Chuyên gia DevOps với kinh nghiệm triển khai hệ thống cloud-native. Đảm bảo tính ổn định và bảo mật cho infrastructure.',
    isOnline: true,
    experience: 10,
    category: 'DevOps',
    languages: ['Tiếng Việt', 'English'],
    certifications: ['AWS Solutions Architect', 'Kubernetes Certified'],
    responseTime: '< 30 phút',
    successRate: 99
  },
  {
    id: '4',
    name: 'Phạm Thị Lan',
    title: 'UI/UX Designer',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    location: 'Hồ Chí Minh',
    hourlyRate: 600000,
    rating: 4.7,
    reviewCount: 73,
    skills: [
      { name: 'Figma', level: 'Chuyên gia' },
      { name: 'Adobe XD', level: 'Giỏi' },
      { name: 'Sketch', level: 'Giỏi' },
      { name: 'Prototyping', level: 'Chuyên gia' }
    ],
    availability: 'available',
    completedProjects: 45,
    description: 'Designer chuyên về UX/UI với passion tạo ra những trải nghiệm người dùng tuyệt vời. Có kinh nghiệm với các startup và enterprise.',
    isOnline: true,
    experience: 5,
    category: 'UI/UX Design',
    languages: ['Tiếng Việt', 'English'],
    certifications: ['Google UX Design Certificate'],
    responseTime: '< 1 giờ',
    successRate: 96
  },
  {
    id: '5',
    name: 'Võ Minh Tuấn',
    title: 'Python Backend Developer',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    location: 'Cần Thơ',
    hourlyRate: 700000,
    rating: 4.8,
    reviewCount: 94,
    skills: [
      { name: 'Python', level: 'Chuyên gia' },
      { name: 'Django', level: 'Chuyên gia' },
      { name: 'PostgreSQL', level: 'Giỏi' },
      { name: 'Redis', level: 'Giỏi' }
    ],
    availability: 'available',
    completedProjects: 78,
    description: 'Backend developer chuyên Python với kinh nghiệm xây dựng API và microservices. Đam mê clean code và system architecture.',
    isOnline: false,
    experience: 7,
    category: 'Backend Development',
    languages: ['Tiếng Việt', 'English'],
    certifications: ['Python Institute Certified'],
    responseTime: '< 3 giờ',
    successRate: 97
  },
  {
    id: '6',
    name: 'Đặng Thị Mai',
    title: 'QA Engineer',
    avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    location: 'Hà Nội',
    hourlyRate: 550000,
    rating: 4.6,
    reviewCount: 67,
    skills: [
      { name: 'Selenium', level: 'Chuyên gia' },
      { name: 'Cypress', level: 'Giỏi' },
      { name: 'Jest', level: 'Giỏi' },
      { name: 'Manual Testing', level: 'Chuyên gia' }
    ],
    availability: 'busy',
    completedProjects: 52,
    description: 'QA Engineer với kinh nghiệm automation testing và manual testing. Đảm bảo chất lượng sản phẩm với test coverage cao.',
    isOnline: true,
    experience: 4,
    category: 'Testing/QA',
    languages: ['Tiếng Việt', 'English'],
    certifications: ['ISTQB Certified'],
    responseTime: '< 2 giờ',
    successRate: 94
  }
];

const categories = ['Tất cả', 'Web Development', 'Mobile Development', 'UI/UX Design', 'DevOps', 'Backend Development', 'Testing/QA'];
const locations = ['Tất cả', 'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ'];
// const availabilityOptions = ['Tất cả', 'available', 'busy', 'unavailable'];
const experienceLevels = ['Tất cả', '1-3 năm', '3-5 năm', '5-8 năm', '8+ năm'];

export default function ProfessionalClientPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedLocation, setSelectedLocation] = useState('Tất cả');
  const [selectedAvailability, setSelectedAvailability] = useState('Tất cả');
  const [selectedExperience, setSelectedExperience] = useState('Tất cả');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState('rating');

  const filteredProfessionals = useMemo(() => {
    const filtered = mockProfessionals.filter(professional => {
      const matchesSearch = professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           professional.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           professional.skills.some(skill => skill.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'Tất cả' || professional.category === selectedCategory;
      const matchesLocation = selectedLocation === 'Tất cả' || professional.location === selectedLocation;
      const matchesAvailability = selectedAvailability === 'Tất cả' || professional.availability === selectedAvailability;
      
      const matchesExperience = selectedExperience === 'Tất cả' || 
        (selectedExperience === '1-3 năm' && professional.experience >= 1 && professional.experience <= 3) ||
        (selectedExperience === '3-5 năm' && professional.experience >= 3 && professional.experience <= 5) ||
        (selectedExperience === '5-8 năm' && professional.experience >= 5 && professional.experience <= 8) ||
        (selectedExperience === '8+ năm' && professional.experience >= 8);

      const matchesRate = (!minRate || professional.hourlyRate >= parseInt(minRate) * 1000) &&
                         (!maxRate || professional.hourlyRate <= parseInt(maxRate) * 1000);

      return matchesSearch && matchesCategory && matchesLocation && matchesAvailability && matchesExperience && matchesRate;
    });

    // Sort professionals
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'rate':
          return a.hourlyRate - b.hourlyRate;
        case 'experience':
          return b.experience - a.experience;
        case 'projects':
          return b.completedProjects - a.completedProjects;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, selectedLocation, selectedAvailability, selectedExperience, minRate, maxRate, sortBy]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-success-600 bg-success-50 border-success-200';
      case 'busy': return 'text-warning-600 bg-warning-50 border-warning-200';
      case 'unavailable': return 'text-error-600 bg-error-50 border-error-200';
      default: return 'text-neutral-600 bg-neutral-50 border-neutral-200';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'available': return 'Sẵn sàng';
      case 'busy': return 'Bận';
      case 'unavailable': return 'Không rảnh';
      default: return 'Không xác định';
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'Chuyên gia': return 'bg-violet-100 text-violet-800 border-violet-200';
      case 'Giỏi': return 'bg-success-100 text-success-800 border-success-200';
      case 'Khá': return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'Cơ bản': return 'bg-neutral-100 text-neutral-800 border-neutral-200';
      default: return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const toggleFavorite = (professionalId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(professionalId)) {
      newFavorites.delete(professionalId);
    } else {
      newFavorites.add(professionalId);
    }
    setFavorites(newFavorites);
  };

  const clearFilters = () => {
    setSelectedCategory('Tất cả');
    setSelectedLocation('Tất cả');
    setSelectedAvailability('Tất cả');
    setSelectedExperience('Tất cả');
    setMinRate('');
    setMaxRate('');
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50/30 to-secondary-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-neutral-900 via-primary-700 to-secondary-700 bg-clip-text text-transparent mb-4">
            Tìm Chuyên Gia IT
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Khám phá hàng nghìn chuyên gia IT tài năng sẵn sàng tham gia dự án của bạn
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-soft border border-neutral-200 p-6 mb-8 animate-slide-up">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, kỹ năng, chuyên môn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-neutral-300 rounded-2xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 hover:border-neutral-400 hover:shadow-soft text-neutral-900 placeholder-neutral-500 text-lg"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-800 font-medium transition-colors duration-300 hover:scale-105 transform"
            >
              <Filter className="w-5 h-5" />
              <span>Bộ lọc nâng cao</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-neutral-600 font-medium">Sắp xếp theo:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
              >
                <option value="rating">Đánh giá cao nhất</option>
                <option value="rate">Giá thấp nhất</option>
                <option value="experience">Kinh nghiệm nhiều nhất</option>
                <option value="projects">Dự án hoàn thành nhiều nhất</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-4 bg-gradient-to-r from-neutral-50 to-primary-50 rounded-2xl border border-neutral-200 animate-slide-down">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Lĩnh vực</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Địa điểm</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                >
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>

              {/* Experience Filter */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Kinh nghiệm</label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                >
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              {/* Rate Range */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Mức lương (k VNĐ/giờ)</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Từ"
                    value={minRate}
                    onChange={(e) => setMinRate(e.target.value)}
                    className="w-full border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                  />
                  <input
                    type="number"
                    placeholder="Đến"
                    value={maxRate}
                    onChange={(e) => setMaxRate(e.target.value)}
                    className="w-full border border-neutral-300 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-error-500 to-error-600 text-white px-4 py-2 rounded-xl hover:from-error-600 hover:to-error-700 transition-all duration-300 shadow-soft hover:shadow-medium transform hover:scale-105"
                >
                  <X className="w-4 h-4" />
                  <span>Xóa bộ lọc</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-neutral-600 font-medium">
            Tìm thấy <span className="font-bold text-primary-600">{filteredProfessionals.length}</span> chuyên gia IT
          </p>
        </div>

        {/* Professionals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProfessionals.map((professional, index) => (
            <div
              key={professional.id}
              className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-soft hover:shadow-strong border border-neutral-200 hover:border-primary-300 p-8 transition-all duration-500 transform hover:scale-102 hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={professional.avatar}
                      alt={professional.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-4 ring-primary-100 group-hover:ring-primary-300 transition-all duration-300"
                    />
                    {professional.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success-500 rounded-full border-2 border-white animate-pulse-gentle"></div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-neutral-900 group-hover:text-primary-700 transition-colors duration-300 mb-1">
                      {professional.name}
                    </h3>
                    <p className="text-neutral-600 font-medium group-hover:text-neutral-700 transition-colors duration-300">
                      {professional.title}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleFavorite(professional.id)}
                  className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 transform ${
                    favorites.has(professional.id)
                      ? 'text-error-500 bg-error-50 hover:bg-error-100'
                      : 'text-neutral-400 hover:text-error-500 hover:bg-error-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${favorites.has(professional.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Location and Rating */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-neutral-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">{professional.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-warning-400 fill-current" />
                    <span className="font-bold text-neutral-900">{professional.rating}</span>
                  </div>
                  <span className="text-neutral-500 text-sm">({professional.reviewCount} đánh giá)</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-neutral-700 mb-6 line-clamp-3 leading-relaxed group-hover:text-neutral-800 transition-colors duration-300">
                {professional.description}
              </p>

              {/* Skills */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {professional.skills.slice(0, 3).map((skill) => (
                    <span
                      key={`${skill.name}-${skill.level}`}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300 hover:scale-105 ${getSkillLevelColor(skill.level)}`}
                    >
                      {skill.name}
                    </span>
                  ))}
                  {professional.skills.length > 3 && (
                    <span className="px-3 py-1.5 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-full border border-neutral-200 hover:bg-neutral-200 transition-colors duration-300">
                      +{professional.skills.length - 3} thêm
                    </span>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border border-primary-200 group-hover:from-primary-100 group-hover:to-primary-200 transition-all duration-300">
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign className="w-4 h-4 text-primary-600 mr-1" />
                    <span className="font-bold text-primary-700">{formatCurrency(professional.hourlyRate)}</span>
                  </div>
                  <span className="text-xs text-primary-600 font-medium">/ giờ</span>
                </div>
                
                <div className="text-center p-3 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl border border-secondary-200 group-hover:from-secondary-100 group-hover:to-secondary-200 transition-all duration-300">
                  <div className="flex items-center justify-center mb-1">
                    <CheckCircle className="w-4 h-4 text-secondary-600 mr-1" />
                    <span className="font-bold text-secondary-700">{professional.completedProjects}</span>
                  </div>
                  <span className="text-xs text-secondary-600 font-medium">dự án</span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex items-center justify-between mb-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-neutral-500" />
                  <span className="text-neutral-600 font-medium">{professional.experience} năm KN</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  <span className="text-neutral-600 font-medium">{professional.responseTime}</span>
                </div>
              </div>

              {/* Availability */}
              <div className="mb-6">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-300 ${getAvailabilityColor(professional.availability)}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    professional.availability === 'available' ? 'bg-success-500 animate-pulse-gentle' :
                    professional.availability === 'busy' ? 'bg-warning-500' : 'bg-error-500'
                  }`}></div>
                  {getAvailabilityText(professional.availability)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button className="flex-1 bg-gradient-to-r from-neutral-100 to-neutral-200 text-neutral-700 px-4 py-3 rounded-xl hover:from-neutral-200 hover:to-neutral-300 font-semibold text-sm flex items-center justify-center space-x-2 transition-all duration-300 shadow-soft hover:shadow-medium transform hover:scale-105">
                  <MessageCircle className="w-4 h-4" />
                  <span>Nhắn Tin</span>
                </button>
                
                <button
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 font-semibold text-sm transition-all duration-300 shadow-glow hover:shadow-glow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={professional.availability === 'unavailable'}
                >
                  {professional.availability === 'unavailable' ? 'Không Rảnh' : 'Thuê Ngay'}
                </button>
              </div>

              {/* Success Rate Badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-success-500 to-success-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-soft">
                {professional.successRate}% thành công
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProfessionals.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-24 h-24 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-neutral-500" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-700 mb-4">Không tìm thấy chuyên gia IT phù hợp</h3>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để tìm thấy chuyên gia phù hợp với yêu cầu của bạn.
            </p>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 font-semibold transition-all duration-300 shadow-glow hover:shadow-glow-lg transform hover:scale-105"
            >
              Xóa tất cả bộ lọc
            </button>
          </div>
        )}

        {/* Load More Button */}
        {filteredProfessionals.length > 0 && (
          <div className="text-center mt-12 animate-fade-in">
            <button className="bg-gradient-to-r from-secondary-600 to-secondary-700 text-white px-8 py-4 rounded-2xl hover:from-secondary-700 hover:to-secondary-800 font-semibold text-lg transition-all duration-300 shadow-glow-green hover:shadow-glow-lg transform hover:scale-105">
              Xem thêm chuyên gia IT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}