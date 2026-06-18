import '../global.css'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff', padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 8 }}>
        Erreur au demarrage
      </Text>
      <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
        La demo a rencontre une erreur JavaScript. Ce message remplace le crash silencieux pour faciliter le test APK.
      </Text>
      <ScrollView style={{ maxHeight: 220, backgroundColor: '#F3F4F6', borderRadius: 12, padding: 12, marginBottom: 16 }}>
        <Text selectable style={{ fontSize: 12, color: '#111827' }}>
          {error.message}
          {'\n\n'}
          {error.stack}
        </Text>
      </ScrollView>
      <TouchableOpacity onPress={retry} style={{ backgroundColor: '#1A73E8', borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
        <Text style={{ color: 'white', fontWeight: '800' }}>Reessayer</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  )
}
