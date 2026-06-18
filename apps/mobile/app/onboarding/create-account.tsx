import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useOnboardingStore } from '../../stores/onboarding'

function ProgressBar({ step, total = 7 }: { step: number; total?: number }) {
  return (
    <View className="flex-row gap-1 px-6 pt-4">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className="flex-1 h-1 rounded-full"
          style={{ backgroundColor: i < step ? '#1A73E8' : '#E8EDF5' }}
        />
      ))}
    </View>
  )
}

export default function CreateAccountScreen() {
  const router = useRouter()
  const { firstName, lastName, setField } = useOnboardingStore()

  const canContinue = firstName.trim().length > 0 && lastName.trim().length > 0

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ProgressBar step={1} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-1 px-6">

          <View className="pt-4 pb-2 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <Text className="text-2xl text-muted">‹</Text>
            </TouchableOpacity>
            <Text className="text-xs font-semibold text-muted">Étape 1 sur 7</Text>
            <View className="w-8" />
          </View>

          {/* Photo + welcome */}
          <View className="items-center py-6">
            <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-4">
              <Ionicons name="hand-left-outline" size={52} color="#1A73E8" />
            </View>
            <Text className="text-2xl font-black text-fg text-center mb-1">Bienvenue !</Text>
            <Text className="text-sm text-muted text-center">Commencez votre expérience par la{'\n'}création de votre compte.</Text>
          </View>

          <Text className="text-xl font-black text-fg mb-6 text-center">CRÉEZ VOTRE COMPTE</Text>

          <View className="gap-4">
            <View>
              <Text className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">Prénom</Text>
              <TextInput
                className="bg-surface border border-border rounded-2xl px-4 py-4 text-fg text-base"
                placeholder="Lucas"
                placeholderTextColor="#9BA3B2"
                value={firstName}
                onChangeText={(v) => setField('firstName', v)}
                autoCapitalize="words"
                autoFocus
              />
            </View>
            <View>
              <Text className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">Nom</Text>
              <TextInput
                className="bg-surface border border-border rounded-2xl px-4 py-4 text-fg text-base"
                placeholder="Dupont"
                placeholderTextColor="#9BA3B2"
                value={lastName}
                onChangeText={(v) => setField('lastName', v)}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View className="flex-1" />

          <View className="pb-8">
            <TouchableOpacity
              className={`py-4 rounded-2xl items-center ${canContinue ? 'bg-primary' : 'bg-border'}`}
              disabled={!canContinue}
              onPress={() => router.push('/onboarding/email')}
            >
              <Text className="text-white text-base font-bold">Créer votre compte</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
