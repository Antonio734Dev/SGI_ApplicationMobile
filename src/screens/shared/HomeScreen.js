import { Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'

const HomeScreen = () => {
    return (
        <SafeAreaView className="flex-1 bg-background px-[10%] py-[16%]">
            <KeyboardAwareScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                }}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
            >
                <View className="px-[10%] pt-[10%]">
                    <Text className="font-bold text-[32px] text-foreground">Inicio</Text>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default HomeScreen
