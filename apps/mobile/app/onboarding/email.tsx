import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
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

export default function EmailScreen() {
  const router = useRouter()
  const { firstName, lastName, email, setField } = useOnboardingStore()

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const suggestion = firstName && lastName
    ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@exemple.fr`
    : ''

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ProgressBar step={2} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-1 px-6">

          <View className="pt-4 pb-2 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <Text className="text-2xl text-muted">‹</Text>
            </TouchableOpacity>
            <Text className="text-xs font-semibold text-muted">Étape 2 sur 7</Text>
            <View className="w-8" />
          </View>

          <View className="flex-1 pt-6">
            <Text className="text-xl font-black text-fg mb-1 text-center">VOTRE ADRESSE EMAIL</Text>
            <Text className="text-sm text-muted text-center mb-8">Vous l'utiliserez pour vous connecter à votre compte.</Text>

            <View>
              <Text className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">Adresse email</Text>
              <TextInput
                className="bg-surface border border-border rounded-2xl px-4 py-4 text-fg text-base"
                placeholder="adresse@exemple.fr"
                placeholderTextColor="#9BA3B2"
                value={email}
                onChangeText={(v) => setField('email', v.toLowerCase())}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                autoFocus
              />
              {email.length > 0 && !isValid && (
                <Text className="text-red-500 text-xs mt-2">Format d'email invalide</Text>
              )}
            </View>
          </View>

          <View className="pb-8">
            <TouchableOpacity
              className={`py-4 rounded-2xl items-center ${isValid ? 'bg-primary' : 'bg-border'}`}
              disabled={!isValid}
              onPress={() => router.push('/onboarding/password')}
            >
              <Text className="text-white text-base font-bold">Continuer</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
