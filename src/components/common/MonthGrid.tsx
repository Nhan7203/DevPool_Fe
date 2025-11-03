import React from "react";

interface MonthGridProps {
  year: number;
  activeMonth?: number;
  onSelect: (month: number) => void;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const MonthGrid: React.FC<MonthGridProps> = ({ year, activeMonth, onSelect }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {MONTHS.map((label, idx) => {
        const month = idx + 1;
        const isActive = activeMonth === month;
        return (
          <button
            key={month}
            onClick={() => onSelect(month)}
            className={`border rounded p-3 text-sm text-left hover:bg-gray-50 transition ${
              isActive ? "border-blue-600 bg-blue-50" : "border-gray-200"
            }`}
          >
            <div className="font-semibold">{label} {year}</div>
            <div className="text-gray-500">Tháng {month}</div>
          </button>
        );
      })}
    </div>
  );
};

export default MonthGrid;
