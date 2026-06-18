import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
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

const PROFILES: { id: string; label: string; icon: IoniconName; color: string }[] = [
  { id: 'student',  label: 'Étudiant',         icon: 'school-outline',        color: '#1A73E8' },
  { id: 'employee', label: 'Actif / Salarié',  icon: 'briefcase-outline',     color: '#0D47A1' },
  { id: 'school',   label: 'Élève / Parent',   icon: 'people-outline',        color: '#E91E63' },
  { id: 'senior',   label: 'Senior 62+',       icon: 'leaf-outline',          color: '#16A34A' },
  { id: 'tst',      label: 'Bénéficiaire TST', icon: 'hand-left-outline',     color: '#F57C00' },
]

export default function ProfileScreen() {
  const router = useRouter()
  const { firstName, city, birthDate, profile, setField } = useOnboardingStore()

  const canContinue = city.trim().length > 0 && birthDate.trim().length > 0

  const handleBirthDate = (v: string) => {
    // Auto-format DD/MM/YYYY
    const nums = v.replace(/\D/g, '').slice(0, 8)
    let formatted = nums
    if (nums.length > 2) formatted = nums.slice(0, 2) + '/' + nums.slice(2)
    if (nums.length > 4) formatted = nums.slice(0, 2) + '/' + nums.slice(2, 4) + '/' + nums.slice(4)
    setField('birthDate', formatted)
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ProgressBar step={5} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-1">

          <View className="pt-4 pb-2 px-6 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <Text className="text-2xl text-muted">‹</Text>
            </TouchableOpacity>
            <Text className="text-xs font-semibold text-muted">Étape 5 sur 7</Text>
            <View className="w-8" />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-6 pb-8">
            <View className="pt-4 pb-6">
              <Text className="text-xl font-black text-fg mb-1 text-center">PARLEZ-NOUS DE VOUS</Text>
              <Text className="text-sm text-muted text-center">Quelques informations pour personnaliser votre expérience{firstName ? `, ${firstName}` : ''}.</Text>
            </View>

            <View className="gap-4 mb-6">
              <View>
                <Text className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">Prénom</Text>
                <TextInput
                  className="bg-surface border border-border rounded-2xl px-4 py-4 text-fg text-base"
                  value={firstName}
                  onChangeText={(v) => setField('firstName', v)}
                  placeholder="Lucas"
                  placeholderTextColor="#9BA3B2"
                  autoCapitalize="words"
                />
              </View>

              <View>
                <Text className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">Ville</Text>
                <TextInput
                  className="bg-surface border border-border rounded-2xl px-4 py-4 text-fg text-base"
                  placeholder="Paris"
                  placeholderTextColor="#9BA3B2"
                  value={city}
                  onChangeText={(v) => setField('city', v)}
                  autoCapitalize="words"
                />
              </View>

              <View>
                <Text className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">Date de naissance</Text>
                <TextInput
                  className="bg-surface border border-border rounded-2xl px-4 py-4 text-fg text-base"
                  placeholder="JJ/MM/AAAA"
                  placeholderTextColor="#9BA3B2"
                  value={birthDate}
                  onChangeText={handleBirthDate}
                  keyboardType="numeric"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Profil (optionnel mais utile pour recommandation) */}
            <Text className="text-xs font-semibold text-muted mb-3 uppercase tracking-wide">Votre profil</Text>
            <View className="gap-2">
              {PROFILES.map((p) => {
                const selected = profile === p.id
                return (
                  <TouchableOpacity
                    key={p.id}
                    className={`flex-row items-center gap-3 px-4 py-3 rounded-2xl border-2 ${selected ? 'border-primary bg-primary/5' : 'border-border bg-surface'}`}
                    onPress={() => setField('profile', p.id)}
                  >
                    <Ionicons name={p.icon} size={20} color={selected ? '#1A73E8' : p.color} />
                    <Text className={`flex-1 text-sm font-semibold ${selected ? 'text-primary' : 'text-fg'}`}>{p.label}</Text>
                    <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${selected ? 'border-primary bg-primary' : 'border-border'}`}>
                      {selected && <View className="w-2 h-2 rounded-full bg-white" />}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>

            <TouchableOpacity
              className={`mt-8 py-4 rounded-2xl items-center ${canContinue ? 'bg-primary' : 'bg-border'}`}
              disabled={!canContinue}
              onPress={() => router.push('/onboarding/interests')}
            >
              <Text className="text-white text-base font-bold">Continuer</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
