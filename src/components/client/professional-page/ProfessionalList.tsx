"use client";

import type { Professional } from './types';
import ProfessionalCard from './ProfessionalCard';

interface ProfessionalListProps {
  professionals: Professional[];
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  showOnlyFavorites?: boolean;
  selectedForContact?: Set<string>;
  onToggleSelectForContact?: (id: string) => void;
}

export default function ProfessionalList({ 
  professionals, 
  favorites, 
  onToggleFavorite,
  showOnlyFavorites = false,
  selectedForContact = new Set(),
  onToggleSelectForContact
}: ProfessionalListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {professionals.map((professional) => (
        <ProfessionalCard
          key={professional.id}
          professional={professional}
          isFavorite={favorites.has(professional.id)}
          onToggleFavorite={onToggleFavorite}
          showOnlyFavorites={showOnlyFavorites}
          isSelectedForContact={selectedForContact.has(professional.id)}
          onToggleSelectForContact={onToggleSelectForContact}
        />
      ))}
    </div>
  );
}