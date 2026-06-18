import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Modal, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useEffect, useRef, useCallback } from 'react'
import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { useAuthStore } from '../../stores/auth'
import { useSimulatorStore } from '../../stores/simulator'
import { subscriptionsService, offersService, documentsService, usersService, BackendOffer } from '../../services/api'
import { SimulatorContent } from './simulator'
import { AssistantContent } from './assistant'

// ─── Profils internes → profils backend ──────────────────────────────────────

const PROFILE_TO_BACKEND: Record<string, string> = {
  student:    'student',
  worker:     'employee',
  senior:     'senior',
  parent:     'junior_school',
  solidarity: 'tst',
  amethyst:   'amethyste',
}

// ─── Métadonnées UI par offer ID (icon, couleur, avantages) ──────────────────

type OfferMeta = { icon: React.ComponentProps<typeof Ionicons>['name']; color: string; advantages: string[] }

const OFFER_META: Record<string, OfferMeta> = {
  imagine_r_etudiant: {
    icon: 'school-outline', color: '#1A73E8',
    advantages: ['Moins de 26 ans, enseignement supérieur', 'Résidence en Île-de-France requise', 'Toutes zones 1→5 incluses'],
  },
  navigo_annuel: {
    icon: 'briefcase-outline', color: '#0D47A1',
    advantages: ['50% remboursé par l\'employeur', '12e mois offert', 'Tout le réseau IDF inclus'],
  },
  navigo_mois: {
    icon: 'calendar-outline', color: '#1565C0',
    advantages: ['Sans engagement, résiliable à tout moment', 'Tout le réseau IDF inclus', 'Valable du 1er au dernier jour du mois'],
  },
  navigo_semaine: {
    icon: 'calendar-outline', color: '#1976D2',
    advantages: ['Valable du lundi au dimanche', 'Tout le réseau IDF inclus', 'Idéal pour les semaines ponctuelles'],
  },
  navigo_senior: {
    icon: 'leaf-outline', color: '#2E7D32',
    advantages: ['Dès 62 ans, sans condition de ressources', 'Moitié prix vs Navigo Annuel standard', 'Tout le réseau IDF inclus'],
  },
  imagine_r_junior: {
    icon: 'happy-outline', color: '#E91E63',
    advantages: ['Moins de 11 ans au 31 décembre', 'Résidence en Île-de-France requise', 'Toutes zones 1→5 — seulement 25,20 €/an'],
  },
  imagine_r_scolaire: {
    icon: 'book-outline', color: '#9C27B0',
    advantages: ['Élèves primaire, collège, lycée et apprentis', 'Résidence en Île-de-France requise', 'Toutes zones 1→5 incluses'],
  },
  tst_gratuite: {
    icon: 'hand-left-outline', color: '#F57C00',
    advantages: ['Transport 100% gratuit (RSA, ASS+CSS)', 'Renouvellement trimestriel automatique', 'Tout le réseau IDF inclus'],
  },
  tst_75: {
    icon: 'hand-left-outline', color: '#E65100',
    advantages: ['75% de réduction (CMU-C, CSS, ASS)', 'Renouvellement trimestriel', 'Tout le réseau IDF inclus'],
  },
  tst_50: {
    icon: 'hand-left-outline', color: '#BF360C',
    advantages: ['50% de réduction pour les bénéficiaires AME', 'Renouvellement trimestriel', 'Tout le réseau IDF inclus'],
  },
  amethyste: {
    icon: 'accessibility-outline', color: '#7B1FA2',
    advantages: ['Personnes reconnues handicapées (MDPH)', 'Accompagnant voyageant gratuitement', 'Toutes zones 1→5 incluses'],
  },
  liberte_plus: {
    icon: 'ticket-outline', color: '#00838F',
    advantages: ['1,64 € par trajet, zéro abonnement', 'Aucun engagement, rechargeable à tout moment', 'Tout le réseau IDF inclus'],
  },
}

const DEFAULT_META: OfferMeta = { icon: 'card-outline', color: '#6B7A99', advantages: [] }

const DOCS_BY_PROFILE: Record<string, string[]> = {
  student:    ['Carte étudiante', 'Certificat de scolarité'],
  worker:     ['Attestation employeur'],
  senior:     ['Pièce d\'identité'],
  parent:     ['Livret de famille', 'Carte scolaire de l\'enfant'],
  solidarity: ['Attestation CAF', 'Avis d\'imposition'],
  amethyst:   ['Notification MDPH', 'Pièce d\'identité'],
}

