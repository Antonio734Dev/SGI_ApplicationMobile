import { useNavigation } from '@react-navigation/native'
import { useTheme } from 'heroui-native'
import { Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

const LogsScreen = () => {
    const navigation = useNavigation()
    const { colors } = useTheme()

    return (
        <SafeAreaView className="flex-1 bg-background px-[10%] py-[16%]">
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="h-10 w-10 items-center justify-center rounded-full bg-surface-2 mr-4"
                activeOpacity={0.7}
            >
                <Ionicons name="arrow-back" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="font-bold text-[32px] text-foreground">Logs</Text>
        </SafeAreaView>
    )
}

export default LogsScreen
