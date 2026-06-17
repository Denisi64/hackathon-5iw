import type { ComponentType, SVGProps } from 'react'
import { Briefcase, GraduationCap, Leaf, Sparkles } from 'lucide-react'
import lucasPhoto from '../assets/images/personas/lucas.png'
import valeriePhoto from '../assets/images/personas/valerie.png'
import jeanpierrePhoto from '../assets/images/personas/jeanpierre.png'
import amiraPhoto from '../assets/images/personas/amira.png'

export type PersonaSlug = 'lucas' | 'valerie' | 'jeanpierre' | 'amira'

export interface EpisodeContent {
  /** Short narrative line shown inside the episode card body. */
  narrative: string
  /** Bullet points / mock UI items shown in the mock device screen. */
  items: string[]
}

export interface PersonaStory {
  slug: PersonaSlug
  /** Couleur signature — utilisée pour orb, badge, accents. */
  color: 'purple' | 'amber' | 'green' | 'pink'
  /** Tailwind classes for color-tinted decorations (background tints, borders). */
  ringClass: string
  fromClass: string
  toClass: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  /** Photo portrait — chargée via import Vite, hash + cache géré. */
  photo: string
  age: number
  location: string
  quote: string
  forfait: { nom: string; prix: string; subtitle: string }
  episodes: [EpisodeContent, EpisodeContent, EpisodeContent, EpisodeContent, EpisodeContent]
}

/** Stories per persona. Narrative content kept in French (matches brief PDF tone);
    structural labels (episode titles, UI chrome) come from i18n. */
