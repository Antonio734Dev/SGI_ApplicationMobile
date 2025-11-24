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

export default function App() {
    const { colors } = useTheme()

    let [fontsLoaded] = useFonts({
        PlusJakartaSans_400Regular,
        PlusJakartaSans_500Medium,
        PlusJakartaSans_600SemiBold,
        PlusJakartaSans_700Bold,
    })

    if (!fontsLoaded) {
        return <Spinner color={colors.foreground} size="md" />
    }

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <HeroUINativeProvider
                    config={{
                        colorScheme: 'system',
                        theme: {
                            // ---------
                            // LIGHT MODE - Escala de grises refinada
                            // ---------
                            light: {
                                colors: {
                                    // Base
                                    background: '#f5f5f5', // Gris muy claro, suave
                                    foreground: '#0a0a0a', // Negro intenso pero no puro
                                    panel: '#eeeeee', // Panel ligeramente más oscuro que background

                                    // Muted (elementos secundarios)
                                    muted: '#9e9e9e', // Gris medio para íconos deshabilitados
                                    mutedForeground: '#757575', // Gris oscuro para texto secundario

                                    // Surface (sistema de capas)
                                    surface: '#f5f5f5',
                                    surfaceForeground: '#0a0a0a',
                                    default: '#f5f5f5',
                                    defaultForeground: '#0a0a0a',

                                    // Superficies elevadas (de más clara a más oscura)
                                    surface1: '#eeeeee', // Primer nivel de elevación
                                    surface2: '#e0e0e0', // Segundo nivel
                                    surface3: '#d4d4d4', // Tercer nivel

                                    // Bordes y divisores
                                    border: '#d4d4d4', // Bordes sutiles
                                    divider: '#e0e0e0', // Divisores muy sutiles

                                    // Brand colors - Accent en escala de grises
                                    accent: '#2a2a2a', // Gris oscuro para accent
                                    accentForeground: '#ffffff',
                                    accentSoft: '#e8e8e8', // Background suave para accent
                                    accentSoftForeground: '#2a2a2a',

                                    // Estados (versión monocromática)
                                    //success: '#4a4a4a',
                                    //successForeground: '#ffffff',
                                    //warning: '#6a6a6a',
                                    //warningForeground: '#ffffff',
                                    //danger: '#1a1a1a',
                                    //dangerForeground: '#ffffff',
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
                            // DARK MODE - Escala de grises refinada
                            // ---------
                            dark: {
                                colors: {
                                    // Base
                                    background: '#0f0f0f', // Negro profundo pero no puro
                                    foreground: '#f5f5f5', // Blanco suave, no puro
                                    panel: '#1a1a1a', // Panel ligeramente más claro

                                    // Muted (elementos secundarios)
                                    muted: '#6a6a6a', // Gris medio para íconos deshabilitados
                                    mutedForeground: '#8a8a8a', // Gris claro para texto secundario

                                    // Surface (sistema de capas)
                                    surface: '#0f0f0f',
                                    surfaceForeground: '#f5f5f5',
                                    default: '#0f0f0f',
                                    defaultForeground: '#f5f5f5',

                                    // Superficies elevadas (de más oscura a más clara)
                                    surface1: '#1a1a1a', // Primer nivel de elevación
                                    surface2: '#252525', // Segundo nivel
                                    surface3: '#303030', // Tercer nivel

                                    // Bordes y divisores
                                    border: '#303030', // Bordes sutiles
                                    divider: '#252525', // Divisores muy sutiles

                                    // Brand colors - Accent en escala de grises
                                    accent: '#e8e8e8', // Gris claro para accent
                                    accentForeground: '#0f0f0f',
                                    accentSoft: '#1f1f1f', // Background suave para accent
                                    accentSoftForeground: '#e8e8e8',

                                    // Estados (versión monocromática)
                                    //success: '#c5c5c5',
                                    //successForeground: '#0f0f0f',
                                    //warning: '#a5a5a5',
                                    //warningForeground: '#0f0f0f',
                                    //danger: '#e5e5e5',
                                    //dangerForeground: '#0f0f0f',
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
