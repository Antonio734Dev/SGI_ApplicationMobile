import './global.css'
import RootNavigator from './src/navigations/RootNavigator'
import { HeroUINativeProvider, Spinner, useTheme } from 'heroui-native'
import { AuthProvider } from './src/contexts/AuthContext'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import {
    useFonts,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { View } from 'react-native'

export default function App() {
    const { colors } = useTheme()

    let [fontsLoaded] = useFonts({
        PlusJakartaSans_400Regular,
        PlusJakartaSans_500Medium,
        PlusJakartaSans_600SemiBold,
        PlusJakartaSans_700Bold,
    })

    if (!fontsLoaded) {
        return (
            <View className="flex-1 justify-center items-center">
                <Spinner color={colors.foreground} size="md" />
            </View>
        )
    }

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <HeroUINativeProvider
                    config={{
                        colorScheme: 'system',
                        theme: {
                            // ---------
                            // LIGHT MODE - Pure White Base
                            // ---------
                            light: {
                                colors: {
                                    // Base (Blanco Puro)
                                    background: '#FFFFFF',
                                    foreground: '#000000', // Negro Puro
                                    panel: '#FFFFFF',

                                    // Muted
                                    muted: '#A3A3A3',
                                    mutedForeground: '#525252',

                                    // Surface
                                    surface: '#FFFFFF',
                                    surfaceForeground: '#000000',
                                    default: '#FFFFFF',
                                    defaultForeground: '#000000',

                                    // Superficies elevadas (Recorrido de valores)
                                    // El antiguo background (#f5f5f5) pasa a ser surface1
                                    surface1: '#F5F5F5',
                                    surface2: '#EEEEEE',
                                    surface3: '#E0E0E0',

                                    // Bordes y divisores
                                    border: '#E5E5E5',
                                    divider: '#F5F5F5',

                                    // Brand colors - Accent Monocromático de alto contraste
                                    accent: '#171717',
                                    accentForeground: '#FFFFFF',
                                    accentSoft: '#F5F5F5',
                                    accentSoftForeground: '#171717',
                                },
                                borderRadius: {
                                    DEFAULT: '12px',
                                    panel: '8px',
                                    'panel-inner': '4px',
                                },
                                opacity: {
                                    disabled: 0.4,
                                },
                            },

                            // ---------
                            // DARK MODE - Pure Black Base
                            // ---------
                            dark: {
                                colors: {
                                    // Base (Negro Puro)
                                    background: '#000000',
                                    foreground: '#FFFFFF', // Blanco Puro
                                    panel: '#000000',

                                    // Muted
                                    muted: '#525252',
                                    mutedForeground: '#A3A3A3',

                                    // Surface
                                    surface: '#000000',
                                    surfaceForeground: '#FFFFFF',
                                    default: '#000000',
                                    defaultForeground: '#FFFFFF',

                                    // Superficies elevadas (Recorrido de valores)
                                    // El antiguo background (#0f0f0f) pasa a ser surface1
                                    surface1: '#0F0F0F',
                                    surface2: '#1A1A1A',
                                    surface3: '#262626',

                                    // Bordes y divisores
                                    border: '#262626',
                                    divider: '#1A1A1A',

                                    // Brand colors - Accent Monocromático
                                    accent: '#FFFFFF',
                                    accentForeground: '#000000',
                                    accentSoft: '#1A1A1A',
                                    accentSoftForeground: '#FFFFFF',
                                },
                                borderRadius: {
                                    DEFAULT: '12px',
                                    panel: '8px',
                                    'panel-inner': '4px',
                                },
                                opacity: {
                                    disabled: 0.4,
                                },
                            },
                        },
                        textProps: {
                            minimumFontScale: 0.5,
                            maxFontSizeMultiplier: 1.5,
                        },
                    }}
                >
                    <AuthProvider>
                        <RootNavigator />
                    </AuthProvider>
                </HeroUINativeProvider>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    )
}
