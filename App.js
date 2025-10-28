import "./global.css";
import RootNavigator from "./src/navigation/RootNavigator";
import { HeroUINativeProvider, Spinner } from "heroui-native";
import { AuthProvider } from "./src/context/AuthContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
    useFonts,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";

const config = {
    colorScheme: "system",
    theme: {
        light: {
            colors: {
                background: "#efefef",
                foreground: "#000000",
                panel: "#e4e4e4",
                muted: "#afafaf",
                mutedForeground: "#a5a5a5",

                surface: "#efefef",
                surfaceForeground: "#000000",
                default: "#efefef",
                defaultForeground: "#000000",

                //Brand colors
                //accent: '#460bea',
                //accentForeground: '#ffffff',
                //accentSoft: '#efefef',
                //accentSoftForeground: '#460bea',

                //success: '#00C853',
                //successForeground: '#ffffff',
                //warning: '#FFB300',
                //warningForeground: '#000000',
                //danger: '#FF3B30',
                //dangerForeground: '#ffffff',

                surface1: "#efefef",
                surface2: "#e4e4e4",
                surface3: "#dadada",

                border: "#dadada",
                divider: "#e4e4e4",
                //link: '#460bea',
            },
            borderRadius: {
                DEFAULT: "12px",
                panel: "8px",
                "panel-inner": "4px",
            },
            opacity: {
                disabled: 0.4,
            },
        },
        dark: {
            colors: {
                background: "#1b1b1b",
                foreground: "#ffffff",
                panel: "#252525",
                muted: "#5a5a5a",
                mutedForeground: "#656565",

                surface: "#1b1b1b",
                surfaceForeground: "#ffffff",
                default: "#1b1b1b",
                defaultForeground: "#ffffff",

                //Brand colors
                //accent: '#460bea',
                //accentForeground: '#ffffff',
                //accentSoft: '#252525',
                //accentSoftForeground: '#460bea',

                //success: '#00E676',
                //successForeground: '#000000',
                //warning: '#FFCA28',
                //warningForeground: '#000000',
                //danger: '#FF5252',
                //dangerForeground: '#000000',

                surface1: "#252525",
                surface2: "#303030",
                surface3: "#3a3a3a",

                border: "#3a3a3a",
                divider: "#303030",
                //link: '#460bea',
            },
        },
    },
    textProps: {
        minimumFontScale: 0.5,
        maxFontSizeMultiplier: 1.5,
    },
};

export default function App() {
    let [fontsLoaded] = useFonts({
        PlusJakartaSans_400Regular,
        PlusJakartaSans_500Medium,
        PlusJakartaSans_600SemiBold,
        PlusJakartaSans_700Bold,
    });

    if (!fontsLoaded) {
        return <Spinner />;
    }

    return (
        <HeroUINativeProvider config={config}>
            <AuthProvider>
                <SafeAreaProvider>
                    <RootNavigator />
                </SafeAreaProvider>
            </AuthProvider>
        </HeroUINativeProvider>
    );
}
