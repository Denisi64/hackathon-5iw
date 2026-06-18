import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
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

const STRENGTH_LEVELS = [
  { label: 'Faible',     color: '#EF4444', min: 1 },
  { label: 'Moyen',      color: '#F97316', min: 5 },
  { label: 'Fort',       color: '#EAB308', min: 8 },
  { label: 'Excellent',  color: '#22C55E', min: 10 },
  { label: 'Confirmé',   color: '#1A73E8', min: 12 },
]

function getStrengthIndex(pwd: string): number {
  if (pwd.length === 0) return -1
  if (pwd.length < 5) return 0
  if (pwd.length < 8) return 1
  if (pwd.length < 10) return 2
  if (pwd.length < 12) return 3
  return 4
}

export default function PasswordScreen() {
  const router = useRouter()
  const { password, setField } = useOnboardingStore()
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const strengthIdx = getStrengthIndex(password)
  const isStrong = password.length >= 8
  const matches = confirm === password && confirm.length > 0
  const canContinue = isStrong && matches

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ProgressBar step={3} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-1 px-6">

          <View className="pt-4 pb-2 flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <Text className="text-2xl text-muted">‹</Text>
            </TouchableOpacity>
            <Text className="text-xs font-semibold text-muted">Étape 3 sur 7</Text>
            <View className="w-8" />
          </View>

          <View className="flex-1 pt-6">
            <Text className="text-xl font-black text-fg mb-1 text-center">CRÉEZ VOTRE MOT DE PASSE</Text>
            <Text className="text-sm text-muted text-center mb-8">Choisissez un mot de passe sécurisé pour votre compte.</Text>

            <View className="gap-4">
              {/* Mot de passe */}
              <View>
                <Text className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">Mot de passe</Text>
                <View className="flex-row items-center bg-surface border border-border rounded-2xl px-4">
                  <TextInput
                    className="flex-1 py-4 text-fg text-base"
                    placeholder="••••••••"
                    placeholderTextColor="#9BA3B2"
                    value={password}
                    onChangeText={(v) => setField('password', v)}
                    secureTextEntry={!showPwd}
                    autoFocus
                  />
                  <TouchableOpacity onPress={() => setShowPwd(s => !s)}>
                    <Text className="text-xs text-muted">{showPwd ? 'Cacher' : 'Voir'}</Text>
                  </TouchableOpacity>
                </View>

                {/* 5 niveaux de force */}
                {password.length > 0 && (
                  <View className="mt-3">
                    <View className="flex-row gap-1 mb-2">
                      {STRENGTH_LEVELS.map((lvl, i) => (
                        <View
                          key={i}
                          className="flex-1 h-1.5 rounded-full"
                          style={{ backgroundColor: i <= strengthIdx ? lvl.color : '#E8EDF5' }}
                        />
                      ))}
                    </View>
                    <Text className="text-xs font-semibold" style={{ color: strengthIdx >= 0 ? STRENGTH_LEVELS[strengthIdx].color : '#9BA3B2' }}>
                      {strengthIdx >= 0 ? STRENGTH_LEVELS[strengthIdx].label : ''}
                    </Text>
                  </View>
                )}
              </View>

              {/* Confirmer */}
              <View>
                <Text className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">Confirmer le mot de passe</Text>
                <View className="flex-row items-center bg-surface border rounded-2xl px-4" style={{ borderColor: confirm.length > 0 ? (matches ? '#22C55E' : '#EF4444') : '#E2E8F0' }}>
                  <TextInput
                    className="flex-1 py-4 text-fg text-base"
                    placeholder="••••••••"
                    placeholderTextColor="#9BA3B2"
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry={!showConfirm}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(s => !s)}>
                    <Text className="text-xs text-muted">{showConfirm ? 'Cacher' : 'Voir'}</Text>
                  </TouchableOpacity>
                </View>
                {confirm.length > 0 && !matches && (
                  <Text className="text-red-500 text-xs mt-1">Les mots de passe ne correspondent pas</Text>
                )}
              </View>
            </View>
          </View>

          <View className="pb-8">
            <TouchableOpacity
              className={`py-4 rounded-2xl items-center ${canContinue ? 'bg-primary' : 'bg-border'}`}
              disabled={!canContinue}
              onPress={() => router.push('/onboarding/verify')}
            >
              <Text className="text-white text-base font-bold">Continuer</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
