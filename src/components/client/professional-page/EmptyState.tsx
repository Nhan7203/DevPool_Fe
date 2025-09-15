"use client";

import { Search } from 'lucide-react';

interface EmptyStateProps {
  onClearFilters: () => void;
}

export default function EmptyState({ onClearFilters }: EmptyStateProps) {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="w-24 h-24 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-full flex items-center justify-center mx-auto mb-6">
        <Search className="w-12 h-12 text-neutral-500" />
      </div>
      <h3 className="text-2xl font-bold text-neutral-700 mb-4">Không tìm thấy chuyên gia IT phù hợp</h3>
      <p className="text-neutral-600 mb-6 max-w-md mx-auto">
        Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để tìm thấy chuyên gia phù hợp với yêu cầu của bạn.
      </p>
      <button onClick={onClearFilters} className="bg-gradient-to-r from-primary-600 to-primary-700 text-white ...">
        Xóa tất cả bộ lọc
      </button>
    </div>
  );
}