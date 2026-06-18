import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useEffect, useRef, useState } from 'react'
import ConfettiCannon from 'react-native-confetti-cannon'
import { authService, usersService } from '../../services/api'
import { useAuthStore } from '../../stores/auth'
import { useOnboardingStore } from '../../stores/onboarding'

const { width } = Dimensions.get('window')

function ProgressBar({ step, total = 7 }: { step: number; total?: number }) {
  return (
    <View className="flex-row gap-1 px-6 pt-4">
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} className="flex-1 h-1 rounded-full" style={{ backgroundColor: i < step ? '#1A73E8' : '#E8EDF5' }} />
      ))}
    </View>
  )
}

export default function SuccessScreen() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const { firstName, lastName, email, password, profile, interests, reset } = useOnboardingStore()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const confettiRef = useRef<any>(null)

  useEffect(() => {
    const run = async () => {
      try {
        const { accessToken, user } = await authService.register({ email, password, firstName, lastName })
        setAuth(accessToken, user)
        if (interests.length > 0) await usersService.updateInterests(accessToken, interests)
        if (profile) await usersService.updateProfile(accessToken, profile)
        reset()
        setDone(true)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Une erreur est survenue')
      }
    }
    run()
  }, [])

  useEffect(() => {
    if (done) {
      setTimeout(() => confettiRef.current?.start(), 200)
    }
  }, [done])

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="close-circle" size={64} color="#EF4444" style={{ marginBottom: 16 }} />
        <Text className="text-xl font-black text-fg mb-2 text-center">Une erreur est survenue</Text>
        <Text className="text-sm text-muted text-center mb-6">{error}</Text>
        <TouchableOpacity className="bg-primary py-4 px-8 rounded-2xl" onPress={() => router.replace('/onboarding')}>
          <Text className="text-white font-bold">Recommencer</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  if (!done) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#1A73E8" />
        <Text className="text-sm text-muted mt-4">Création du compte...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ProgressBar step={7} />

      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: width / 2, y: 0 }}
        autoStart={false}
        fadeOut
        colors={['#1A73E8', '#34A853', '#FBBC05', '#EA4335', '#9C27B0', '#FF6D00']}
      />

      <View className="bg-primary mx-6 mt-6 rounded-3xl items-center py-10 px-6">
        <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-4">
          <Ionicons name="ribbon-outline" size={52} color="white" />
        </View>
        <Text className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1">Étape 7 sur 7</Text>
        <Text className="text-2xl font-black text-white text-center">COMPTE CRÉÉ !</Text>
        <Text className="text-sm text-white/80 text-center mt-1">Votre compte est prêt. Bonne expérience !</Text>
      </View>

      <View className="flex-1 px-6 pt-8">
        <Text className="text-2xl font-black text-fg text-center mb-2">
          Félicitations {firstName} !
        </Text>
        <Text className="text-sm text-muted text-center leading-relaxed mb-8">
          Votre compte Comutitres est créé.{'\n'}Chaque trajet raconte une histoire —{'\n'}la vôtre commence maintenant.
        </Text>

        <View className="gap-3 mb-8">
          <View className="bg-primary/5 border border-primary/20 rounded-2xl px-5 py-4 flex-row items-center gap-3">
            <Ionicons name="trophy-outline" size={26} color="#1A73E8" />
            <View>
              <Text className="text-sm font-bold text-fg">Gamification activée</Text>
              <Text className="text-xs text-muted">Gagnez des points à chaque trajet</Text>
            </View>
          </View>
          <View className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex-row items-center gap-3">
            <Ionicons name="earth-outline" size={26} color="#16A34A" />
            <View>
              <Text className="text-sm font-bold text-fg">Impact CO₂ suivi</Text>
              <Text className="text-xs text-muted">Chaque trajet contribue à la planète</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-6 pb-10">
        <TouchableOpacity
          className="bg-primary py-4 rounded-2xl items-center"
          onPress={() => router.replace('/(tabs)')}
        >
          <Text className="text-white text-base font-bold">Commencer</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
