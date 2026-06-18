import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { offersService, BackendOffer } from '../../services/api'

type IoniconName = React.ComponentProps<typeof Ionicons>['name']
type SimProfile = { id: string; label: string; icon: IoniconName }

const PROFILES: SimProfile[] = [
  { id: 'employee',  label: 'Salarié',    icon: 'briefcase-outline' },
  { id: 'student',   label: 'Étudiant',   icon: 'school-outline' },
  { id: 'school',    label: 'Scolaire',   icon: 'book-outline' },
  { id: 'senior',    label: 'Senior',     icon: 'leaf-outline' },
  { id: 'tst',       label: 'TST',        icon: 'hand-left-outline' },
  { id: 'amethyste', label: 'Améthyste',  icon: 'accessibility-outline' },
]

const fmt = (cents: number | null) =>
  cents == null ? 'Variable' : cents === 0 ? 'Gratuit' : `${(cents / 100).toFixed(2).replace('.', ',')} €`

function sortOffers(offers: BackendOffer[], daysPerWeek: number): BackendOffer[] {
  return [...offers].sort((a, b) => {
    const costPerDay = (o: BackendOffer) => {
      if (o.monthlyPrice == null && o.yearlyPrice == null) return 999999
      const monthly = o.yearlyPrice != null ? o.yearlyPrice / 12 : (o.monthlyPrice ?? 999999)
      if (o.renewal === 'usage') return 0
      const tripsPerMonth = daysPerWeek * 2 * 4.33
      if (o.renewal === 'weekly') return (monthly * 12 / 52) / (daysPerWeek * 2)
      return monthly / tripsPerMonth
    }
    return costPerDay(a) - costPerDay(b)
  })
}

export function SimulatorContent() {
  const [profile, setProfile] = useState<SimProfile>(PROFILES[0])
  const [daysPerWeek, setDaysPerWeek] = useState(5)
  const [offers, setOffers] = useState<BackendOffer[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    offersService.getByProfile(profile.id)
      .then((data) => setOffers(sortOffers(data, daysPerWeek)))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false))
  }, [profile.id, daysPerWeek])

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-black text-fg">Simulateur</Text>
        <Text className="text-sm text-muted">Trouvez votre pass idéal</Text>
      </View>

        <View className="px-6 mt-4">
          <Text className="text-sm font-bold text-fg mb-2">Votre profil</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
            {PROFILES.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setProfile(p)}
                className={`flex-row items-center gap-2 px-4 py-2 rounded-2xl border ${
                  profile.id === p.id ? 'bg-primary border-primary' : 'bg-card border-border'
                }`}
              >
                <Ionicons name={p.icon} size={14} color={profile.id === p.id ? 'white' : '#6B7A99'} />
                <Text className={`text-sm font-semibold ${profile.id === p.id ? 'text-white' : 'text-fg'}`}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="px-6 mt-5">
          <Text className="text-sm font-bold text-fg mb-2">Jours de trajet par semaine : {daysPerWeek}</Text>
          <View className="flex-row gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setDaysPerWeek(d)}
                className={`flex-1 py-2 rounded-xl items-center border ${
                  daysPerWeek === d ? 'bg-primary border-primary' : 'bg-card border-border'
                }`}
              >
                <Text className={`text-sm font-bold ${daysPerWeek === d ? 'text-white' : 'text-fg'}`}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="px-6 mt-6 mb-8">
          <Text className="text-sm font-bold text-fg mb-3">Passes recommandés</Text>
          {loading ? (
            <View className="items-center py-8">
              <ActivityIndicator color="#1A73E8" />
            </View>
          ) : offers.length === 0 ? (
            <View className="bg-card border border-border rounded-2xl p-4">
              <Text className="text-muted text-sm">Aucun pass disponible. Contactez un conseiller.</Text>
            </View>
          ) : (
            offers.map((offer, i) => (
              <View key={offer.id} className={`bg-card border rounded-2xl p-4 mb-3 ${i === 0 ? 'border-primary' : 'border-border'}`}>
                {i === 0 && (
                  <View className="bg-primary self-start px-2 py-0.5 rounded-full mb-2">
                    <Text className="text-white text-xs font-bold">Recommandé</Text>
                  </View>
                )}
                <Text className="text-base font-bold text-fg">{offer.name}</Text>
                {offer.description != null && (
                  <Text className="text-xs text-muted mt-0.5 mb-2">{offer.description}</Text>
                )}
                <Text className="text-primary text-lg font-black">
                  {fmt(offer.monthlyPrice)}{offer.monthlyPrice != null && offer.monthlyPrice > 0 ? '/mois' : ''}
                </Text>
                {offer.yearlyPrice != null && offer.yearlyPrice > 0 && (
                  <Text className="text-xs text-muted mt-1">soit {fmt(offer.yearlyPrice)}/an</Text>
                )}
                {offer.id === 'navigo_annuel' && profile.id === 'employee' && (
                  <View className="flex-row items-center gap-1 mt-1">
                    <Ionicons name="bulb-outline" size={12} color="#16A34A" />
                    <Text className="text-xs text-green-600">50% remboursé par votre employeur</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
  )
}

export default function SimulatorScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <SimulatorContent />
    </SafeAreaView>
  )
}
