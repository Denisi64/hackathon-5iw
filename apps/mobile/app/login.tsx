import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { authService } from '../services/api'
import { useAuthStore } from '../stores/auth'

export default function LoginScreen() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    if (!email || !password) return
    setLoading(true)
    setError(null)
    try {
      const { accessToken, user } = await authService.login(email, password)
      setAuth(accessToken, user)
      router.replace('/(tabs)')
    } catch {
      setError('Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 px-6 justify-between pb-10">

        <View className="pt-6">
          <Text className="text-2xl font-black text-fg">
            comu<Text className="text-primary">titres</Text>
          </Text>
        </View>

        <View className="gap-5">
          <View>
            <Text className="text-3xl font-black text-fg mb-1">Bon retour</Text>
            <Text className="text-sm text-muted">Connectez-vous pour accéder à votre espace.</Text>
          </View>

          <View className="gap-3">
            <View>
              <Text className="text-xs font-semibold text-muted mb-1 uppercase tracking-wide">Email</Text>
              <TextInput
                className="bg-surface border border-border rounded-2xl px-4 py-3.5 text-fg text-sm"
                placeholder="jean.dupont@test.com"
                placeholderTextColor="#6B7A99"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View>
              <Text className="text-xs font-semibold text-muted mb-1 uppercase tracking-wide">Mot de passe</Text>
              <TextInput
                className="bg-surface border border-border rounded-2xl px-4 py-3.5 text-fg text-sm"
                placeholder="••••••••"
                placeholderTextColor="#6B7A99"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error && (
              <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                <Text className="text-red-600 text-sm">{error}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            className="bg-primary py-4 rounded-2xl items-center"
            onPress={handleLogin}
            disabled={loading || !email || !password}
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text className="text-white text-base font-bold">Se connecter</Text>
            }
          </TouchableOpacity>

          <View className="bg-surface border border-border rounded-2xl p-4">
            <Text className="text-xs text-muted font-semibold mb-2">Comptes de démonstration</Text>
            {[
              { label: 'Salarié — Navigo Annuel', email: 'jean.dupont@test.com' },
              { label: 'Étudiante — Imagine R', email: 'marie.martin@test.com' },
            ].map((demo) => (
              <TouchableOpacity key={demo.email} onPress={() => { setEmail(demo.email); setPassword('password123') }} className="py-1.5">
                <Text className="text-xs text-primary font-medium">{demo.label}</Text>
                <Text className="text-xs text-muted">{demo.email}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-center text-sm text-muted">← Retour à l'accueil</Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
