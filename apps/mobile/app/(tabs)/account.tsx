import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { usersService, tripsService } from '../../services/api'
import { useAuthStore } from '../../stores/auth'
import { OFFER_CARD } from '../../components/NavigoCard'

// ─── Constantes ───────────────────────────────────────────────────────────────

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const LEVELS: { label: string; icon: IoniconName; color: string; min: number }[] = [
  { label: 'Débutant',    icon: 'leaf-outline',    color: '#16A34A', min: 0    },
  { label: 'Explorateur', icon: 'walk-outline',    color: '#1A73E8', min: 500  },
  { label: 'Habitué',     icon: 'compass-outline', color: '#7C3AED', min: 1000 },
  { label: 'Expert',      icon: 'star-outline',    color: '#F59E0B', min: 1500 },
  { label: 'Maestro',     icon: 'trophy-outline',  color: '#EA4335', min: 2000 },
]

const MONUMENT_BADGES: Record<string, { icon: React.ComponentProps<typeof Ionicons>['name']; color: string; label: string; story: string }> = {
  first_trip:   { icon: 'ticket-outline',   color: '#1A73E8', label: 'Premier trajet',    story: "Bienvenue dans l'aventure ! Votre premier trajet marque le début de votre histoire francilienne." },
  tour_eiffel:  { icon: 'business-outline', color: '#6B7A99', label: 'Tour Eiffel',       story: "Symbole de Paris depuis 1889. La Tour Eiffel accueille 7 millions de visiteurs par an. Le RER C vous y emmène directement depuis Gare d'Austerlitz." },
  arc_triomphe: { icon: 'flag-outline',     color: '#8B5CF6', label: 'Arc de Triomphe',  story: 'Commandé par Napoléon en 1806 pour célébrer ses victoires militaires. La ligne 1 vous conduit à Charles de Gaulle – Étoile.' },
  sacre_coeur:  { icon: 'heart-outline',    color: '#EC4899', label: 'Sacré-Cœur',       story: "Perché au sommet de Montmartre (130 m). La ligne 12 vous mène à Abbesses, d'où le funiculaire monte jusqu'à la basilique." },
  notre_dame:   { icon: 'home-outline',     color: '#F59E0B', label: 'Notre-Dame',        story: "Chef-d'œuvre gothique du XIIe siècle. En renaissance après l'incendie de 2019. La ligne 4 vous dépose à Cité." },
  louvre:       { icon: 'image-outline',    color: '#10B981', label: 'Le Louvre',        story: 'Le plus grand musée du monde : 72 735 m² et 35 000 œuvres. Station Palais Royal – Musée du Louvre sur les lignes 1 et 7.' },
  versailles:   { icon: 'diamond-outline',  color: '#F59E0B', label: 'Versailles',        story: "Ancienne résidence des rois de France. 800 hectares de jardins. Le RER C vous emmène jusqu'à Versailles Rive Gauche en 40 min." },
  stade_france: { icon: 'football-outline', color: '#1A73E8', label: 'Stade de France',  story: '80 000 places. Scène de la finale de la Coupe du Monde 1998. Le RER B ou D vous y dépose en 20 min depuis Châtelet.' },
  eco_warrior:  { icon: 'leaf-outline',     color: '#16A34A', label: 'Éco-guerrier',     story: 'Vous avez économisé 50 kg de CO₂ grâce aux transports en commun. Chaque trajet contribue à un avenir plus vert !' },
  streak_7:     { icon: 'flame-outline',    color: '#EF4444', label: 'Voyageur régulier', story: '7 jours consécutifs en transports — vous êtes un vrai habitué des réseaux franciliens !' },
  multimodal:   { icon: 'bus-outline',      color: '#0EA5E9', label: 'Multimodal',        story: 'Métro, RER et Bus maîtrisés. Vous exploitez tout le potentiel du réseau Île-de-France Mobilités !' },
  explorer_50:  { icon: 'trophy-outline',   color: '#F59E0B', label: 'Grand explorateur', story: "50 trajets validés — Paris n'a plus aucun secret pour vous. La Ville Lumière vous appartient !" },
}

