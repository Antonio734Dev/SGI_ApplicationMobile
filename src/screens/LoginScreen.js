import { useState } from 'react';
import { View, Text, Platform } from 'react-native';
import { useAuth } from "../context/AuthContext";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Spinner, TextField, useTheme } from 'heroui-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons } from '@expo/vector-icons';
import ThemeSwitcher from '../components/ThemeSwitcher';

const LoginScreen = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth(); // Usamos el hook
    const { colors } = useTheme();

    const handleLogin = async () => {
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (e) {
            console.error(e);
            setError(e.message || 'Ocurrió un error inesperado');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAwareScrollView
                contentContainerStyle={{
                    flexGrow: 1, // Esencial para que el contenido pueda llenar la pantalla
                    justifyContent: 'center' // Centra tu formulario
                }}
                keyboardShouldPersistTaps="handled" // Mantenemos esta
                enableOnAndroid={true} 
            >
                        <View className="px-[10%]">
                            <Text className="font-bold text-[32px] pb-4 text-foreground">¡Bienvenido!</Text>
                            <Text className="font-normal text-base pb-12 text-foreground">Por favor, proporcione sus credenciales para ingresar a la aplicación.</Text>
                            <TextField isRequired className='pb-8'>
                                <TextField.Label classNames={{ asterisk: "text-accent" }}>Correo electrónico</TextField.Label>
                                <TextField.Input 
                                    colors={{
                                        blurBackground: colors.accentSoft,
                                        focusBackground: colors.surface2,
                                        blurBorder: colors.accentSoft,
                                        focusBorder: colors.surface2,
                                    }}
                                    className='rounded-sm'
                                    placeholder="Ingrese su correo electrónico" 
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    cursorColor={colors.accent}
                                    selectionHandleColor={colors.accent}
                                    selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                />
                            </TextField>
                            <TextField isRequired className='pb-12'>
                                <TextField.Label classNames={{ asterisk: "text-accent" }}>Contraseña</TextField.Label>
                                <TextField.Input 
                                    colors={{
                                        blurBackground: colors.accentSoft,
                                        focusBackground: colors.surface2,
                                        blurBorder: colors.accentSoft,
                                        focusBorder: colors.surface2,
                                    }}
                                    className='rounded-sm'
                                    placeholder="Ingrese su contraseña"     
                                    value={password}
                                    onChangeText={setPassword}
                                    cursorColor={colors.accent}
                                    selectionHandleColor={colors.accent}
                                    selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                    secureTextEntry
                                >
                                </TextField.Input>
                            </TextField>

                            <View className="flex gap-4">
                                <Button onPress={handleLogin} className="rounded-sm" isDisabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Spinner color={colors.accentForeground} size="sm"/>
                                            <Button.Label>Ingresando...</Button.Label>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="log-in" size={20} color={colors.accentForeground} />
                                            <Button.Label>Ingresar</Button.Label>
                                        </>
                                    )}

                                </Button>
                                <ThemeSwitcher/>
                            </View>
                        </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};

export default LoginScreen;
