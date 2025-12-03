import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

interface SearchableSelectOption<T = any> {
  id: T;
  name: string;
  description?: string;
  disabled?: boolean;
  [key: string]: any;
}

interface SearchableSelectProps<T = any> {
  options: SearchableSelectOption<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: string;
  icon?: React.ReactNode;
  filterFn?: (option: SearchableSelectOption<T>, searchQuery: string) => boolean;
  getDisplayValue?: (option: SearchableSelectOption<T> | undefined) => string;
  className?: string;
  maxHeight?: string;
  showCheckIcon?: boolean;
}

export default function SearchableSelect<T = any>({
  options,
  value,
  onChange,
  placeholder = "Chọn...",
  searchPlaceholder = "Tìm kiếm...",
  disabled = false,
  error,
  icon,
  filterFn,
  getDisplayValue,
  className = "",
  maxHeight = "max-h-56",
  showCheckIcon = true,
}: SearchableSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Close dropdown when mouse leaves the dropdown area
  const handleMouseLeave = () => {
    setIsOpen(false);
    setSearchQuery("");
  };

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const defaultFilterFn = (option: SearchableSelectOption<T>, query: string): boolean => {
    if (!query) return true;
    const queryLower = query.toLowerCase();
    return (
      option.name.toLowerCase().includes(queryLower) ||
      Boolean(option.description && option.description.toLowerCase().includes(queryLower))
    );
  };

  const filteredOptions = options.filter((option) =>
    filterFn ? filterFn(option, searchQuery) : defaultFilterFn(option, searchQuery)
  );

  const selectedOption = options.find((opt) => opt.id === value);

  const displayValue = getDisplayValue
    ? getDisplayValue(selectedOption)
    : selectedOption?.name || placeholder;

  const handleSelect = (option: SearchableSelectOption<T>) => {
    if (option.disabled) return;
    onChange(option.id);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl bg-white/50 text-left focus:ring-2 focus:ring-primary-500/20 transition-all ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-neutral-300 focus:border-primary-500"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-soft"}`}
      >
        <div className="flex items-center gap-2 text-sm text-neutral-700 flex-1 min-w-0">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className={value ? "text-neutral-800" : "text-neutral-500"}>{displayValue}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div 
          className="absolute z-50 mt-2 w-full rounded-xl border border-neutral-200 bg-white shadow-2xl"
          onMouseLeave={handleMouseLeave}
        >
          <div className="p-3 border-b border-neutral-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                onClick={(e) => e.stopPropagation()}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-lg focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className={`${maxHeight} overflow-y-auto`}>
            {filteredOptions.length === 0 ? (
              <p className="px-4 py-3 text-sm text-neutral-500">Không tìm thấy kết quả</p>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={String(option.id)}
                  type="button"
                  onClick={() => handleSelect(option)}
                  disabled={option.disabled}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between ${
                    value === option.id
                      ? "bg-primary-50 text-primary-700"
                      : option.disabled
                        ? "bg-neutral-100 text-neutral-400 cursor-not-allowed italic"
                        : "hover:bg-neutral-50 text-neutral-700"
                  }`}
                >
                  <span>{option.name}</span>
                  {showCheckIcon && value === option.id && (
                    <Check className="w-4 h-4 text-primary-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