const DOC_TYPE_MAP: Record<string, string> = {
  'Carte étudiante':             'cni',
  'Certificat de scolarité':     'certificat_scolarite',
  'Attestation employeur':       'inconnu',
  'Pièce d\'identité':           'cni',
  'Livret de famille':           'livret_famille',
  'Carte scolaire de l\'enfant': 'certificat_scolarite',
  'Attestation CAF':             'attestation_caf',
  'Avis d\'imposition':          'attestation_caf',
  'Notification MDPH':           'carte_invalidite',
}

type DocStatus =
  | { state: 'idle' }
  | { state: 'uploading' }
  | { state: 'ai_prompt'; file: { uri: string; name: string; mimeType: string } }
  | { state: 'verifying' }
  | { state: 'ai_valid'; confidence: number }
  | { state: 'ai_issues'; confidence: number; issues: string[] }
  | { state: 'manual' }

interface Profile { id: string; label: string; desc: string; icon: React.ComponentProps<typeof Ionicons>['name'] }

const PROFILES: Profile[] = [
  { id: 'student',    label: 'Étudiant(e)',     desc: '18-28 ans · Supérieur / Université',   icon: 'school-outline' },
  { id: 'worker',     label: 'Salarié / Actif', desc: 'Trajet maison ↔ travail',              icon: 'briefcase-outline' },
  { id: 'senior',     label: 'Senior 62+',       desc: 'Profiter de la retraite',              icon: 'leaf-outline' },
  { id: 'parent',     label: 'Parent',           desc: 'Souscription pour votre enfant',       icon: 'people-outline' },
  { id: 'solidarity', label: 'Solidarité TST',   desc: 'Tarif sous conditions de ressources',  icon: 'hand-left-outline' },
  { id: 'amethyst',   label: 'Améthyste',        desc: 'Personne en situation de handicap',    icon: 'accessibility-outline' },
]

const fmt = (cents: number | null | undefined) =>
  cents == null ? 'Variable' : cents === 0 ? 'Gratuit' : `${(cents / 100).toFixed(2).replace('.', ',')} €`

// ─── Composants communs ───────────────────────────────────────────────────────


function EpisodePill({ n }: { n: number }) {
  return (
    <View className="mb-4">
      <View className="bg-primary self-start px-3 py-1 rounded-full">
        <Text className="text-white text-xs font-black">ÉPISODE {n}</Text>
      </View>
    </View>
  )
}

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <View className="flex-row justify-center gap-2 py-3">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className="rounded-full"
          style={{ width: i === current ? 20 : 8, height: 8, backgroundColor: i === current ? '#1A73E8' : i < current ? '#93C5FD' : '#E2E8F0' }}
        />
      ))}
    </View>
  )
}

function BotBubble({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View className="flex-row gap-3 mb-6">
      <View className="w-9 h-9 rounded-full bg-primary items-center justify-center">
        <Text className="text-white text-sm font-black">C</Text>
      </View>
      <View className="flex-1 bg-surface border border-border rounded-2xl rounded-tl-none px-4 py-3">
        <Text className="text-sm font-bold text-fg">{title}</Text>
        <Text className="text-xs text-muted mt-1">{subtitle}</Text>
      </View>
    </View>
  )
}

// ─── Épisode 1 — Profil ───────────────────────────────────────────────────────

