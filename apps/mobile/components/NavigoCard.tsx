import { View, Text } from 'react-native'

export const OFFER_CARD: Record<string, { name: string; bg: string; accent: string; emoji: string }> = {
  navigo_annuel:      { name: 'Navigo Annuel',      bg: '#0D47A1', accent: '#1565C0', emoji: '🗓' },
  navigo_mois:        { name: 'Navigo Mois',         bg: '#1565C0', accent: '#1976D2', emoji: '📆' },
  navigo_semaine:     { name: 'Navigo Semaine',      bg: '#1976D2', accent: '#1E88E5', emoji: '📅' },
  navigo_senior:      { name: 'Navigo Senior',       bg: '#2E7D32', accent: '#388E3C', emoji: '🌿' },
  imagine_r_etudiant: { name: 'Imagine R Étudiant', bg: '#6A1B9A', accent: '#7B1FA2', emoji: '🎓' },
  imagine_r_scolaire: { name: 'Imagine R Scolaire', bg: '#7B1FA2', accent: '#8E24AA', emoji: '📚' },
  imagine_r_junior:   { name: 'Imagine R Junior',   bg: '#880E4F', accent: '#AD1457', emoji: '👦' },
  tst_50:             { name: 'Solidarité 50%',      bg: '#BF360C', accent: '#D84315', emoji: '🤝' },
  tst_75:             { name: 'Solidarité 75%',      bg: '#E65100', accent: '#F4511E', emoji: '🤝' },
  tst_gratuite:       { name: 'Solidarité Gratuit',  bg: '#F57C00', accent: '#FB8C00', emoji: '🤝' },
  amethyste:          { name: 'Améthyste',           bg: '#4A148C', accent: '#6A1B9A', emoji: '♿' },
  liberte_plus:       { name: 'Navigo Liberté+',     bg: '#006064', accent: '#00838F', emoji: '🎫' },
}

export function NavigoCard({ offerId, firstName, lastName, endDate }: {
  offerId: string
  firstName: string
  lastName: string
  endDate?: string
}) {
  const card = OFFER_CARD[offerId] ?? {
    name: offerId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    bg: '#1A73E8', accent: '#1E88E5', emoji: '🎫',
  }
  const expiry = endDate
    ? new Date(endDate).toLocaleDateString('fr-FR', { month: '2-digit', year: '2-digit' })
    : null

  return (
    <View style={{ backgroundColor: card.bg, height: 190, borderRadius: 24, overflow: 'hidden', marginHorizontal: 24, marginTop: 16 }}>
      <View style={{ position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: card.accent, opacity: 0.5, top: -60, right: -50 }} />
      <View style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: card.accent, opacity: 0.3, bottom: -40, right: 40 }} />

      <View style={{ flex: 1, padding: 20, justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 28, height: 20, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' }} />
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '900', letterSpacing: 2 }}>navigo</Text>
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '600' }}>Comutitres · IDFM</Text>
        </View>

        <View>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' }}>Forfait</Text>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 2 }}>{card.emoji} {card.name}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 2 }}>Île-de-France · Toutes zones 1→5</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>Titulaire</Text>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', marginTop: 1 }}>{firstName} {lastName}</Text>
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
