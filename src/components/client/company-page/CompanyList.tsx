"use client"

import type { Company } from "./types"
import CompanyCard from "./CompanyCard"

interface CompanyListProps {
  companies: Company[]
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
}

export default function CompanyList({ companies, favorites, onToggleFavorite }: CompanyListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          isFavorite={favorites.has(company.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  )
}