function Ep1Situation({ profile, loading, onSelect, onNext }: {
  profile: string | null
  loading: boolean
  onSelect: (id: string) => void
  onNext: () => void
}) {
  return (
    <View className="flex-1">
      <EpisodePill n={1} />
      <BotBubble title="Parlez-nous un peu de vous." subtitle="Nous trouverons la solution la plus adaptée à votre situation." />

      <Text className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Votre situation</Text>
      <View className="gap-2 mb-6">
        {PROFILES.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => onSelect(p.id)}
            className={`flex-row items-center gap-3 px-4 py-3 rounded-2xl border-2 ${
              profile === p.id ? 'border-primary bg-primary/5' : 'border-border bg-surface'
            }`}
          >
            <Ionicons name={p.icon} size={22} color={profile === p.id ? '#1A73E8' : '#6B7A99'} />
            <View className="flex-1">
              <Text className={`font-bold text-sm ${profile === p.id ? 'text-primary' : 'text-fg'}`}>{p.label}</Text>
              <Text className="text-xs text-muted">{p.desc}</Text>
            </View>
            <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${profile === p.id ? 'border-primary bg-primary' : 'border-border'}`}>
              {profile === p.id && <View className="w-2 h-2 rounded-full bg-white" />}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className={`py-4 rounded-2xl items-center flex-row justify-center gap-2 ${profile && !loading ? 'bg-primary' : 'bg-border'}`}
        disabled={!profile || loading}
        onPress={onNext}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text className="text-white font-bold">Continuer</Text>
        }
      </TouchableOpacity>
    </View>
  )
}

// ─── Épisode 2 — Découverte ───────────────────────────────────────────────────

function Ep2Decouverte({ offers, selectedOffer, onSelectOffer, onNext, loading }: {
  offers: BackendOffer[]
  selectedOffer: BackendOffer | null
  onSelectOffer: (o: BackendOffer) => void
  onNext: () => void
  loading?: boolean
}) {
  return (
    <View className="flex-1">
      <EpisodePill n={2} />
      <BotBubble
        title="Nous avons analysé votre situation."
        subtitle={offers.length > 1 ? `${offers.length} offres correspondent à votre profil. Choisissez la plus adaptée.` : 'Voici la solution la plus adaptée.'}
      />

      <View className="gap-3 mb-6">
        {offers.map((offer, i) => {
          const meta = OFFER_META[offer.id] ?? DEFAULT_META
          const isSelected = selectedOffer?.id === offer.id
          return (
            <TouchableOpacity
              key={offer.id}
              onPress={() => onSelectOffer(offer)}
              className={`rounded-2xl border-2 overflow-hidden ${isSelected ? 'border-primary' : 'border-border'}`}
            >
              <View style={{ backgroundColor: isSelected ? meta.color : '#F8FAFC' }} className="p-4">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    {i === 0 && (
                      <View className="self-start px-2 py-0.5 rounded-full mb-2 flex-row items-center gap-1" style={{ backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#EFF6FF' }}>
                        <Ionicons name="star" size={10} color={isSelected ? 'white' : '#1A73E8'} />
                        <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-primary'}`}>Recommandé</Text>
                      </View>
                    )}
                    <View className="flex-row items-center gap-2">
                      <Ionicons name={meta.icon} size={18} color={isSelected ? 'white' : meta.color} />
                      <Text className={`text-lg font-black ${isSelected ? 'text-white' : 'text-fg'}`}>{offer.name}</Text>
                    </View>
                    {offer.description != null && (
                      <Text className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-muted'}`}>{offer.description}</Text>
                    )}
                  </View>
                  <View className="items-end ml-3">
                    <Text className={`text-2xl font-black ${isSelected ? 'text-white' : 'text-primary'}`}>{fmt(offer.monthlyPrice)}</Text>
                    {offer.monthlyPrice != null && offer.monthlyPrice > 0 && (
                      <Text className={`text-xs ${isSelected ? 'text-white/70' : 'text-muted'}`}>/mois</Text>
                    )}
                  </View>
                </View>

                {isSelected && (
                  <View className="gap-1.5">
                    {meta.advantages.map((a, j) => (
                      <View key={j} className="flex-row items-center gap-2">
                        <View className="w-4 h-4 rounded-full bg-white/30 items-center justify-center">
                          <Ionicons name="checkmark" size={10} color="white" />
                        </View>
                        <Text className="text-white text-xs flex-1">{a}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {offer.yearlyPrice != null && offer.yearlyPrice > 0 && (
                <View className={`px-4 py-2 flex-row items-center justify-between ${isSelected ? 'bg-black/20' : 'bg-border/30'}`}>
                  <Text className={`text-xs ${isSelected ? 'text-white/70' : 'text-muted'}`}>Engagement annuel</Text>
                  <Text className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-fg'}`}>{fmt(offer.yearlyPrice)}/an</Text>
                </View>
              )}
            </TouchableOpacity>
          )
        })}
      </View>

      <TouchableOpacity
        className={`py-4 rounded-2xl items-center flex-row justify-center gap-2 ${selectedOffer && !loading ? 'bg-primary' : 'bg-border'}`}
        disabled={!selectedOffer || loading}
        onPress={onNext}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text className="text-white font-bold">Commencer ma souscription</Text>
        }
      </TouchableOpacity>
    </View>
  )
}

