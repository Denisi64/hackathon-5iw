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
  /** Signature color used by the orb, badge, and accent treatments. */
  color: 'purple' | 'amber' | 'green' | 'pink'
  /** Tailwind classes for color-tinted decorations (background tints, borders). */
  ringClass: string
  fromClass: string
  toClass: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  /** Portrait imported through Vite for hashed caching. */
  photo: string
  age: number
  location: string
  quote: string
  plan: { name: string; price: string; subtitle: string }
  episodes: [EpisodeContent, EpisodeContent, EpisodeContent, EpisodeContent, EpisodeContent]
}

/** Story content per persona. Structural labels and UI chrome come from i18n. */
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
    quote: 'Je veux faire ma demande depuis mon telephone en quelques minutes, sans gerer de paperasse.',
    plan: { name: 'Imagine R Etudiant', price: '392,30 EUR/an', subtitle: 'Tarif boursier applique' },
    episodes: [
      {
        narrative: 'Lucas commence un nouvel episode de sa vie : ses etudes superieures.',
        items: ['Age : 20 ans', 'Statut : etudiant', 'Boursier : oui, echelon 4', 'Zone : Cergy et alentours'],
      },
      {
        narrative: 'Sa situation est analysee et la solution la plus adaptee lui est proposee.',
        items: ['Imagine R Etudiant', 'Bourse detectee automatiquement', '392,30 EUR/an', 'Deplacements quotidiens IDF'],
      },
      {
        narrative: 'Lucas ajoute son certificat de scolarite en quelques clics.',
        items: ['Certificat de scolarite', 'Attestation de bourse', 'Verification IA en cours...', 'Confiance : 94%'],
      },
      {
        narrative: 'Tout est valide. Lucas peut utiliser son abonnement.',
        items: ['Imagine R Etudiant', '392,30 EUR/an', 'Valable a partir du 01/09/2026', 'Paiement echelonne active'],
      },
      {
        narrative: 'Quelques annees plus tard, Lucas commence son premier emploi. Un nouvel episode commence.',
        items: ['Nouvelle situation detectee', 'Premier emploi', 'Bascule vers Navigo Annuel', 'Remboursement employeur 50%'],
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
    quote: 'Je veux gerer les abonnements de mes enfants rapidement, sans me poser mille questions.',
    plan: { name: 'Imagine R Scolaire x 2', price: '392,30 EUR/an/enfant', subtitle: 'Famille geree de maniere centralisee' },
    episodes: [
      {
        narrative: 'Valerie commence un episode familial : la rentree de ses deux adolescents.',
        items: ['Mere de 2 adolescents', 'Lea, 13 ans', 'Lucas, 16 ans', 'Payeuse pour ses deux enfants'],
      },
      {
        narrative: 'Un espace centralise de gestion des abonnements lui est propose.',
        items: ['Imagine R Scolaire x 2', 'Un seul espace de gestion', '392,30 EUR/an par enfant', 'Renouvellement annuel'],
      },
      {
        narrative: 'Un seul livret de famille suffit pour valider les deux dossiers.',
        items: ['Livret de famille', '2 enfants detectes', 'Liens familiaux confirmes', 'Confiance : 97%'],
      },
      {
        narrative: 'Les deux abonnements sont valides dans un seul parcours.',
        items: ['Lea - Imagine R Scolaire', 'Lucas - Imagine R Scolaire', 'Valides pour l\'annee scolaire 2026', 'Rappels automatiques actives'],
      },
      {
        narrative: 'Lucas a 16 ans : il peut maintenant gerer son propre contrat. Valerie recoit une notification.',
        items: ['Lucas atteint 16 ans', 'Transfert de gestion propose', 'Validation parent + enfant requise', 'Valerie reste gestionnaire de Lea'],
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
    quote: 'Si je peux beneficier d un tarif plus avantageux, je veux que tout se fasse automatiquement et sans risque.',
    plan: { name: 'Navigo Senior', price: '544,80 EUR/an', subtitle: '-45 EUR/mois vs Navigo Mois' },
    episodes: [
      {
        narrative: 'Jean-Pierre vient de prendre sa retraite. Une nouvelle etape de vie commence.',
        items: ['Age : 67 ans', 'Statut : retraite', 'Titre actuel : Navigo Annuel', 'Val-de-Marne (94)'],
      },
      {
        narrative: 'Son eligibilite au tarif Senior est detectee automatiquement et une bascule lui est proposee.',
        items: ['Navigo Senior', 'Eligibilite confirmee (62 ans et plus)', '544,80 EUR/an', 'Economie : 545 EUR/an vs Navigo Mois'],
      },
      {
        narrative: 'Une simple piece d identite valide son age. Aucun passage en agence n est necessaire.',
        items: ['Piece d identite', 'Lecture IA en cours...', 'Age verifie : 67 ans', 'Confiance : 99%'],
      },
      {
        narrative: 'La bascule se fait sans interruption de service. L ancien contrat est resilie automatiquement.',
        items: ['Navigo Senior active', 'Bascule au 1er du mois', 'Aucune coupure', 'Prelevement ajuste a 45,40 EUR/mois'],
      },
      {
        narrative: 'Quelques mois plus tard, Jean-Pierre decouvre des activites locales via l\'application.',
        items: ['Notifications d activites locales', 'Benevolat associatif', 'Sorties culturelles IDF', 'Autonomie preservee'],
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
    quote: 'Je veux conserver mes droits sans devoir refaire les memes demarches tous les mois.',
    plan: { name: 'Navigo Solidarite 75%', price: '22,70 EUR/mois', subtitle: 'Renouvellement mensuel automatique' },
    episodes: [
      {
        narrative: 'Amira est en recherche d emploi. Elle a besoin de conserver sa mobilite sans complexite.',
        items: ['Age : 34 ans', 'Beneficiaire CSS', 'En recherche d emploi', 'Seine-Saint-Denis (93)'],
      },
      {
        narrative: 'Ses droits CAF sont verifies en direct. Aucun document n est a envoyer.',
        items: ['Connexion CAF (mock)', 'Quotient familial detecte : 480', 'Niveau TST : 75%', 'Aucune paperasse'],
      },
      {
        narrative: 'Les droits sont valides a la source. Aucun document n est transmis.',
        items: ['Droits CSS confirmes', 'Validite : 3 mois', 'Renouvellement automatique', 'Zero stigmatisation'],
      },
      {
        narrative: 'Amira recoit son TST Solidarite 75% en quelques minutes.',
        items: ['Navigo Solidarite 75% active', '22,70 EUR/mois', 'Valable jusqu au 31/08/2026', 'Rappel SMS J-15'],
      },
      {
        narrative: 'Amira retrouve un emploi. Elle peut basculer en douceur vers un Navigo Mois standard.',
        items: ['Nouvelle situation : emploi', 'Bascule Navigo Mois proposee', 'Pas d interruption', 'Accompagnement assure'],
      },
    ],
  },
}

export const PERSONA_LIST: PersonaSlug[] = ['lucas', 'valerie', 'jeanpierre', 'amira']
