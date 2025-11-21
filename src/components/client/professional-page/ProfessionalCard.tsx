"use client";

import { MapPin, CheckCircle, Heart, Briefcase as BriefcaseIcon } from 'lucide-react';
import type { Professional } from './types';

interface ProfessionalCardProps {
    professional: Professional;
    isFavorite: boolean;
    onToggleFavorite: (id: string) => void;
}

// Lấy tên rút gọn (tên cuối cùng trong họ tên)
const getShortName = (fullName: string): string => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return fullName;
    // Lấy tên cuối cùng (thường là tên chính)
    return parts[parts.length - 1];
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

export default function ProfessionalCard({ professional, isFavorite, onToggleFavorite }: ProfessionalCardProps) {
    const shortName = getShortName(professional.name);
    const avatarUrl = professional.avatar || DEFAULT_AVATAR;
    const maxSkillsToShow = 5; // Giới hạn số skills hiển thị

    return (
        <div
            className="group relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-soft hover:shadow-strong border border-neutral-200 hover:border-primary-300 p-6 transition-all duration-500 transform hover:scale-102 hover:-translate-y-2 flex flex-col h-full"
        >
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
                        <p className="text-sm text-neutral-600 font-medium group-hover:text-neutral-700 transition-colors duration-300 truncate">
                            {professional.title}
                        </p>
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
                <div className="flex items-center space-x-2 text-neutral-600 bg-neutral-50 rounded-lg px-3 py-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">{professional.location || '—'}</span>
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
            {(professional.bio || professional.description) && (
                <div className="mb-4">
                    <p className="text-sm text-neutral-700 line-clamp-2 leading-relaxed group-hover:text-neutral-800 transition-colors duration-300">
                        {professional.bio || professional.description}
                    </p>
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
                <button
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2.5 rounded-xl hover:from-primary-700 hover:to-primary-800 font-semibold text-sm transition-all duration-300 shadow-glow hover:shadow-glow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    Xem Hồ Sơ CV
                </button>
            </div>
        </div>
    );
}