export const PERSONA_STORIES: Record<PersonaSlug, PersonaStory> = {
  lucas: {
    slug: 'lucas',
    color: 'purple',
    ringClass: 'ring-purple-500/30 hover:ring-purple-500/50',
    fromClass: 'from-purple-500/20',
    toClass: 'to-purple-500/0',
    icon: GraduationCap,
    photo: lucasPhoto,
    age: 20,
    location: 'Cergy (95)',
    quote: 'Je veux faire ma demande depuis mon téléphone en quelques minutes, sans gérer de paperasse.',
    forfait: { nom: 'Imagine R Étudiant', prix: '392,30 €/an', subtitle: 'Tarif boursier appliqué' },
    episodes: [
      {
        narrative: "Lucas commence un nouvel épisode de sa vie : ses études supérieures.",
        items: ['Âge : 20 ans', 'Statut : étudiant', 'Boursier : oui (échelon 4)', 'Zone : Cergy & alentours'],
      },
      {
        narrative: "On analyse sa situation et on lui propose la solution la plus adaptée.",
        items: ['Imagine R Étudiant', 'Boursier détecté automatiquement', '392,30 €/an', 'Déplacements quotidiens IDF'],
      },
      {
        narrative: "Lucas ajoute son justificatif de scolarité en quelques clics.",
        items: ['Certificat de scolarité', 'Attestation de bourse', 'Vérification IA en cours…', 'Confiance : 94%'],
      },
      {
        narrative: "Tout est validé. Lucas peut profiter de son abonnement.",
        items: ['Imagine R Étudiant', '392,30 €/an', "Valable à partir du 01/09/2026", 'Paiement échelonné activé'],
      },
      {
        narrative: "Quelques années plus tard, Lucas démarre son premier emploi. Un nouvel épisode commence.",
        items: ['Nouvelle situation détectée', 'Premier emploi', 'Bascule vers Navigo Annuel', 'Remboursement employeur 50%'],
      },
    ],
  },
  valerie: {
    slug: 'valerie',
    color: 'amber',
    ringClass: 'ring-amber-500/30 hover:ring-amber-500/50',
    fromClass: 'from-amber-500/20',
    toClass: 'to-amber-500/0',
    icon: Briefcase,
    photo: valeriePhoto,
    age: 46,
    location: 'Essonne (91)',
    quote: "Je veux gérer les abonnements de mes enfants rapidement, sans me poser mille questions.",
    forfait: { nom: 'Imagine R Scolaire × 2', prix: '392,30 €/an /enfant', subtitle: 'Famille gérée centralisée' },
    episodes: [
      {
        narrative: "Valérie commence un épisode familial : la rentrée scolaire de ses deux ados.",
        items: ['Maman de 2 ados', 'Léa, 13 ans', 'Lucas, 16 ans', 'Payeuse pour ses deux enfants'],
      },
      {
        narrative: "On lui propose une gestion centralisée des abonnements de sa tribu.",
        items: ['Imagine R Scolaire × 2', 'Un seul espace de gestion', '392,30 €/an par enfant', 'Renouvellement annuel'],
      },
      {
        narrative: "Un seul livret de famille suffit pour valider les deux dossiers.",
        items: ['Livret de famille', '2 enfants détectés', "Liens familiaux confirmés", 'Confiance : 97%'],
      },
      {
        narrative: "Les deux abonnements sont validés en une seule démarche.",
        items: ['Léa — Imagine R Scolaire', 'Lucas — Imagine R Scolaire', 'Valides année scolaire 2026', 'Rappels automatiques activés'],
      },
      {
        narrative: "Lucas a 16 ans : il peut maintenant gérer son propre contrat. Valérie reçoit une notification.",
        items: ['Lucas atteint 16 ans', 'Transfert de gestion proposé', 'Validation parent + enfant requise', 'Valérie reste gestionnaire de Léa'],
      },
    ],
  },
  jeanpierre: {
    slug: 'jeanpierre',
    color: 'green',
    ringClass: 'ring-emerald-500/30 hover:ring-emerald-500/50',
    fromClass: 'from-emerald-500/20',
    toClass: 'to-emerald-500/0',
    icon: Leaf,
    photo: jeanpierrePhoto,
    age: 67,
    location: 'Val-de-Marne (94)',
    quote: "Si je peux bénéficier d'un tarif plus avantageux, je veux que tout se fasse automatiquement et sans risque.",
    forfait: { nom: 'Navigo Senior', prix: '544,80 €/an', subtitle: '−45 €/mois vs Navigo Mois' },
    episodes: [
      {
        narrative: "Jean-Pierre vient de prendre sa retraite. Une nouvelle étape de vie commence.",
        items: ['Âge : 67 ans', 'Statut : retraité', 'Titulaire actuel : Navigo Annuel', 'Val-de-Marne (94)'],
      },
      {
        narrative: "On détecte automatiquement son éligibilité au tarif Senior et on lui propose la bascule.",
        items: ['Navigo Senior', 'Éligibilité confirmée (≥62 ans)', '544,80 €/an', 'Économie : 545 €/an vs Navigo Mois'],
      },
      {
        narrative: "Une simple pièce d'identité valide l'âge. Pas de déplacement en agence.",
        items: ["Pièce d'identité (CNI)", 'Lecture IA en cours…', 'Âge vérifié : 67 ans', 'Confiance : 99%'],
      },
      {
        narrative: "La bascule se fait sans interruption de service. L'ancien contrat est résilié automatiquement.",
        items: ['Navigo Senior activé', 'Bascule au 1er du mois', 'Aucune coupure', 'Prélèvement ajusté à 45,40 €/mois'],
      },
      {
        narrative: "Quelques mois plus tard, Jean-Pierre découvre une activité solidaire dans sa commune via l'app.",
        items: ['Notifications activités locales', 'Bénévolat associatif', 'Sorties culturelles IDF', "Gardez l'autonomie"],
      },
    ],
  },
  amira: {
    slug: 'amira',
    color: 'pink',
    ringClass: 'ring-pink-500/30 hover:ring-pink-500/50',
    fromClass: 'from-pink-500/20',
    toClass: 'to-pink-500/0',
    icon: Sparkles,
    photo: amiraPhoto,
    age: 34,
    location: 'Seine-Saint-Denis (93)',
    quote: "Je veux conserver mes droits sans devoir refaire les mêmes démarches tous les mois.",
    forfait: { nom: 'Navigo Solidarité 75%', prix: '22,70 €/mois', subtitle: 'Renouvellement mensuel auto' },
    episodes: [
      {
        narrative: "Amira est en recherche d'emploi. Elle a besoin de conserver sa mobilité sans complexité.",
        items: ['Âge : 34 ans', 'Bénéficiaire CSS', "En recherche d'emploi", 'Seine-Saint-Denis (93)'],
      },
      {
        narrative: "On vérifie ses droits CAF en direct — aucun justificatif à uploader.",
        items: ['Connexion CAF (mock)', 'QF détecté : 480', 'Niveau TST : 75%', "Sans aucune paperasse"],
      },
      {
        narrative: "Les droits sont validés à la source. Aucun document à transmettre.",
        items: ['Droits CSS confirmés', 'Validité : 3 mois', 'Renouvellement auto', "Zero stigmatisation"],
      },
      {
        narrative: "Amira reçoit son TST Solidarité 75 % en quelques minutes.",
        items: ['Navigo Solidarité 75% activé', '22,70 €/mois', "Valable jusqu'au 31/08/2026", "SMS de rappel J-15"],
      },
      {
        narrative: "Amira retrouve un emploi. Elle peut basculer en douceur vers un Navigo Mois standard.",
        items: ['Nouvelle situation : emploi', 'Bascule Navigo Mois proposée', "Pas d'interruption", 'Accompagnement assuré'],
      },
    ],
  },
}

export const PERSONA_LIST: PersonaSlug[] = ['lucas', 'valerie', 'jeanpierre', 'amira']
