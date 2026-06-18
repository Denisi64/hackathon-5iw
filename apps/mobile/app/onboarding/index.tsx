import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="flex-1 px-6 justify-between pb-10">

        <View className="pt-6">
          <Text className="text-2xl font-black text-fg">
            comu<Text className="text-primary">titres</Text>
          </Text>
          <Text className="text-sm text-muted mt-1">Chaque trajet raconte une histoire.</Text>
        </View>

        <View>
          <Text className="text-4xl font-black text-fg leading-tight mb-4">
            Votre titre{'\n'}de transport,{'\n'}enfin simple.
          </Text>
          <Text className="text-base text-muted leading-relaxed">
            Trouvez le bon pass Navigo en 2 minutes et souscrivez en 5 étapes guidées.
          </Text>
        </View>

        <View className="gap-3">
          <TouchableOpacity
            className="bg-primary py-4 rounded-2xl items-center"
            onPress={() => router.push('/onboarding/create-account')}
          >
            <Text className="text-white text-base font-bold">Commencer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-4 rounded-2xl items-center border border-border"
            onPress={() => router.push('/login')}
          >
            <Text className="text-fg text-base font-semibold">J'ai déjà un compte</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}
