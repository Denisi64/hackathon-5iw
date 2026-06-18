import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { useOnboardingStore } from '../../stores/onboarding'

const MOCK_CODE = '4813'

function ProgressBar({ step, total = 7 }: { step: number; total?: number }) {
  return (
    <View className="flex-row gap-1 px-6 pt-4">
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} className="flex-1 h-1 rounded-full" style={{ backgroundColor: i < step ? '#1A73E8' : '#E8EDF5' }} />
      ))}
    </View>
  )
}

export default function VerifyScreen() {
  const router = useRouter()
  const { email } = useOnboardingStore()
  const [digits, setDigits] = useState(['', '', '', ''])
  const [error, setError] = useState(false)
  const [resent, setResent] = useState(false)
  const inputs = useRef<(TextInput | null)[]>([])

  const code = digits.join('')
  const isComplete = code.length === 4

  const handleDigit = (val: string, idx: number) => {
    const cleaned = val.replace(/[^0-9]/g, '').slice(-1)
    const next = [...digits]
    next[idx] = cleaned
    setDigits(next)
    setError(false)
    if (cleaned && idx < 3) inputs.current[idx + 1]?.focus()
    if (!cleaned && idx > 0) inputs.current[idx - 1]?.focus()
  }

  const handleContinue = () => {
    // Mock: accept any 4-digit code (or the specific mock code)
    if (isComplete) {
      router.push('/onboarding/profile')
    }
  }

  const handleResend = () => {
    setResent(true)
    setDigits(['', '', '', ''])
    inputs.current[0]?.focus()
    setTimeout(() => setResent(false), 3000)
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ProgressBar step={4} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-1 px-6">

          <View className="pt-4 pb-2 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <Text className="text-2xl text-muted">‹</Text>
            </TouchableOpacity>
            <Text className="text-xs font-semibold text-muted">Étape 4 sur 7</Text>
            <View className="w-8" />
          </View>

          <View className="flex-1 pt-6 items-center">
            <Text className="text-xl font-black text-fg mb-1 text-center">VÉRIFIEZ VOTRE COMPTE</Text>
            <Text className="text-sm text-muted text-center mb-2">Nous vous envoyons un code de vérification.</Text>
            <Text className="text-xs text-primary font-semibold mb-10">{email}</Text>

            <Text className="text-sm font-semibold text-fg mb-4">Entrez le code SMS</Text>

            {/* 4 OTP boxes */}
            <View className="flex-row gap-4 mb-6">
              {digits.map((d, i) => (
                <TextInput
                  key={i}
                  ref={(r) => { inputs.current[i] = r }}
                  className="w-16 h-16 text-center text-2xl font-black text-fg rounded-2xl border-2"
                  style={{ borderColor: d ? '#1A73E8' : error ? '#EF4444' : '#E2E8F0', backgroundColor: d ? '#EFF6FF' : '#F8FAFC' }}
                  value={d}
                  onChangeText={(v) => handleDigit(v, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  autoFocus={i === 0}
                />
              ))}
            </View>

            {error && <Text className="text-red-500 text-sm mb-4">Code incorrect. Réessayez.</Text>}

            {/* Mock hint */}
            <View className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
              <Text className="text-xs text-amber-700 text-center">
                Mode démo — code : <Text className="font-black">{MOCK_CODE}</Text>
              </Text>
            </View>

            <TouchableOpacity onPress={handleResend}>
              <Text className="text-sm text-primary font-semibold">
                {resent ? '✓ Code renvoyé !' : 'Renvoyer le code'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="pb-8">
            <TouchableOpacity
              className={`py-4 rounded-2xl items-center ${isComplete ? 'bg-primary' : 'bg-border'}`}
              disabled={!isComplete}
              onPress={handleContinue}
            >
              <Text className="text-white text-base font-bold">Continuer</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