const MEDAL = ['🥇', '🥈', '🥉']

// ─── Types ────────────────────────────────────────────────────────────────────

interface Gamif { points: number; level: number; badges: string[]; nextLevelPoints: number }
interface WeekStats { weekTrips: number; weekKm: number; weekCo2Saved: number; streak: number }
interface TotalStats { totalTrips: number; totalKm: number; weeksActive: number }
interface Sub { id: string; offerId: string; status: string; endDate?: string }

// ─── Sous-composants ──────────────────────────────────────────────────────────

function InnerTabs({ tabs, active, onChange }: { tabs: string[]; active: number; onChange: (i: number) => void }) {
  return (
    <View className="flex-row bg-surface border-b border-border">
      {tabs.map((t, i) => (
        <TouchableOpacity
          key={t}
          className={`flex-1 py-3 items-center border-b-2 ${active === i ? 'border-primary' : 'border-transparent'}`}
          onPress={() => onChange(i)}
        >
          <Text className={`text-xs font-bold ${active === i ? 'text-primary' : 'text-muted'}`}>{t}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

// ─── TAB 0 : Profil ──────────────────────────────────────────────────────────

function TabProfil({ gamif, week, total, sub }: { gamif: Gamif | null; week: WeekStats | null; total: TotalStats | null; sub: Sub | null }) {
  const router = useRouter()
  const lvlIdx = Math.min((gamif?.level ?? 1) - 1, LEVELS.length - 1)
  const prevPts = (gamif?.level ?? 1) > 1 ? ((gamif?.level ?? 1) - 1) * 500 : 0
  const nextPts = gamif?.nextLevelPoints ?? 500
  const progress = gamif ? Math.min((gamif.points - prevPts) / (nextPts - prevPts), 1) : 0

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* XP Bar */}
      <View className="px-6 pt-5">
        <View className="bg-white border border-border rounded-3xl p-5">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-xs text-muted uppercase tracking-widest font-semibold">Niveau actuel</Text>
              <View className="flex-row items-center gap-2">
                <Ionicons name={LEVELS[lvlIdx]?.icon ?? 'leaf-outline'} size={22} color={LEVELS[lvlIdx]?.color ?? '#16A34A'} />
                <Text className="text-2xl font-black text-fg">{LEVELS[lvlIdx]?.label}</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-3xl font-black text-primary">{gamif?.points ?? 0}</Text>
              <Text className="text-xs text-muted">points</Text>
            </View>
          </View>

          {/* Barre XP */}
          <View className="h-3 bg-surface rounded-full overflow-hidden mb-2">
            <View className="h-3 bg-primary rounded-full" style={{ width: `${progress * 100}%` }} />
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-muted">{gamif?.points ?? 0} pts</Text>
            <Text className="text-xs text-muted">{nextPts} pts → {LEVELS[Math.min(lvlIdx + 1, LEVELS.length - 1)]?.label}</Text>
          </View>

          {/* Jalons */}
          <View className="flex-row mt-4 gap-1">
            {LEVELS.map((l, i) => (
              <View key={i} className={`flex-1 items-center py-2 rounded-xl ${i <= lvlIdx ? 'bg-primary/10' : 'bg-surface'}`}>
                <Ionicons name={l.icon} size={14} color={i <= lvlIdx ? l.color : '#CBD5E1'} />
                <Text className={`text-[9px] font-semibold mt-0.5 ${i <= lvlIdx ? 'text-primary' : 'text-muted'}`}>{l.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Stats */}
      <View className="px-6 mt-4">
        <Text className="text-sm font-bold text-fg mb-3">Mes statistiques</Text>
        <View className="flex-row gap-3">
          {[
            { icon: 'map-outline' as IoniconName,      color: '#1A73E8', value: `${total?.totalKm ?? 0} km`, label: 'Total parcourus' },
            { icon: 'train-outline' as IoniconName,    color: '#0D47A1', value: `${total?.totalTrips ?? 0}`, label: 'Trajets validés' },
            { icon: 'calendar-outline' as IoniconName, color: '#7C3AED', value: `${total?.weeksActive ?? 0}`, label: 'Semaines actives' },
          ].map((s) => (
            <View key={s.label} className="flex-1 bg-white border border-border rounded-2xl p-3 items-center">
              <Ionicons name={s.icon} size={22} color={s.color} style={{ marginBottom: 4 }} />
              <Text className="text-base font-black text-fg">{s.value}</Text>
              <Text className="text-[10px] text-muted text-center leading-tight">{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Cette semaine */}
      {week && (
        <View className="px-6 mt-4">
          <Text className="text-sm font-bold text-fg mb-3">Cette semaine</Text>
          <View className="bg-white border border-border rounded-2xl p-4 gap-3">
            {[
              { label: 'Trajets',      value: `${week.weekTrips}`,                                   icon: 'train-outline' as IoniconName,    color: '#1A73E8' },
              { label: 'Kilomètres',   value: `${week.weekKm} km`,                                   icon: 'location-outline' as IoniconName, color: '#7C3AED' },
              { label: 'CO₂ économisé',value: `${week.weekCo2Saved} kg`,                             icon: 'leaf-outline' as IoniconName,     color: '#16A34A' },
              { label: 'Streak',       value: `${week.streak} jour${week.streak > 1 ? 's' : ''}`,   icon: 'flame-outline' as IoniconName,    color: '#EA4335' },
            ].map((r) => (
              <View key={r.label} className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Ionicons name={r.icon} size={16} color={r.color} />
                  <Text className="text-sm text-muted">{r.label}</Text>
                </View>
                <Text className="text-sm font-bold text-fg">{r.value}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Comment gagner des points */}
      <View className="px-6 mt-4">
        <Text className="text-sm font-bold text-fg mb-3">Comment gagner des points ?</Text>
        <View className="bg-white border border-border rounded-2xl overflow-hidden">
          {[
            { icon: 'train-outline' as IoniconName,          color: '#1A73E8', label: '1 trajet validé',     pts: '+15 pts' },
            { icon: 'calendar-outline' as IoniconName,       color: '#7C3AED', label: 'Fidélité mensuelle',   pts: '+50 pts' },
            { icon: 'checkmark-circle-outline' as IoniconName, color: '#F59E0B', label: 'Défi complété',       pts: '+50–150 pts' },
            { icon: 'shuffle-outline' as IoniconName,        color: '#16A34A', label: 'Transport multimodal', pts: '+25 pts' },
          ].map((r, i) => (
            <View key={i} className={`flex-row items-center px-4 py-3 gap-3 ${i > 0 ? 'border-t border-border' : ''}`}>
              <Ionicons name={r.icon} size={20} color={r.color} style={{ width: 24 }} />
              <Text className="flex-1 text-sm text-fg">{r.label}</Text>
              <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                <Text className="text-xs font-bold text-primary">{r.pts}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Abonnement */}
      {sub && (
        <View className="px-6 mt-4">
          <Text className="text-sm font-bold text-fg mb-3">Mon abonnement</Text>
          <View className="bg-white border border-border rounded-2xl p-4 gap-3">
            <View className="flex-row items-center gap-3">
              <Ionicons name="card-outline" size={28} color="#1A73E8" />
              <View className="flex-1">
                <Text className="font-bold text-fg text-sm">{OFFER_CARD[sub.offerId]?.name ?? sub.offerId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</Text>
                {sub.endDate && <Text className="text-xs text-muted">Expire le {new Date(sub.endDate).toLocaleDateString('fr-FR')}</Text>}
              </View>
              <View className={`px-2 py-1 rounded-full ${sub.status === 'active' ? 'bg-green-100' : 'bg-amber-100'}`}>
                <Text className={`text-xs font-bold ${sub.status === 'active' ? 'text-green-700' : 'text-amber-700'}`}>
                  {sub.status === 'active' ? 'Actif' : 'En attente'}
                </Text>
              </View>
            </View>
            {sub.status === 'draft' && (
              <TouchableOpacity
                className="bg-primary rounded-xl py-2.5 flex-row items-center justify-center gap-2"
                onPress={() => router.push({ pathname: '/(tabs)/subscribe', params: { resumeSubId: sub.id, resumeOfferId: sub.offerId } })}
              >
                <Ionicons name="card-outline" size={16} color="white" />
                <Text className="text-white text-sm font-bold">Reprendre le paiement</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  )
}

// ─── TAB 1 : Défis ───────────────────────────────────────────────────────────

function TabDefis({ week, total }: { week: WeekStats | null; total: TotalStats | null }) {
  const [tab, setTab] = useState(0)

  const weekKm = week?.weekKm ?? 0
  const streak = week?.streak ?? 0
  const weekTrips = week?.weekTrips ?? 0
  const totalTrips = total?.totalTrips ?? 0

  const DEFIS: { icon: IoniconName; color: string; label: string; pts: number; current: number; target: number }[][] = [
    // Quotidien
    [
      { icon: 'train-outline',   color: '#1A73E8', label: 'Valider 1 trajet aujourd\'hui', pts: 15,  current: Math.min(weekTrips > 0 ? 1 : 0, 1), target: 1 },
      { icon: 'alarm-outline',   color: '#7C3AED', label: 'Voyager avant 9h du matin',     pts: 20,  current: 0, target: 1 },
      { icon: 'moon-outline',    color: '#0D47A1', label: 'Trajet après 20h',              pts: 10,  current: 0, target: 1 },
    ],
    // Hebdo
    [
      { icon: 'location-outline',color: '#7C3AED', label: 'Parcourir 50 km cette semaine', pts: 100, current: weekKm,      target: 50  },
      { icon: 'flame-outline',   color: '#EA4335', label: 'Streak 7 jours consécutifs',    pts: 150, current: streak,      target: 7   },
      { icon: 'bus-outline',     color: '#F57C00', label: 'Utiliser 3 modes de transport', pts: 75,  current: Math.min(weekTrips, 3), target: 3 },
      { icon: 'leaf-outline',    color: '#16A34A', label: 'Économiser 5 kg de CO₂',        pts: 60,  current: week?.weekCo2Saved ?? 0, target: 5 },
    ],
    // Mensuel
    [
      { icon: 'map-outline',     color: '#1A73E8', label: '100 km ce mois',                pts: 200, current: Math.min(weekKm * 4, total?.totalKm ?? 0), target: 100 },
      { icon: 'ticket-outline',  color: '#0D47A1', label: '30 trajets validés',            pts: 250, current: totalTrips,  target: 30  },
      { icon: 'business-outline',color: '#7C3AED', label: 'Explorer 5 lignes différentes', pts: 180, current: 2,           target: 5   },
    ],
  ]

  const challenges = DEFIS[tab]

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Sous-tabs */}
      <View className="flex-row px-6 pt-4 gap-2 mb-4">
        {['Quotidien', 'Hebdo', 'Mensuel'].map((t, i) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(i)}
            className={`px-4 py-2 rounded-full border ${tab === i ? 'bg-primary border-primary' : 'border-border bg-surface'}`}
          >
            <Text className={`text-xs font-bold ${tab === i ? 'text-white' : 'text-muted'}`}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="px-6 gap-3">
        {challenges.map((d, i) => {
          const pct = Math.min(d.current / d.target, 1)
          const done = pct >= 1
          return (
            <View key={i} className={`bg-white border rounded-2xl p-4 ${done ? 'border-green-300' : 'border-border'}`}>
              <View className="flex-row items-start gap-3 mb-3">
                <View className={`w-12 h-12 rounded-2xl items-center justify-center ${done ? 'bg-green-100' : 'bg-primary/10'}`}>
                  {done
                    ? <Ionicons name="checkmark-circle" size={26} color="#16A34A" />
                    : <Ionicons name={d.icon} size={26} color={d.color} />
                  }
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-fg">{d.label}</Text>
                  <Text className="text-xs text-muted mt-0.5">
                    {done ? 'Défi complété !' : `${Math.min(d.current, d.target)} / ${d.target}`}
                  </Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${done ? 'bg-green-100' : 'bg-primary/10'}`}>
                  <Text className={`text-xs font-black ${done ? 'text-green-700' : 'text-primary'}`}>+{d.pts} pts</Text>
                </View>
              </View>
              <View className="h-2 bg-surface rounded-full overflow-hidden">
                <View
                  className={`h-2 rounded-full ${done ? 'bg-green-400' : 'bg-primary'}`}
                  style={{ width: `${pct * 100}%` }}
                />
              </View>
            </View>
          )
        })}
      </View>

    </ScrollView>
  )
}

// ─── TAB 2 : Badges ──────────────────────────────────────────────────────────

function TabBadges({ earned, onPress }: {
  earned: string[]
  onPress: (b: { icon: React.ComponentProps<typeof Ionicons>['name']; color: string; label: string; story: string; unlocked: boolean }) => void
}) {
  const entries = Object.entries(MONUMENT_BADGES)
  const unlockedCount = entries.filter(([id]) => earned.includes(id)).length

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
      <View className="px-6 pt-4">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-base font-black text-fg">Mes badges Paris</Text>
            <Text className="text-xs text-muted">Monuments d'Île-de-France</Text>
          </View>
          <View className="bg-primary/10 px-3 py-1 rounded-full">
            <Text className="text-xs font-bold text-primary">{unlockedCount}/{entries.length}</Text>
          </View>
        </View>

        {/* Grille 3 colonnes */}
        <View className="flex-row flex-wrap gap-3">
          {entries.map(([id, meta]) => {
            const unlocked = earned.includes(id)
            return (
              <TouchableOpacity
                key={id}
                onPress={() => onPress({ ...meta, unlocked })}
                className="items-center"
                style={{ width: '30%' }}
                activeOpacity={0.7}
              >
                <View className={`w-full aspect-square rounded-3xl items-center justify-center mb-1 border-2 ${
                  unlocked ? 'bg-primary/10 border-primary/40' : 'bg-surface border-border opacity-30'
                }`}>
                  <Ionicons name={meta.icon} size={32} color={unlocked ? meta.color : '#CBD5E1'} />
                  {unlocked && (
                    <View className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full items-center justify-center">
                      <Ionicons name="checkmark" size={11} color="white" />
                    </View>
                  )}
                </View>
                <Text className="text-[10px] text-muted text-center leading-tight" numberOfLines={2}>{meta.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {unlockedCount === 0 && (
          <View className="mt-6 bg-surface border border-border rounded-2xl p-6 items-center">
            <Ionicons name="map-outline" size={40} color="#CBD5E1" style={{ marginBottom: 12 }} />
            <Text className="text-sm font-bold text-fg text-center">Partez à l'aventure !</Text>
            <Text className="text-xs text-muted text-center mt-1">Validez des trajets pour débloquer les badges monuments d'Île-de-France.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

// ─── Écran principal ──────────────────────────────────────────────────────────

export default function AccountScreen() {
  const router = useRouter()
  const { token, user, logout } = useAuthStore()

  const [tab, setTab] = useState(0)
  const [gamif, setGamif] = useState<Gamif | null>(null)
  const [week, setWeek] = useState<WeekStats | null>(null)
  const [total, setTotal] = useState<TotalStats | null>(null)
  const [sub, setSub] = useState<Sub | null>(null)
  const [loading, setLoading] = useState(false)
  const [badgeModal, setBadgeModal] = useState<{ icon: React.ComponentProps<typeof Ionicons>['name']; color: string; label: string; story: string; unlocked: boolean } | null>(null)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    Promise.all([
      usersService.getGamification(token).then(setGamif).catch(() => null),
      usersService.getSubscription(token).then(setSub).catch(() => null),
      tripsService.getWeek(token).then((d) => setWeek({ weekTrips: d.weekTrips, weekKm: d.weekKm, weekCo2Saved: d.weekCo2Saved, streak: d.streak })).catch(() => null),
      tripsService.getStats(token).then((d) => setTotal({ totalTrips: d.totalTrips, totalKm: d.totalKm, weeksActive: d.weeksActive })).catch(() => null),
    ]).finally(() => setLoading(false))
  }, [token])

  if (!token) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center px-6">
        <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
          <Ionicons name="person-outline" size={40} color="#1A73E8" />
        </View>
        <Text className="text-xl font-black text-fg mb-2">Mon espace</Text>
        <Text className="text-sm text-muted text-center mb-6">Connectez-vous pour accéder à votre profil et vos abonnements.</Text>
        <TouchableOpacity className="bg-primary py-4 px-8 rounded-2xl" onPress={() => router.push('/login')}>
          <Text className="text-white font-bold">Se connecter</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const lvlIdx = Math.min((gamif?.level ?? 1) - 1, LEVELS.length - 1)

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-white border-b border-border">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 bg-primary rounded-full items-center justify-center">
            <Text className="text-white text-lg font-black">{user?.firstName?.[0]?.toUpperCase() ?? '?'}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-black text-fg">{user ? `${user.firstName} ${user.lastName}` : '—'}</Text>
            {gamif && (
              <View className="flex-row items-center gap-1">
                <Ionicons name={LEVELS[lvlIdx]?.icon ?? 'leaf-outline'} size={12} color={LEVELS[lvlIdx]?.color ?? '#16A34A'} />
                <Text className="text-xs text-primary font-semibold">{LEVELS[lvlIdx]?.label} · {gamif.points} pts</Text>
              </View>
            )}
          </View>
          {loading && <ActivityIndicator size="small" color="#1A73E8" />}
          {['admin@comutitres.fr', 'ly.jerem@gmail.com', 'jey@gmail.com'].includes(user?.email ?? '') && (
            <TouchableOpacity onPress={() => router.push('/admin')} className="mr-2">
              <Ionicons name="shield-outline" size={18} color="#1A73E8" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => { logout(); router.replace('/onboarding') }}>
            <Text className="text-xs text-muted">Déco.</Text>
          </TouchableOpacity>
        </View>
      </View>

      <InnerTabs tabs={['Profil', 'Défis', 'Badges']} active={tab} onChange={setTab} />

      {tab === 0 && <TabProfil gamif={gamif} week={week} total={total} sub={sub} />}
      {tab === 1 && <TabDefis week={week} total={total} />}
      {tab === 2 && <TabBadges earned={gamif?.badges ?? []} onPress={setBadgeModal} />}

      {/* Modal badge */}
      <Modal visible={!!badgeModal} transparent animationType="slide">
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-end"
          activeOpacity={1}
          onPress={() => setBadgeModal(null)}
        >
          <View className="bg-white rounded-t-3xl p-6" onStartShouldSetResponder={() => true}>
            <View className="items-center mb-5">
              <View className={`w-24 h-24 rounded-3xl items-center justify-center mb-3 ${badgeModal?.unlocked ? 'bg-primary/10' : 'bg-surface border-2 border-border'}`}>
                {badgeModal && <Ionicons name={badgeModal.icon} size={44} color={badgeModal.unlocked ? badgeModal.color : '#CBD5E1'} />}
              </View>
              <Text className="text-2xl font-black text-fg">{badgeModal?.label}</Text>
              {!badgeModal?.unlocked
                ? <View className="mt-2 bg-amber-100 px-3 py-1 rounded-full flex-row items-center gap-1">
                    <Ionicons name="lock-closed-outline" size={11} color="#B45309" />
                    <Text className="text-xs font-bold text-amber-700">Badge verrouillé</Text>
                  </View>
                : <View className="mt-2 bg-green-100 px-3 py-1 rounded-full flex-row items-center gap-1">
                    <Ionicons name="checkmark-circle" size={11} color="#15803D" />
                    <Text className="text-xs font-bold text-green-700">Débloqué</Text>
                  </View>
              }
            </View>
            <Text className="text-sm text-muted text-center leading-relaxed mb-2">{badgeModal?.story}</Text>
            {!badgeModal?.unlocked && (
              <View className="bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3 mb-4 items-center">
                <Text className="text-xs text-primary font-semibold">Récompense : +50 pts à débloquer</Text>
              </View>
            )}
            <TouchableOpacity className="bg-primary py-4 rounded-2xl items-center" onPress={() => setBadgeModal(null)}>
              <Text className="text-white font-bold">Fermer</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}
