"use client";

import { MapPin, Star, Clock, CheckCircle, Heart, Briefcase, DollarSign } from 'lucide-react';
import type { Professional } from './types';

interface ProfessionalCardProps {
    professional: Professional;
    isFavorite: boolean;
    onToggleFavorite: (id: string) => void;
}

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

export default function ProfessionalCard({ professional, isFavorite, onToggleFavorite }: ProfessionalCardProps) {
    return (
        <div
            className="group relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-soft hover:shadow-strong border border-neutral-200 hover:border-primary-300 p-8 transition-all duration-500 transform hover:scale-102 hover:-translate-y-2"
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
                    onClick={() => onToggleFavorite(professional.id)}
                    className={`p-2 rounded-xl transition-all duration-300 hover:scale-110 transform ${isFavorite
                        ? 'text-error-500 bg-error-50 hover:bg-error-100'
                        : 'text-neutral-400 hover:text-error-500 hover:bg-error-50'
                        }`}
                >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
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
                    <div className={`w-2 h-2 rounded-full mr-2 ${professional.availability === 'available' ? 'bg-success-500 animate-pulse-gentle' :
                        professional.availability === 'busy' ? 'bg-warning-500' : 'bg-error-500'
                        }`}></div>
                    {getAvailabilityText(professional.availability)}
                </span>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
                <button
                    className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 rounded-xl hover:from-primary-700 hover:to-primary-800 font-semibold text-sm transition-all duration-300 shadow-glow hover:shadow-glow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    Xem Hồ Sơ CV
                </button>
            </div>

            {/* Success Rate Badge */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-success-500 to-success-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-soft">
                {professional.successRate}% thành công
            </div>
        </div>
    );
}