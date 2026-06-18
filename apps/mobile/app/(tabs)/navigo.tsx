import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { usersService } from '../../services/api'
import { useAuthStore } from '../../stores/auth'
import { NavigoCard } from '../../components/NavigoCard'

type Sub = { id: string; offerId: string; status: string; startDate?: string; endDate?: string }

export default function NavigoScreen() {
  const { token, user } = useAuthStore()
  const router = useRouter()
  const [sub, setSub] = useState<Sub | null>(null)
  const [loading, setLoading] = useState(true)

  useFocusEffect(useCallback(() => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    usersService.getSubscription(token).then(setSub).catch(() => null).finally(() => setLoading(false))
  }, [token]))

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator color="#1A73E8" />
      </SafeAreaView>
    )
  }

  if (!sub || sub.status !== 'active') {
    return (
      <SafeAreaView className="flex-1 bg-surface">
        <View className="px-6 pt-4 pb-2">
          <Text className="text-2xl font-black text-fg">Mon Navigo</Text>
          <Text className="text-xs text-muted mt-0.5">Votre titre de transport dématérialisé</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
            <Ionicons name="card-outline" size={40} color="#1A73E8" />
          </View>
          <Text className="text-lg font-black text-fg text-center mb-2">Aucun abonnement actif</Text>
          <Text className="text-sm text-muted text-center mb-6">
            Souscrivez pour obtenir votre carte Navigo virtuelle et voyager en Île-de-France.
          </Text>
          <TouchableOpacity
            className="bg-primary px-8 py-3 rounded-2xl"
            onPress={() => router.push('/(tabs)/subscribe')}
          >
            <Text className="text-white font-bold">Souscrire maintenant</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const fmtDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : null

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-black text-fg">Mon Navigo</Text>
        <Text className="text-xs text-muted mt-0.5">Votre titre de transport dématérialisé</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {user && (
          <NavigoCard
            offerId={sub.offerId}
            firstName={user.firstName}
            lastName={user.lastName}
            endDate={sub.endDate}
            subscriptionId={sub.id}
          />
        )}

        {/* QR code de validation */}
        <View className="mx-6 mt-4 bg-white border border-border rounded-3xl p-6 items-center">
          <Image
            source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=6&data=NAVIGO-${sub.id}` }}
            style={{ width: 160, height: 160, borderRadius: 8 }}
          />
          <Text className="text-xs font-semibold text-fg text-center mt-4">Présentez ce code au valideur</Text>
          <Text className="text-xs text-muted text-center mt-1">Actualisé toutes les 30 secondes</Text>
        </View>

        {/* Détails abonnement */}
        <View className="mx-6 mt-4 gap-3">
          {fmtDate(sub.startDate) && (
            <View className="bg-white border border-border rounded-2xl px-4 py-3 flex-row gap-3 items-center">
              <Ionicons name="calendar-outline" size={22} color="#6B7A99" />
              <View>
                <Text className="text-xs text-muted">Valide depuis</Text>
                <Text className="text-sm font-bold text-fg">{fmtDate(sub.startDate)}</Text>
              </View>
            </View>
          )}
          {fmtDate(sub.endDate) && (
            <View className="bg-white border border-border rounded-2xl px-4 py-3 flex-row gap-3 items-center">
              <Ionicons name="refresh-outline" size={22} color="#6B7A99" />
              <View>
                <Text className="text-xs text-muted">Expire le</Text>
                <Text className="text-sm font-bold text-fg">{fmtDate(sub.endDate)}</Text>
              </View>
            </View>
          )}
          <View className="bg-white border border-border rounded-2xl px-4 py-3 flex-row gap-3 items-center">
            <Ionicons name="map-outline" size={22} color="#6B7A99" />
            <View>
              <Text className="text-xs text-muted">Zones couvertes</Text>
              <Text className="text-sm font-bold text-fg">Toutes zones · 1 → 5</Text>
            </View>
          </View>
          <View className="bg-white border border-border rounded-2xl px-4 py-3 flex-row gap-3 items-center">
            <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
            <View>
              <Text className="text-xs text-muted">Statut</Text>
              <Text className="text-sm font-bold text-green-600">Actif</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}