// ─── Épisode 3 — Documents ────────────────────────────────────────────────────

function DocSlot({ label, subscriptionId, token, onDone }: {
  label: string
  subscriptionId: string
  token: string
  onDone: () => void
}) {
  const [status, setStatus] = useState<DocStatus>({ state: 'idle' })
  const [aiModal, setAiModal] = useState(false)
  const [sourceModal, setSourceModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<'library' | 'files' | null>(null)
  const [pendingFile, setPendingFile] = useState<{ uri: string; name: string; mimeType: string } | null>(null)

  const pick = () => setSourceModal(true)

  const onSourceModalDismiss = async () => {
    if (pendingAction === 'library') {
      setPendingAction(null)
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: false })
      if (result.canceled || !result.assets?.[0]) return
      const asset = result.assets[0]
      setPendingFile({ uri: asset.uri, name: asset.fileName ?? `photo_${Date.now()}.jpg`, mimeType: asset.mimeType ?? 'image/jpeg' })
      setAiModal(true)
    } else if (pendingAction === 'files') {
      setPendingAction(null)
      const result = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true })
      if (result.canceled || !result.assets?.[0]) return
      const asset = result.assets[0]
      setPendingFile({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType ?? 'application/octet-stream' })
      setAiModal(true)
    }
  }

  const handleAiVerify = async () => {
    if (!pendingFile) return
    setAiModal(false)
    setStatus({ state: 'verifying' })
    try {
      const res = await documentsService.verify(token, subscriptionId, pendingFile)
      if (res.valid && res.confidence >= 70) {
        setStatus({ state: 'ai_valid', confidence: res.confidence })
        onDone()
      } else {
        setStatus({ state: 'ai_issues', confidence: res.confidence, issues: res.issues ?? [] })
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      Alert.alert('Erreur IA', msg)
      setStatus({ state: 'idle' })
    }
  }

  const handleManual = async () => {
    if (!pendingFile) return
    setAiModal(false)
    setStatus({ state: 'uploading' })
    try {
      await documentsService.upload(token, subscriptionId, DOC_TYPE_MAP[label] ?? 'inconnu', pendingFile)
      setStatus({ state: 'manual' })
      onDone()
    } catch {
      Alert.alert('Erreur', 'L\'upload a échoué. Réessayez.')
      setStatus({ state: 'idle' })
    }
  }

  const isDone = status.state === 'ai_valid' || status.state === 'manual'

  return (
    <View>
      <TouchableOpacity
        onPress={isDone ? undefined : pick}
        disabled={status.state === 'uploading' || status.state === 'verifying'}
        className={`flex-row items-center gap-3 p-4 rounded-2xl border-2 ${
          isDone ? 'border-green-400 bg-green-50'
          : status.state === 'ai_issues' ? 'border-amber-400 bg-amber-50'
          : 'border-border bg-surface'
        }`}
      >
        <View className={`w-10 h-10 rounded-xl items-center justify-center ${
          isDone ? 'bg-green-100' : status.state === 'ai_issues' ? 'bg-amber-100' : 'bg-primary/10'
        }`}>
          {(status.state === 'uploading' || status.state === 'verifying')
            ? <ActivityIndicator size="small" color="#1A73E8" />
            : isDone
              ? <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
              : status.state === 'ai_issues'
                ? <Ionicons name="warning-outline" size={22} color="#D97706" />
                : <Ionicons name="document-outline" size={22} color="#6B7A99" />
          }
        </View>

        <View className="flex-1">
          <Text className={`font-bold text-sm ${isDone ? 'text-green-700' : status.state === 'ai_issues' ? 'text-amber-700' : 'text-fg'}`}>
            {label}
          </Text>
          <Text className="text-xs text-muted">
            {status.state === 'idle' && 'Appuyez pour choisir un fichier'}
            {status.state === 'uploading' && 'Envoi en cours…'}
            {status.state === 'verifying' && 'Analyse IA en cours…'}
            {status.state === 'ai_valid' && `Validé par l'IA (${status.confidence}% de confiance)`}
            {status.state === 'manual' && 'Envoyé pour examen manuel'}
            {status.state === 'ai_issues' && `Score ${status.confidence}% — vérification recommandée`}
          </Text>
        </View>

        {!isDone && status.state === 'idle' && (
          <View className="bg-primary px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">+ Ajouter</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Détail des problèmes IA */}
      {status.state === 'ai_issues' && status.issues.length > 0 && (
        <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-1 mb-1">
          {status.issues.map((issue, i) => (
            <Text key={i} className="text-xs text-amber-700">• {issue}</Text>
          ))}
          <View className="flex-row gap-2 mt-2">
            <TouchableOpacity onPress={pick} className="flex-1 bg-amber-500 py-2 rounded-xl items-center">
              <Text className="text-white text-xs font-bold">Réessayer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleManual} className="flex-1 border border-amber-400 py-2 rounded-xl items-center">
              <Text className="text-amber-700 text-xs font-bold">Envoyer quand même</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modal choix source */}
      <Modal visible={sourceModal} transparent animationType="slide" onDismiss={onSourceModalDismiss}>
        <View className="flex-1 bg-black/50 items-center justify-end">
          <View className="bg-white rounded-t-3xl p-6 w-full">
            <Text className="text-base font-black text-fg mb-4">Ajouter un document</Text>
            <TouchableOpacity onPress={() => { setPendingAction('library'); setSourceModal(false) }} className="flex-row items-center gap-3 py-4 border-b border-border">
              <Ionicons name="images-outline" size={22} color="#1A73E8" />
              <Text className="text-fg font-semibold">Photothèque</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setPendingAction('files'); setSourceModal(false) }} className="flex-row items-center gap-3 py-4 border-b border-border">
              <Ionicons name="folder-outline" size={22} color="#1A73E8" />
              <Text className="text-fg font-semibold">Fichiers</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSourceModal(false)} className="py-4 items-center">
              <Text className="text-muted font-semibold">Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal choix IA / Manuel */}
      <Modal visible={aiModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full">
            <Text className="text-lg font-black text-fg mb-1">Vérification IA</Text>
            <Text className="text-sm text-muted mb-5">
              Notre IA peut analyser votre document instantanément et valider votre dossier sans attendre.
            </Text>
            <View className="bg-primary/5 border border-primary/20 rounded-2xl p-3 mb-5 flex-row gap-2">
              <Ionicons name="hardware-chip-outline" size={22} color="#1A73E8" />
              <View className="flex-1">
                <Text className="text-sm font-bold text-fg">Vérification automatique</Text>
                <Text className="text-xs text-muted">Résultat en quelques secondes · Données non conservées</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleAiVerify} className="bg-primary py-3 rounded-2xl items-center mb-3">
              <Text className="text-white font-bold">Vérifier avec l'IA</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleManual} className="border border-border py-3 rounded-2xl items-center">
              <Text className="text-muted text-sm">Non merci — examen manuel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function Ep3Documents({ profile, subscriptionId, token, onNext }: {
  profile: string
  subscriptionId: string
  token: string
  onNext: () => void
}) {
  const required = DOCS_BY_PROFILE[profile] ?? []
  const [done, setDone] = useState<Set<string>>(new Set())

  const markDone = (doc: string) => setDone((prev) => new Set([...prev, doc]))
  const allDone = required.every((d) => done.has(d))

  return (
    <View className="flex-1">
      <EpisodePill n={3} />
      <BotBubble title="Ajoutez vos justificatifs." subtitle="JPG, PNG ou PDF · Max 5 Mo par fichier" />

      <View className="gap-3 mb-6">
        {required.map((doc) => (
          <DocSlot
            key={doc}
            label={doc}
            subscriptionId={subscriptionId}
            token={token}
            onDone={() => markDone(doc)}
          />
        ))}
      </View>

      {allDone && (
        <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4 flex-row gap-3 items-center">
          <Ionicons name="checkmark-circle" size={28} color="#16A34A" />
          <View>
            <Text className="text-sm font-bold text-green-700">Tous vos documents sont prêts</Text>
            <Text className="text-xs text-green-600">Passez au paiement pour finaliser votre souscription</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        className={`py-4 rounded-2xl items-center ${allDone ? 'bg-primary' : 'bg-border'}`}
        disabled={!allDone}
        onPress={onNext}
      >
        <Text className="text-white font-bold">Continuer</Text>
      </TouchableOpacity>
    </View>
  )
}

// ─── Épisode 4 — Paiement ────────────────────────────────────────────────────

function Ep4Paiement({ offer, subscriptionId, onSuccess, onError }: {
  offer: BackendOffer
  subscriptionId: string
  onSuccess: () => void
  onError: (msg: string) => void
}) {
  const { token } = useAuthStore()
  const meta = OFFER_META[offer.id] ?? DEFAULT_META
  const [card, setCard] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [loading, setLoading] = useState(false)

  const fmtCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const fmtExpiry = (v: string) => {
    const n = v.replace(/\D/g, '').slice(0, 4)
    return n.length > 2 ? `${n.slice(0, 2)}/${n.slice(2)}` : n
  }

  const canPay = card.replace(/\s/g, '').length === 16 && expiry.length === 5 && cvv.length === 3

  const handlePay = async () => {
    if (!token) return
    setLoading(true)
    try {
      await subscriptionsService.confirm(token, subscriptionId)
      onSuccess()
    } catch (e: unknown) {
      onError(e instanceof Error ? e.message : 'Erreur de paiement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1">
      <EpisodePill n={4} />

      <View className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-5 flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: meta.color + '20' }}>
          <Ionicons name={meta.icon} size={22} color={meta.color} />
        </View>
        <View className="flex-1">
          <Text className="font-bold text-fg text-sm">{offer.name}</Text>
          <Text className="text-xs text-muted">Renouvellement {offer.renewal === 'yearly' ? 'annuel' : offer.renewal ?? ''}</Text>
        </View>
        <Text className="font-black text-primary">{fmt(offer.yearlyPrice ?? offer.monthlyPrice)}</Text>
      </View>

      <View className="gap-4 mb-6">
        <View>
          <Text className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">Numéro de carte</Text>
          <TextInput
            className="bg-surface border border-border rounded-2xl px-4 py-4 text-fg text-base"
            placeholder="1234 5678 9012 3456"
            placeholderTextColor="#9BA3B2"
            value={card}
            onChangeText={(v) => setCard(fmtCard(v))}
            keyboardType="numeric"
            maxLength={19}
          />
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Text className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">Expiration</Text>
            <TextInput
              className="bg-surface border border-border rounded-2xl px-4 py-4 text-fg text-base"
              placeholder="MM/AA"
              placeholderTextColor="#9BA3B2"
              value={expiry}
              onChangeText={(v) => setExpiry(fmtExpiry(v))}
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-semibold text-muted mb-2 uppercase tracking-wide">CVV</Text>
            <TextInput
              className="bg-surface border border-border rounded-2xl px-4 py-4 text-fg text-base"
              placeholder="123"
              placeholderTextColor="#9BA3B2"
              value={cvv}
              onChangeText={(v) => setCvv(v.replace(/\D/g, '').slice(0, 3))}
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
            />
          </View>
        </View>
      </View>

      <View className="bg-surface border border-border rounded-xl px-4 py-3 mb-4 flex-row gap-2 items-center">
        <Ionicons name="lock-closed-outline" size={14} color="#6B7A99" />
        <Text className="text-xs text-muted">Paiement sécurisé via Stripe · Vos données ne sont jamais stockées</Text>
      </View>

      <TouchableOpacity
        className={`py-4 rounded-2xl items-center flex-row justify-center gap-2 ${canPay && !loading ? 'bg-primary' : 'bg-border'}`}
        disabled={!canPay || loading}
        onPress={handlePay}
      >
        {loading
          ? <ActivityIndicator color="#fff" size="small" />
          : <Text className="text-white font-bold">
              Payer {offer.yearlyPrice != null && offer.yearlyPrice > 0 ? fmt(offer.yearlyPrice) : fmt(offer.monthlyPrice)}
            </Text>
        }
      </TouchableOpacity>
    </View>
  )
}

// ─── Épisode 5 — Confirmation ────────────────────────────────────────────────

function Ep5Confirmation({ offer, onRestart }: { offer: BackendOffer; onRestart: () => void }) {
  const { user } = useAuthStore()
  const meta = OFFER_META[offer.id] ?? DEFAULT_META
  const today = new Date()
  const startDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`

  return (
    <View className="flex-1 items-center">
      <EpisodePill n={5} />

      <View className="w-full bg-primary rounded-3xl p-6 mb-6 items-center">
        <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center mb-4">
          <Ionicons name={meta.icon} size={40} color="white" />
        </View>
        <Text className="text-white/70 text-xs uppercase tracking-widest mb-1">Forfait validé</Text>
        <Text className="text-white text-2xl font-black text-center mb-1">
          Bonne nouvelle {user?.firstName ?? ''} !
        </Text>
        <Text className="text-white/80 text-sm text-center">
          Votre {offer.name} est activé.
        </Text>
      </View>

      <View className="w-full gap-3 mb-8">
        <View className="bg-surface border border-border rounded-2xl p-4 flex-row items-center gap-3">
          <Ionicons name="calendar-outline" size={24} color="#6B7A99" />
          <View>
            <Text className="text-sm font-bold text-fg">Valide à partir du {startDate}</Text>
            <Text className="text-xs text-muted">Renouvellement automatique dans 12 mois</Text>
          </View>
        </View>
        <View className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex-row items-center gap-3">
          <Ionicons name="phone-portrait-outline" size={24} color="#1A73E8" />
          <View>
            <Text className="text-sm font-bold text-fg">Carte virtuelle disponible</Text>
            <Text className="text-xs text-muted">Accessible dans « Mon espace »</Text>
          </View>
        </View>
        <View className="bg-green-50 border border-green-200 rounded-2xl p-4 flex-row items-center gap-3">
          <Ionicons name="trophy-outline" size={24} color="#16A34A" />
          <View>
            <Text className="text-sm font-bold text-green-700">+150 points gagnés !</Text>
            <Text className="text-xs text-green-600">Votre première souscription Comutitres</Text>
          </View>
        </View>
      </View>

      <Text className="text-xs text-muted text-center italic mb-6">
        "Chaque trajet raconte une histoire.{'\n'}La vôtre commence maintenant."
      </Text>

    </View>
  )
}

// ─── Écran principal ──────────────────────────────────────────────────────────

const INNER_TABS = ['Simulateur', 'Souscrire', 'Assistant'] as const

function SubscribeFlow() {
  const [episode, setEpisode] = useState(0)
  const [profile, setProfile] = useState<string | null>(null)
  const [backendOffers, setBackendOffers] = useState<BackendOffer[]>([])
  const [selectedOffer, setSelectedOffer] = useState<BackendOffer | null>(null)
  const [loadingOffers, setLoadingOffers] = useState(false)
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null)
  const [startingSubscription, setStartingSubscription] = useState(false)
  const [activeSub, setActiveSub] = useState<{ status: string } | null>(null)
  const { token } = useAuthStore()
  const router = useRouter()

  useFocusEffect(useCallback(() => {
    if (!token) return
    usersService.getSubscription(token).then((s) => setActiveSub(s)).catch(() => null)
  }, [token]))
  const { resumeSubId, resumeOfferId } = useLocalSearchParams<{ resumeSubId?: string; resumeOfferId?: string }>()
  const { offerId: handoffOfferId, profile: handoffProfile, clearHandoff } = useSimulatorStore()
  const resumeHandled = useRef(false)
  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (!resumeSubId || !resumeOfferId || resumeHandled.current) return
    resumeHandled.current = true
    offersService.getAll().then((offers) => {
      const match = offers.find((o) => o.id === resumeOfferId)
      if (match) {
        setSelectedOffer(match)
        setSubscriptionId(resumeSubId)
        setEpisode(3)
      }
    }).catch(() => null)
  }, [resumeSubId, resumeOfferId])

  useEffect(() => {
    if (!handoffOfferId || !handoffProfile) return
    clearHandoff()
    const backendProfile = PROFILE_TO_BACKEND[handoffProfile] ?? handoffProfile
    setProfile(handoffProfile)
    setLoadingOffers(true)
    offersService.getByProfile(backendProfile).then((offers) => {
      setBackendOffers(offers)
      const match = offers.find((o) => o.id === handoffOfferId)
      setSelectedOffer(match ?? offers[0] ?? null)
      setEpisode(1)
    }).catch(() => null).finally(() => setLoadingOffers(false))
  }, [handoffOfferId, handoffProfile, clearHandoff])

  const confirmProfile = async () => {
    if (!profile) return
    setLoadingOffers(true)
    try {
      const backendProfile = PROFILE_TO_BACKEND[profile] ?? profile
      const data = await offersService.getByProfile(backendProfile)
      setBackendOffers(data)
      setSelectedOffer(data[0] ?? null)
      setEpisode(1)
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les offres. Vérifiez votre connexion.')
    } finally {
      setLoadingOffers(false)
    }
  }

  const startSubscription = async () => {
    if (!token || !selectedOffer) return
    setStartingSubscription(true)
    try {
      const sub = await subscriptionsService.create(token, selectedOffer.id)
      setSubscriptionId(sub.id)
      setEpisode(2)
    } catch (e: unknown) {
      Alert.alert('Erreur', e instanceof Error ? e.message : 'Impossible de démarrer la souscription')
    } finally {
      setStartingSubscription(false)
    }
  }

  const restart = useCallback(() => {
    setEpisode(0)
    setProfile(null)
    setBackendOffers([])
    setSelectedOffer(null)
    setSubscriptionId(null)
    scrollRef.current?.scrollTo({ y: 0, animated: false })
  }, [])

  const cancel = useCallback(() => {
    Keyboard.dismiss()
    if (token && subscriptionId) {
      subscriptionsService.cancel(token, subscriptionId).catch(() => null)
    }
    restart()
    router.replace('/(tabs)/account')
  }, [router, token, subscriptionId, restart])

  if (activeSub?.status === 'active' && episode < 4) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-8">
        <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
          <Ionicons name="checkmark-circle" size={44} color="#16A34A" />
        </View>
        <Text className="text-xl font-black text-fg text-center mb-2">Abonnement actif</Text>
        <Text className="text-sm text-muted text-center mb-8">
          Vous avez déjà un abonnement Navigo en cours. Rendez-vous sur l'onglet Mon Navigo pour le consulter.
        </Text>
        <TouchableOpacity
          className="bg-primary px-8 py-3 rounded-2xl"
          onPress={() => router.push('/(tabs)/navigo')}
        >
          <Text className="text-white font-bold">Voir mon Navigo</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 pt-4 pb-1">
        <Text className="text-2xl font-black text-fg">Souscrire</Text>
        <Text className="text-xs text-muted mt-0.5">Chaque trajet raconte une histoire</Text>
      </View>

      <StepDots current={episode} total={5} />

      <ScrollView
        ref={scrollRef}
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 8 }}
        keyboardShouldPersistTaps="handled"
      >
        {episode === 0 && (
          <Ep1Situation
            profile={profile}
            loading={loadingOffers}
            onSelect={setProfile}
            onNext={confirmProfile}
          />
        )}
        {episode === 1 && (
          <Ep2Decouverte
            offers={backendOffers}
            selectedOffer={selectedOffer}
            onSelectOffer={setSelectedOffer}
            loading={startingSubscription}
            onNext={startSubscription}
          />
        )}
        {episode === 2 && profile && subscriptionId && token && (
          <Ep3Documents
            profile={profile}
            subscriptionId={subscriptionId}
            token={token}
            onNext={() => setEpisode(3)}
          />
        )}
        {episode === 3 && selectedOffer && subscriptionId && (
          <Ep4Paiement
            offer={selectedOffer}
            subscriptionId={subscriptionId}
            onSuccess={() => setEpisode(4)}
            onError={(msg) => Alert.alert('Erreur', msg)}
          />
        )}
        {episode === 4 && selectedOffer && (
          <Ep5Confirmation offer={selectedOffer} onRestart={restart} />
        )}
      </ScrollView>

      {episode > 0 && episode < 4 && (
        <View className="mx-6 mb-4 flex-row items-center justify-between">
          <TouchableOpacity
            className="py-2 px-3"
            onPress={() => setEpisode((e) => e - 1)}
          >
            <Text className="text-sm text-muted">‹ Retour</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="py-2 px-3"
            onPress={cancel}
          >
            <Text className="text-sm text-red-400">Annuler</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

export default function SubscribeScreen() {
  const [innerTab, setInnerTab] = useState(1)
  const handoffOfferId = useSimulatorStore((s) => s.offerId)

  useEffect(() => {
    if (handoffOfferId) setInnerTab(1)
  }, [handoffOfferId])

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row border-b border-border bg-white">
        {INNER_TABS.map((t, i) => (
          <TouchableOpacity
            key={t}
            onPress={() => setInnerTab(i)}
            className={`flex-1 py-3 items-center border-b-2 ${innerTab === i ? 'border-primary' : 'border-transparent'}`}
          >
            <Text className={`text-xs font-bold ${innerTab === i ? 'text-primary' : 'text-muted'}`}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {innerTab === 0 && <SimulatorContent />}
      {innerTab === 1 && <SubscribeFlow />}
      {innerTab === 2 && <AssistantContent />}
    </SafeAreaView>
  )
}
