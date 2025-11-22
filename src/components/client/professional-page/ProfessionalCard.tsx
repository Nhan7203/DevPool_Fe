"use client";

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle, Heart, Briefcase as BriefcaseIcon, ChevronDown, ChevronUp, Phone } from 'lucide-react';
import type { Professional } from './types';

interface ProfessionalCardProps {
    professional: Professional;
    isFavorite: boolean;
    onToggleFavorite: (id: string) => void;
    showOnlyFavorites?: boolean;
    isSelectedForContact?: boolean;
    onToggleSelectForContact?: (id: string) => void;
}

// Lấy tên rút gọn (tên cuối cùng trong họ tên)
const getShortName = (fullName: string): string => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return fullName;
    // Lấy tên cuối cùng (thường là tên chính)
    return parts[parts.length - 1];
};

// Format mã nhân sự thành TAL-001
const formatTalentCode = (id: string): string => {
    const numId = parseInt(id);
    if (isNaN(numId)) return `TAL-${id}`;
    return `TAL-${String(numId).padStart(3, '0')}`;
};

// Format WorkingMode
const formatWorkingMode = (workingMode?: string | null): string => {
    if (!workingMode || workingMode === 'null' || workingMode === 'None') return 'Không xác định';
    const modeMap: Record<string, string> = {
        'Onsite': 'Tại văn phòng',
        'Remote': 'Từ xa',
        'Hybrid': 'Kết hợp',
        'Flexible': 'Linh hoạt',
        '0': 'Tại văn phòng',
        '1': 'Từ xa',
        '2': 'Kết hợp',
        '3': 'Linh hoạt',
    };
    return modeMap[workingMode] || 'Không xác định';
};

