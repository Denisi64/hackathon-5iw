import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useAuthStore } from '../stores/auth'
import { API_BASE_URL } from '../constants/api'

const ADMIN_EMAILS = ['admin@comutitres.fr', 'ly.jerem@gmail.com', 'jey@gmail.com']

interface PendingDoc {
  id: string
  subscriptionId: string
  type: string
  status: string
  minioKey: string
  createdAt: string
}

async function fetchPending(token: string): Promise<PendingDoc[]> {
  const res = await fetch(`${API_BASE_URL}/documents/pending`, {
    headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
  })
  if (!res.ok) throw new Error('Erreur')
  return res.json()
}

async function patchDoc(token: string, id: string, action: 'validate' | 'reject'): Promise<void> {
  await fetch(`${API_BASE_URL}/documents/${id}/${action}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
  })
}

export default function AdminScreen() {
  const { token, user } = useAuthStore()
  const router = useRouter()
  const [docs, setDocs] = useState<PendingDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email)

  const load = useCallback(() => {
    if (!token) return
    setLoading(true)
    fetchPending(token).then(setDocs).catch(() => setDocs([])).finally(() => setLoading(false))
  }, [token])

  useEffect(() => { load() }, [load])

  const handle = async (id: string, action: 'validate' | 'reject') => {
    if (!token) return
    setActing(id)
    try {
      await patchDoc(token, id, action)
      setDocs((prev) => prev.filter((d) => d.id !== id))
    } catch {
      Alert.alert('Erreur', 'Action échouée, réessayez.')
    } finally {
      setActing(null)
    }
  }

  if (!isAdmin) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center px-8">
        <Ionicons name="lock-closed-outline" size={48} color="#CBD5E1" />
        <Text className="text-fg font-bold text-lg mt-4">Accès restreint</Text>
        <Text className="text-muted text-sm text-center mt-2">Cette page est réservée aux administrateurs.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-primary px-6 py-3 rounded-2xl">
          <Text className="text-white font-bold">Retour</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-row items-center gap-3 px-6 py-4 border-b border-border">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1A73E8" />
        </TouchableOpacity>
        <Text className="text-xl font-black text-fg flex-1">Validation documents</Text>
        <TouchableOpacity onPress={load}>
          <Ionicons name="refresh-outline" size={20} color="#6B7A99" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#1A73E8" />
        </View>
      ) : docs.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="checkmark-circle-outline" size={48} color="#16A34A" />
          <Text className="text-fg font-bold text-lg mt-4">Aucun document en attente</Text>
          <Text className="text-muted text-sm text-center mt-2">Tous les documents ont été traités.</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-6 pt-4">
          <Text className="text-xs text-muted mb-4">{docs.length} document{docs.length > 1 ? 's' : ''} en attente</Text>
          {docs.map((doc) => (
            <View key={doc.id} className="bg-card border border-border rounded-2xl p-4 mb-3">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-xs text-muted font-medium">TYPE</Text>
                  <Text className="text-sm font-bold text-fg capitalize">{doc.type.replace(/_/g, ' ')}</Text>
                </View>
                <View className="bg-amber-100 px-2 py-1 rounded-full">
                  <Text className="text-amber-700 text-xs font-bold">EN ATTENTE</Text>
                </View>
              </View>
              <Text className="text-xs text-muted mb-1">
                Souscription : <Text className="text-fg font-mono">{doc.subscriptionId.slice(0, 8)}…</Text>
              </Text>
              <Text className="text-xs text-muted mb-3">
                Reçu le {new Date(doc.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              </Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => handle(doc.id, 'validate')}
                  disabled={acting === doc.id}
                  className="flex-1 bg-green-600 py-2.5 rounded-xl items-center flex-row justify-center gap-1"
                >
                  {acting === doc.id
                    ? <ActivityIndicator size="small" color="white" />
                    : <>
                        <Ionicons name="checkmark" size={16} color="white" />
                        <Text className="text-white text-sm font-bold">Valider</Text>
                      </>
                  }
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handle(doc.id, 'reject')}
                  disabled={acting === doc.id}
                  className="flex-1 border border-red-300 py-2.5 rounded-xl items-center flex-row justify-center gap-1"
                >
                  <Ionicons name="close" size={16} color="#DC2626" />
                  <Text className="text-red-600 text-sm font-bold">Rejeter</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View className="h-8" />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
