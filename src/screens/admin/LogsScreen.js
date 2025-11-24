import { Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const LogsScreen = () => {
    return (
        <SafeAreaView className="flex-1 bg-background px-[10%] py-[16%]">
            <Text className="font-bold text-[32px] text-foreground">Logs</Text>
        </SafeAreaView>
    )
}

export default LogsScreen
