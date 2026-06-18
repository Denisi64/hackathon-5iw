import type { ComponentType, SVGProps } from 'react'
import { TrainFront, Film, Dumbbell, GraduationCap, Briefcase, UtensilsCrossed, Heart, Music, Leaf, Plane, Users, ShoppingBag } from 'lucide-react'

export interface Interest {
  /** Id canonique envoyé au backend (compatible mobile). */
  id: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

export const INTERESTS: Interest[] = [
  { id: 'mobility',  icon: TrainFront },
  { id: 'culture',   icon: Film },
  { id: 'sport',     icon: Dumbbell },
  { id: 'education', icon: GraduationCap },
  { id: 'work',      icon: Briefcase },
  { id: 'food',      icon: UtensilsCrossed },
  { id: 'wellbeing', icon: Heart },
  { id: 'music',     icon: Music },
  { id: 'eco',       icon: Leaf },
  { id: 'travel',    icon: Plane },
  { id: 'family',    icon: Users },
  { id: 'shopping',  icon: ShoppingBag },
]

/** Bascule un id dans la liste sélectionnée (pur). */
export function toggleInterest(selected: string[], id: string): string[] {
  return selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]
}
