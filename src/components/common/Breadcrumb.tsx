import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <span>/</span>}
          {item.to ? (
            <Link
              to={item.to}
              className="text-primary-600 hover:text-primary-700 cursor-pointer transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-neutral-900 font-semibold">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}

