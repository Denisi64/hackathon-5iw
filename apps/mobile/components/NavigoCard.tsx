import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export const OFFER_CARD: Record<string, { name: string; bg: string; accent: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  navigo_annuel:      { name: 'Navigo Annuel',      bg: '#0D47A1', accent: '#1565C0', icon: 'calendar-outline' },
  navigo_mois:        { name: 'Navigo Mois',         bg: '#1565C0', accent: '#1976D2', icon: 'calendar-outline' },
  navigo_semaine:     { name: 'Navigo Semaine',      bg: '#1976D2', accent: '#1E88E5', icon: 'calendar-outline' },
  navigo_senior:      { name: 'Navigo Senior',       bg: '#2E7D32', accent: '#388E3C', icon: 'leaf-outline' },
  imagine_r_etudiant: { name: 'Imagine R Étudiant', bg: '#6A1B9A', accent: '#7B1FA2', icon: 'school-outline' },
  imagine_r_scolaire: { name: 'Imagine R Scolaire', bg: '#7B1FA2', accent: '#8E24AA', icon: 'school-outline' },
  imagine_r_junior:   { name: 'Imagine R Junior',   bg: '#880E4F', accent: '#AD1457', icon: 'happy-outline' },
  tst_50:             { name: 'Solidarité 50%',      bg: '#BF360C', accent: '#D84315', icon: 'hand-left-outline' },
  tst_75:             { name: 'Solidarité 75%',      bg: '#E65100', accent: '#F4511E', icon: 'hand-left-outline' },
  tst_gratuite:       { name: 'Solidarité Gratuit',  bg: '#F57C00', accent: '#FB8C00', icon: 'hand-left-outline' },
  amethyste:          { name: 'Améthyste',           bg: '#4A148C', accent: '#6A1B9A', icon: 'accessibility-outline' },
  liberte_plus:       { name: 'Navigo Liberté+',     bg: '#006064', accent: '#00838F', icon: 'ticket-outline' },
}

function genCardNumber(id: string): string {
  const digits = id.replace(/-/g, '').slice(0, 10).split('').map(c => parseInt(c, 16) % 10).join('')
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`
}

export function NavigoCard({ offerId, firstName, lastName, endDate, subscriptionId }: {
  offerId: string
  firstName: string
  lastName: string
  endDate?: string
  subscriptionId?: string
}) {
  const card = OFFER_CARD[offerId] ?? {
    name: offerId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    bg: '#1A73E8', accent: '#1E88E5', icon: 'card-outline' as const,
  }
  const expiry = endDate
    ? new Date(endDate).toLocaleDateString('fr-FR', { month: '2-digit', year: '2-digit' })
    : null
  const cardNumber = subscriptionId ? genCardNumber(subscriptionId) : null

  return (
    <View style={{ backgroundColor: card.bg, height: 190, borderRadius: 24, overflow: 'hidden', marginHorizontal: 24, marginTop: 16 }}>
      <View style={{ position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: card.accent, opacity: 0.5, top: -60, right: -50 }} />
      <View style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: card.accent, opacity: 0.3, bottom: -40, right: 40 }} />

      <View style={{ flex: 1, padding: 20, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' }}>Forfait</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <Ionicons name={card.icon} size={18} color="rgba(255,255,255,0.85)" />
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>{card.name}</Text>
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 }}>Île-de-France · Toutes zones 1→5</Text>
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '600' }}>Comutitres · IDFM</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>Titulaire</Text>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 1 }}>{firstName} {lastName}</Text>
            {cardNumber && (
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', marginTop: 3, letterSpacing: 1.5 }}>{cardNumber}</Text>
            )}
          </View>
          {expiry && (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>Expire</Text>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 1 }}>{expiry}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}