// Format Status
const formatStatus = (status?: string): string => {
    if (!status) return '—';
    const statusMap: Record<string, string> = {
        'Working': 'Đang làm việc',
        'Available': 'Sẵn sàng',
        'Busy': 'Bận',
        'Unavailable': 'Không rảnh',
    };
    return statusMap[status] || status;
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

// Default avatar
const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=6366f1&color=fff&size=150';

export default function ProfessionalCard({ 
    professional, 
    isFavorite, 
    onToggleFavorite,
    showOnlyFavorites = false,
    isSelectedForContact = false,
    onToggleSelectForContact
}: ProfessionalCardProps) {
    const navigate = useNavigate();
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const shortName = getShortName(professional.name);
    const avatarUrl = professional.avatar || DEFAULT_AVATAR;
    const maxSkillsToShow = 5; // Giới hạn số skills hiển thị
    const talentCode = formatTalentCode(professional.id);
    
    const bioText = professional.bio || professional.description || '';
    const shouldShowExpandButton = bioText.length > 100; // Hiển thị nút nếu bio dài hơn 100 ký tự

    const handleContact = () => {
        // Điều hướng đến trang contact với query params chứa talentId và talentCode
        navigate(`/contact?talentId=${professional.id}&talentCode=${encodeURIComponent(talentCode)}`);
    };

    return (
        <div
            className={`group relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-soft hover:shadow-strong border transition-all duration-500 transform hover:scale-102 hover:-translate-y-2 flex flex-col h-full p-6 ${
                isSelectedForContact 
                    ? 'border-primary-500 ring-2 ring-primary-300' 
                    : 'border-neutral-200 hover:border-primary-300'
            }`}
        >
            {/* Checkbox để chọn liên hệ - Chỉ hiển thị khi showOnlyFavorites = true */}
            {showOnlyFavorites && onToggleSelectForContact && (
                <div className="absolute top-4 left-4 z-10">
                    <input
                        type="checkbox"
                        checked={isSelectedForContact}
                        onChange={() => onToggleSelectForContact(professional.id)}
                        className="w-6 h-6 text-primary-600 border-2 border-neutral-300 rounded-lg focus:ring-primary-500 focus:ring-2 cursor-pointer shadow-md hover:border-primary-400 transition-all duration-200"
                        style={{ accentColor: '#6366f1' }}
                    />
                </div>
            )}

            {/* Header: Avatar, Name, Position, Favorite */}
            <div className="flex items-start justify-between mb-5">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                        <img
                            src={avatarUrl}
                            alt={professional.name}
                            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-primary-100 group-hover:ring-primary-300 transition-all duration-300"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
                            }}
                        />
                        {professional.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success-500 rounded-full border-2 border-white animate-pulse-gentle"></div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-neutral-900 group-hover:text-primary-700 transition-colors duration-300 mb-1 truncate">
                            {shortName}
                        </h3>
                        <p className="text-sm text-neutral-600 font-medium group-hover:text-neutral-700 transition-colors duration-300 truncate mb-1">
                            {professional.title}
                        </p>
                        <span className="inline-flex items-center px-2.5 py-1 bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 text-xs font-bold rounded-lg border border-primary-200 shadow-sm">
                            {talentCode}
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => onToggleFavorite(professional.id)}
                    className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 transform flex-shrink-0 ${isFavorite
                        ? 'text-error-500 bg-error-50 hover:bg-error-100'
                        : 'text-neutral-400 hover:text-error-500 hover:bg-error-50'
                        }`}
                >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
            </div>

            {/* Thông tin cơ bản: Location, WorkingMode, Status - Gộp lại thành grid */}
            <div className="grid grid-cols-1 gap-2 mb-4">
                {/* Location */}
                <div className="flex items-start space-x-2 text-neutral-600 bg-neutral-50 rounded-lg px-3 py-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium break-words">{professional.location || '—'}</span>
                </div>

                {/* WorkingMode và Status - Cùng một hàng nếu có */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center space-x-2 text-neutral-600 bg-neutral-50 rounded-lg px-3 py-2 flex-1 min-w-0">
                        <BriefcaseIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{formatWorkingMode(professional.workingMode)}</span>
                    </div>
                    {professional.status && (
                        <div className="flex items-center space-x-2 bg-primary-50 rounded-lg px-3 py-2 flex-1 min-w-0">
                            <CheckCircle className="w-4 h-4 text-primary-600 flex-shrink-0" />
                            <span className="text-sm font-medium text-primary-700 truncate">{formatStatus(professional.status)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Bio (Giới thiệu ngắn) */}
            {bioText && (
                <div className="mb-4">
                    <p className={`text-sm text-neutral-700 leading-relaxed group-hover:text-neutral-800 transition-colors duration-300 whitespace-pre-wrap break-words ${
                        !isBioExpanded && shouldShowExpandButton ? 'line-clamp-2' : ''
                    }`}>
                        {bioText}
                    </p>
                    {shouldShowExpandButton && (
                        <button
                            onClick={() => setIsBioExpanded(!isBioExpanded)}
                            className="mt-2 flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors duration-300"
                        >
                            {isBioExpanded ? (
                                <>
                                    <ChevronUp className="w-4 h-4" />
                                    Thu gọn
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-4 h-4" />
                                    Xem thêm
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}

            {/* Skills - Hiển thị tên skill và yearsExp, giới hạn số lượng */}
            {professional.skills && professional.skills.length > 0 && (
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                        {professional.skills.slice(0, maxSkillsToShow).map((skill, index) => (
                            <span
                                key={`${skill.name}-${index}`}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-300 hover:scale-105 ${getSkillLevelColor(skill.level)}`}
                                title={skill.yearsExp ? `${skill.name} - ${skill.yearsExp} năm kinh nghiệm` : skill.name}
                            >
                                {skill.name}
                                {skill.yearsExp && skill.yearsExp > 0 && (
                                    <span className="ml-1 text-xs opacity-75">({skill.yearsExp})</span>
                                )}
                            </span>
                        ))}
                        {professional.skills.length > maxSkillsToShow && (
                            <span className="px-2.5 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-lg border border-neutral-200 hover:bg-neutral-200 transition-colors duration-300">
                                +{professional.skills.length - maxSkillsToShow}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Stats: Tổng số dự án và Availability - Gộp lại */}
            <div className="mt-auto space-y-3">
                {/* Tổng số dự án */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200 group-hover:from-primary-100 group-hover:to-secondary-100 transition-all duration-300">
                    <div className="flex items-center space-x-2">
                        <BriefcaseIcon className="w-4 h-4 text-primary-600" />
                        <span className="text-xs font-medium text-neutral-600">Tổng dự án</span>
                    </div>
                    <span className="text-base font-bold text-primary-700">
                        {professional.completedProjects || professional.workExperiences || 0}
                    </span>
                </div>

            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-neutral-200">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleContact}
                        className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2.5 rounded-xl hover:from-primary-700 hover:to-primary-800 font-semibold text-sm transition-all duration-300 shadow-glow hover:shadow-glow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                        <Phone className="w-4 h-4" />
                        Liên hệ
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // Mở Zalo chat với số điện thoại (nếu có)
                            const phone = professional.phoneNumber || '';
                            if (phone) {
                                window.open(`https://zalo.me/${phone.replace(/\D/g, '')}`, '_blank');
                            }
                        }}
                        className="flex items-center justify-center px-4 py-2.5 bg-[#0068FF] text-white rounded-xl hover:bg-[#0052CC] font-semibold text-sm transition-all duration-300 shadow-soft hover:shadow-medium transform hover:scale-105"
                        title="Liên hệ qua Zalo"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.67 6.78 18.5 5.05C16.97 3.68 15.05 2.73 12.96 2.42C12.64 2.37 12.34 2.28 12.04 2.28L12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.05C19.5 7.65 20.45 9.72 20.45 11.92C20.45 16.64 16.76 20.33 12.04 20.33C10.56 20.33 9.11 19.93 7.85 19.18L7.55 19L3.71 20L4.72 16.4L4.5 16.09C3.7 14.73 3.24 13.3 3.24 11.91C3.24 7.19 6.93 3.5 11.65 3.5L12.05 3.67M8.25 7.54C7.9 7.54 7.58 7.7 7.35 7.97C7.12 8.24 7 8.58 7 8.94C7 9.3 7.12 9.64 7.35 9.91C7.58 10.18 7.9 10.34 8.25 10.34C8.6 10.34 8.92 10.18 9.15 9.91C9.38 9.64 9.5 9.3 9.5 8.94C9.5 8.58 9.38 8.24 9.15 7.97C8.92 7.7 8.6 7.54 8.25 7.54M15.75 7.54C15.4 7.54 15.08 7.7 14.85 7.97C14.62 8.24 14.5 8.58 14.5 8.94C14.5 9.3 14.62 9.64 14.85 9.91C15.08 10.18 15.4 10.34 15.75 10.34C16.1 10.34 16.42 10.18 16.65 9.91C16.88 9.64 17 9.3 17 8.94C17 8.58 16.88 8.24 16.65 7.97C16.42 7.7 16.1 7.54 15.75 7.54Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}