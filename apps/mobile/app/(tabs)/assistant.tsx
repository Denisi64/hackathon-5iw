import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState, useRef } from 'react'
import { chatService } from '../../services/api'
import { useAuthStore } from '../../stores/auth'

type Message = { role: 'user' | 'assistant'; text: string }

const SUGGESTIONS = [
  "Quel pass pour étudiant boursier ?",
  "Comment souscrire pour mon enfant ?",
  "Mon employeur rembourse-t-il ?",
  "Différence TST et Améthyste ?",
]

const WELCOME: Message = {
  role: 'assistant',
  text: "Bonjour ! Je suis votre assistant Comutitres. Je suis là pour vous aider à trouver le bon abonnement et répondre à toutes vos questions. Comment puis-je vous aider ?",
}

export function AssistantContent() {
  const { token } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const send = async (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { role: 'user', text: text.trim() }
    const nextMessages = [...messages, userMsg]
    setMessages([...nextMessages, { role: 'assistant', text: '' }])
    setInput('')
    setLoading(true)

    // Build history for backend (exclude welcome message, map text→content)
    const history = nextMessages
      .filter((m) => m.text)
      .map((m) => ({ role: m.role, content: m.text }))

    try {
      let accumulated = ''
      await chatService.send(token ?? '', history, (chunk) => {
        accumulated += chunk
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', text: accumulated }
          return updated
        })
        scrollRef.current?.scrollToEnd({ animated: true })
      })
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', text: "Je ne suis pas disponible pour le moment. Réessayez dans un instant." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
        <View className="px-6 py-4 border-b border-border">
          <Text className="text-xl font-black text-fg">Assistant IA</Text>
          <Text className="text-xs text-muted">Propulsé par Claude · Disponible 24h/24</Text>
        </View>

        <ScrollView
          ref={scrollRef}
          className="flex-1 px-6 py-4"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((m, i) => (
            <View
              key={i}
              className={`mb-3 max-w-[85%] ${m.role === 'user' ? 'self-end' : 'self-start'}`}
            >
              <View
                className={`px-4 py-3 rounded-2xl ${
                  m.role === 'user'
                    ? 'bg-primary rounded-br-sm'
                    : 'bg-surface border border-border rounded-bl-sm'
                }`}
              >
                <Text className={`text-sm leading-5 ${m.role === 'user' ? 'text-white' : 'text-fg'}`}>
                  {m.text}
                </Text>
              </View>
            </View>
          ))}

          {loading && (
            <View className="self-start mb-3 bg-surface border border-border px-4 py-3 rounded-2xl rounded-bl-sm">
              <Text className="text-muted text-sm">En train d'écrire…</Text>
            </View>
          )}

          {messages.length === 1 && (
            <View className="mt-4 gap-2">
              <Text className="text-xs text-muted font-semibold mb-1">Suggestions</Text>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => send(s)}
                  className="bg-surface border border-border rounded-2xl px-4 py-3"
                >
                  <Text className="text-sm text-fg">{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View className="px-4 py-3 border-t border-border flex-row gap-2 items-end">
          <TextInput
            className="flex-1 bg-surface border border-border rounded-2xl px-4 py-3 text-sm text-fg"
            placeholder="Posez votre question…"
            placeholderTextColor="#6B7A99"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={() => send(input)}
          />
          <TouchableOpacity
            className={`w-11 h-11 rounded-2xl items-center justify-center ${input.trim() ? 'bg-primary' : 'bg-border'}`}
            onPress={() => send(input)}
            disabled={!input.trim()}
          >
            <Text className="text-white font-bold text-base">↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
  )
}

export default function AssistantScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <AssistantContent />
    </SafeAreaView>
  )
}
