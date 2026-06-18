import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, useWindowDimensions, Modal, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { feedService, tripsService, usersService } from '../../services/api'
import { useAuthStore } from '../../stores/auth'
import { OFFER_CARD } from '../../components/NavigoCard'
import { LineBadge } from '../../components/LineBadge'



const FEED_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  news:  'newspaper-outline',
  tip:   'bulb-outline',
  promo: 'pricetag-outline',
  alert: 'warning-outline',
}

const OFFER_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  navigo_annuel:      'calendar-outline',
  navigo_mois:        'calendar-outline',
  navigo_semaine:     'calendar-outline',
  navigo_senior:      'leaf-outline',
  imagine_r_etudiant: 'school-outline',
  imagine_r_scolaire: 'school-outline',
  imagine_r_junior:   'happy-outline',
  tst_50:             'hand-left-outline',
  tst_75:             'hand-left-outline',
  tst_gratuite:       'hand-left-outline',
  amethyste:          'accessibility-outline',
  liberte_plus:       'ticket-outline',
}

export default function HomeScreen() {
  const router = useRouter()
  const { token, user } = useAuthStore()
  const { width: screenWidth } = useWindowDimensions()

  const [gamif, setGamif] = useState<{ points: number; level: number; badges: string[] } | null>(null)
  const [todayTrips, setTodayTrips] = useState<{ totalTrips: number; totalCo2Saved: number; trips: { line: string; lineType: string; from: string; to: string; departureTime: string; tripDate?: string }[] } | null>(null)
  const [recentTrips, setRecentTrips] = useState<{ id: string; line: string; from: string; to: string; departureTime: string; tripDate: string }[]>([])
  const [feed, setFeed] = useState<{ id: string; emoji: string; title: string; body: string; tag: string; type: string }[]>([])
  const [selectedFeed, setSelectedFeed] = useState<{ id: string; emoji: string; title: string; body: string; tag: string; type: string } | null>(null)
  const [subscription, setSubscription] = useState<{ offerId: string; status: string; startDate?: string; endDate?: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useFocusEffect(useCallback(() => {
    if (!token) return
    setLoading(true)
    Promise.all([
      usersService.getGamification(token).then(setGamif).catch(() => null),
      tripsService.getToday(token).then(setTodayTrips).catch(() => null),
      tripsService.getHistory(token).then((h) => setRecentTrips(h.slice(0, 5))).catch(() => null),
      feedService.getFeed(token).then(setFeed).catch(() => []),
      usersService.getSubscription(token).then(setSubscription).catch(() => null),
    ]).finally(() => setLoading(false))
  }, [token]))

  const FEED_TYPE_COLORS: Record<string, string> = {
    news: 'bg-blue-50 text-blue-700', tip: 'bg-amber-50 text-amber-700',
    promo: 'bg-green-50 text-green-700', alert: 'bg-red-50 text-red-700',
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4 pb-2">
          <Text className="text-xs text-muted font-medium">Bonjour</Text>
          <Text className="text-2xl font-black text-fg">
            {user ? `${user.firstName} ${user.lastName}` : 'Votre tableau de bord'}
          </Text>
        </View>

        {/* Abonnement actif — card résumé */}
        {subscription && subscription.status === 'active' ? (
          <TouchableOpacity
            className="mx-6 mt-4 bg-white border border-border rounded-2xl px-4 py-3 flex-row items-center gap-3"
            onPress={() => router.push('/(tabs)/navigo')}
          >
            <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: (OFFER_CARD[subscription.offerId]?.bg ?? '#1A73E8') + '22' }}>
              <Ionicons name={OFFER_ICONS[subscription.offerId] ?? 'card-outline'} size={20} color={OFFER_CARD[subscription.offerId]?.bg ?? '#1A73E8'} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-fg">{OFFER_CARD[subscription.offerId]?.name ?? subscription.offerId}</Text>
              {subscription.endDate
                ? <Text className="text-xs text-muted">Expire le {new Date(subscription.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</Text>
                : <Text className="text-xs text-green-600 font-semibold">Actif</Text>
              }
            </View>
            <Text className="text-xs text-muted">Voir →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity className="mx-6 mt-4 bg-surface border-2 border-dashed border-border rounded-3xl p-5 items-center" onPress={() => router.push('/(tabs)/subscribe')}>
            <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mb-2">
              <Ionicons name="card-outline" size={26} color="#1A73E8" />
            </View>
            <Text className="text-fg font-bold text-base">Aucun abonnement actif</Text>
            <Text className="text-muted text-xs mt-1">Souscrire maintenant →</Text>
          </TouchableOpacity>
        )}

        {/* Gamification */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="trophy-outline" size={16} color="#6B7A99" />
            <Text className="text-base font-bold text-fg">Votre progression</Text>
          </View>
          {loading && !gamif
            ? <ActivityIndicator color="#2B8FE8" />
            : (
              <View className="flex-row gap-3">
                {[
                  { icon: 'star-outline' as const, color: '#F59E0B', label: gamif ? `${gamif.points} pts` : '— pts', desc: 'Points cumulés' },
                  { icon: 'trophy-outline' as const, color: '#8B5CF6', label: gamif ? `Niveau ${gamif.level}` : 'Niveau —', desc: 'Niveau actuel' },
                  { icon: 'train-outline' as const, color: '#1A73E8', label: todayTrips ? `${todayTrips.totalTrips} trajet${todayTrips.totalTrips > 1 ? 's' : ''}` : '—', desc: "Aujourd'hui" },
                ].map((b) => (
                  <View key={b.desc} className="flex-1 bg-card rounded-2xl p-3 border border-border items-center">
                    <View className="w-9 h-9 rounded-xl items-center justify-center mb-1" style={{ backgroundColor: b.color + '18' }}>
                      <Ionicons name={b.icon} size={18} color={b.color} />
                    </View>
                    <Text className="text-sm font-bold text-fg">{b.label}</Text>
                    <Text className="text-xs text-muted text-center">{b.desc}</Text>
                  </View>
                ))}
              </View>
            )
          }
        </View>

        {/* Trajets récents */}
        {(() => {
          const todayList = todayTrips?.trips ?? []
          const displayTrips = todayList.length > 0 ? todayList : recentTrips
          const isToday = todayList.length > 0
          const title = isToday ? "Aujourd'hui" : 'Derniers trajets'

          return (
            <View className="px-6 mt-6">
              <View className="flex-row justify-between items-center mb-3">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="train-outline" size={16} color="#6B7A99" />
                  <Text className="text-base font-bold text-fg">{title}</Text>
                </View>
                {isToday && todayTrips && todayTrips.totalCo2Saved > 0 && (
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="leaf-outline" size={12} color="#16A34A" />
                    <Text className="text-xs text-green-600 font-semibold">{todayTrips.totalCo2Saved} kg CO₂</Text>
                  </View>
                )}
                {!isToday && recentTrips.length > 0 && (
                  <TouchableOpacity onPress={() => router.push({ pathname: '/(tabs)/trips', params: { tab: '1' } })}>
                    <Text className="text-xs text-primary font-semibold">Tout voir →</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View className="bg-card rounded-2xl border border-border overflow-hidden">
                {displayTrips.length > 0
                  ? displayTrips.map((trip, i) => (
                    <TouchableOpacity
                      key={i}
                      className={`flex-row items-center px-4 py-3 ${i > 0 ? 'border-t border-border' : ''}`}
                      onPress={() => router.push({ pathname: '/(tabs)/trips', params: { tab: '1', tripId: trip.id } })}
                      activeOpacity={0.7}
                    >
                      <View className="mr-3">
                        <LineBadge line={trip.line} size={36} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-fg">{trip.from} → {trip.to}</Text>
                        <Text className="text-xs text-muted">
                          {!isToday && trip.tripDate
                            ? new Date(trip.tripDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · '
                            : ''
                          }{trip.departureTime}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                    </TouchableOpacity>
                  ))
                  : (
                    <View className="px-4 py-6 items-center">
                      <Ionicons name="train-outline" size={40} color="#CBD5E1" />
                      <Text className="text-sm text-muted text-center mt-2">Aucun trajet enregistré</Text>
                      <TouchableOpacity className="mt-3 bg-primary/10 px-4 py-2 rounded-xl" onPress={() => router.push('/(tabs)/trips')}>
                        <Text className="text-primary text-xs font-semibold">Logger un trajet →</Text>
                      </TouchableOpacity>
                    </View>
                  )
                }
              </View>
            </View>
          )
        })()}

        {/* Feed personnalisé */}
        {feed.length > 0 && (
          <View className="px-6 mt-6">
            <View className="flex-row items-center gap-2 mb-3">
              <Ionicons name="newspaper-outline" size={16} color="#6B7A99" />
              <Text className="text-base font-bold text-fg">Pour vous</Text>
            </View>
            <View className="gap-3">
              {feed.slice(0, 3).map((item) => (
                <TouchableOpacity key={item.id} className="bg-card border border-border rounded-2xl p-4" onPress={() => setSelectedFeed(item)} activeOpacity={0.7}>
                  <View className="flex-row items-start gap-3">
                    <View className={`w-9 h-9 rounded-xl items-center justify-center ${FEED_TYPE_COLORS[item.type]?.split(' ')[0] ?? 'bg-surface'}`}>
                      <Ionicons name={FEED_ICONS[item.type] ?? 'information-circle-outline'} size={18} color={item.type === 'news' ? '#1d4ed8' : item.type === 'tip' ? '#b45309' : item.type === 'promo' ? '#15803d' : '#b91c1c'} />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2 mb-1">
                        <View className={`px-2 py-0.5 rounded-full ${FEED_TYPE_COLORS[item.type] ?? 'bg-surface text-muted'}`}>
                          <Text className="text-xs font-semibold">{item.tag}</Text>
                        </View>
                      </View>
                      <Text className="text-sm font-bold text-fg">{item.title}</Text>
                      <Text className="text-xs text-muted mt-1" numberOfLines={2}>{item.body}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Bannière histoires */}
        <View className="mt-6 mb-8">
<Image
            source={require('../../assets/collageBanniere.png')}
            style={{ width: screenWidth - 48, marginHorizontal: 24, height: (screenWidth - 48) / 3.54 }}
            resizeMode="contain"
          />
        </View>

      </ScrollView>

      {/* Modal détail news */}
      <Modal visible={!!selectedFeed} transparent animationType="slide" onRequestClose={() => setSelectedFeed(null)}>
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setSelectedFeed(null)}>
          <Pressable onPress={() => {}} className="bg-white rounded-t-3xl p-6" style={{ minHeight: 300 }}>
            {selectedFeed && (
              <>
                <View className="flex-row items-center gap-3 mb-4">
                  <View className={`w-11 h-11 rounded-2xl items-center justify-center ${FEED_TYPE_COLORS[selectedFeed.type]?.split(' ')[0] ?? 'bg-surface'}`}>
                    <Ionicons name={FEED_ICONS[selectedFeed.type] ?? 'information-circle-outline'} size={22} color={selectedFeed.type === 'news' ? '#1d4ed8' : selectedFeed.type === 'tip' ? '#b45309' : selectedFeed.type === 'promo' ? '#15803d' : '#b91c1c'} />
                  </View>
                  <View className="flex-1">
                    <View className={`self-start px-2 py-0.5 rounded-full mb-1 ${FEED_TYPE_COLORS[selectedFeed.type] ?? 'bg-surface'}`}>
                      <Text className="text-xs font-semibold">{selectedFeed.tag}</Text>
                    </View>
                    <Text className="text-lg font-black text-fg">{selectedFeed.title}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedFeed(null)}>
                    <Ionicons name="close-circle" size={26} color="#CBD5E1" />
                  </TouchableOpacity>
                </View>
                <Text className="text-sm text-fg leading-relaxed">{selectedFeed.body}</Text>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}
