import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useOnboardingStore } from '../../stores/onboarding'

function ProgressBar({ step, total = 7 }: { step: number; total?: number }) {
  return (
    <View className="flex-row gap-1 px-6 pt-4">
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} className="flex-1 h-1 rounded-full" style={{ backgroundColor: i < step ? '#1A73E8' : '#E8EDF5' }} />
      ))}
    </View>
  )
}

type IoniconName = React.ComponentProps<typeof Ionicons>['name']

const INTERESTS: { id: string; label: string; icon: IoniconName; color: string }[] = [
  { id: 'mobility',  label: 'Mobilité',             icon: 'train-outline',         color: '#1A73E8' },
  { id: 'culture',   label: 'Culture & Spectacles', icon: 'film-outline',           color: '#EA4335' },
  { id: 'sport',     label: 'Sport',                icon: 'football-outline',       color: '#16A34A' },
  { id: 'education', label: 'Étude & Formation',    icon: 'school-outline',         color: '#7C3AED' },
  { id: 'work',      label: 'Emploi & Carrière',    icon: 'briefcase-outline',      color: '#0D47A1' },
  { id: 'food',      label: 'Gastronomie',          icon: 'restaurant-outline',     color: '#F57C00' },
  { id: 'wellbeing', label: 'Bien-être & Loisirs',  icon: 'heart-outline',          color: '#E91E63' },
  { id: 'music',     label: 'Musique & Concerts',   icon: 'musical-notes-outline',  color: '#9C27B0' },
  { id: 'eco',       label: 'Écologie',             icon: 'leaf-outline',           color: '#16A34A' },
  { id: 'travel',    label: 'Voyages',              icon: 'airplane-outline',       color: '#1A73E8' },
  { id: 'family',    label: 'Famille',              icon: 'people-outline',         color: '#F57C00' },
  { id: 'shopping',  label: 'Shopping',             icon: 'bag-outline',            color: '#7C3AED' },
]

export default function InterestsScreen() {
  const router = useRouter()
  const { interests, setField } = useOnboardingStore()

  const toggle = (id: string) =>
    setField('interests', interests.includes(id) ? interests.filter((x) => x !== id) : [...interests, id])

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ProgressBar step={6} />
      <View className="flex-1">

        <View className="pt-4 pb-2 px-6 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Text className="text-2xl text-muted">‹</Text>
          </TouchableOpacity>
          <Text className="text-xs font-semibold text-muted">Étape 6 sur 7</Text>
          <View className="w-8" />
        </View>

        <View className="px-6 pt-4 pb-4">
          <View className="flex-row items-center gap-2 justify-center mb-1">
            <Text className="text-xl font-black text-fg text-center">CHOISISSEZ VOS CENTRES D'INTÉRÊT</Text>
          </View>
          <View className="flex-row justify-center mb-3">
            <View className="bg-primary/10 px-3 py-1 rounded-full">
              <Text className="text-xs font-bold text-primary">OPTIONNEL</Text>
            </View>
          </View>
          <Text className="text-sm text-muted text-center">Sélectionnez vos centres d'intérêt pour personnaliser votre expérience.</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-6 pb-4">
          <View className="flex-row flex-wrap gap-3">
            {INTERESTS.map((item) => {
              const selected = interests.includes(item.id)
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => toggle(item.id)}
                  className={`flex-row items-center gap-2 px-4 py-3 rounded-2xl border-2 ${
                    selected ? 'bg-primary border-primary' : 'bg-surface border-border'
                  }`}
                >
                  <Ionicons name={item.icon} size={16} color={selected ? 'white' : item.color} />
                  <Text className={`font-semibold text-sm ${selected ? 'text-white' : 'text-fg'}`}>{item.label}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </ScrollView>

        <View className="px-6 pb-8 pt-2 gap-3">
          <TouchableOpacity
            className={`py-4 rounded-2xl items-center ${interests.length > 0 ? 'bg-primary' : 'bg-border'}`}
            disabled={interests.length === 0}
            onPress={() => router.push('/onboarding/success')}
          >
            <Text className="text-white text-base font-bold">Valider mes centres d'intérêt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-3 items-center"
            onPress={() => router.push('/onboarding/success')}
          >
            <Text className="text-sm text-muted">→ Vous pouvez passer cette étape</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}
