import { useCallback, useState } from 'react'
import { View, Text, Platform, RefreshControl } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Spinner, TextField, useTheme } from 'heroui-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Ionicons } from '@expo/vector-icons'
import ThemeSwitcher from '../components/ThemeSwitcher'
import { required, validEmail, validPassword } from '../utils/validators'

const LoginScreen = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [isVisible, setIsVisible] = useState(false) // Para mostrar/ocultar contraseña
    const { login } = useAuth() // Usamos el hook
    const { colors } = useTheme()

    const [isRefreshing, setIsRefreshing] = useState(false)

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const [fieldErrors, setFieldErrors] = useState({
        email: [],
        password: [],
    })

    const [submitError, setSubmitError] = useState('')

    const validators = {
        email: [required, validEmail],
        password: [required, validPassword],
    }

    const runValidators = (value, fns) => fns.map((fn) => fn(value)).filter(Boolean)

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))

        const fns = validators[field] || []
        const errs = runValidators(value, fns)
        setFieldErrors((prev) => ({ ...prev, [field]: errs }))

        // Limpiamos el error de envío si el usuario empieza a corregir
        if (submitError) {
            setSubmitError('')
        }
    }

    const hasFormErrors = () => {
        // Comprobar errores de validación en tiempo real
        if (fieldErrors.email.length > 0 || fieldErrors.password.length > 0) {
            return true
        }
        // Comprobar campos vacíos (para deshabilitar el botón inicialmente)
        if (formData.email.trim() === '' || formData.password.trim() === '') {
            return true
        }
        return false
    }

    // Alterna la visibilidad de la contraseña
    const toggleVisibility = () => setIsVisible(!isVisible)

    const onRefresh = useCallback(() => {
        setIsRefreshing(true) // Muestra el spinner

        // Reseteamos todo el estado del formulario
        setFormData({ email: '', password: '' })
        setFieldErrors({ email: [], password: [] })
        setSubmitError('')
        setIsLoading(false)
        setIsVisible(false)

        // Ocultamos el spinner de recarga después de 1 seg
        setTimeout(() => {
            setIsRefreshing(false)
        }, 1000)
    }, []) // Dependencias vacías
    const handleLogin = async () => {
        // --- Validación antes de enviar ---
        const emailErrs = runValidators(formData.email, validators.email)
        const passwordErrs = runValidators(formData.password, validators.password)

        if (emailErrs.length > 0 || passwordErrs.length > 0) {
            setFieldErrors({ email: emailErrs, password: passwordErrs })
            setSubmitError('Por favor, corrija los errores en el formulario.')
            return
        }

        // Limpiar estados antes de enviar
        setFieldErrors({ email: [], password: [] })
        setSubmitError('')

        try {
            setIsLoading(true)
            await login(formData.email, formData.password)
        } catch (e) {
            console.error(e)
            console.log(e)
            // IMPORTANTE: Verificar primero si hay response.data (respuesta del backend)
            if (e.response?.data) {
                const { result, title, description } = e.response.data

                // 1. Establecer el mensaje general (SOLO title, no description)
                setSubmitError(title || 'Error al iniciar sesión.')

                // 2. Procesar errores específicos de campo si existen
                if (result && Array.isArray(result) && result.length > 0) {
                    const newFieldErrors = { email: [], password: [] }

                    result.forEach((validationError) => {
                        const field = validationError.field
                        const descriptions = validationError.descriptions || []

                        if (newFieldErrors.hasOwnProperty(field)) {
                            newFieldErrors[field] = descriptions
                        }
                    })

                    setFieldErrors(newFieldErrors)
                }
            } else {
                // Solo si NO hay response.data, usar e.message o mensaje genérico
                setSubmitError('No se pudo conectar con el servidor.')
            }
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <SafeAreaView className="flex-1 bg-background">
            <KeyboardAwareScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    alignItems: 'center',
                }}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={[colors.accent]} // Android
                        tintColor={colors.accent} // iOS
                    />
                }
            >
                <View className="px-[12%] py-[12%] flex flex-col justify-between h-full gap-12">
                    <View>
                        <Text className="font-bold text-[32px] pb-4 text-foreground">¡Bienvenido!</Text>
                        <Text className="font-normal text-base pb-10 text-foreground">
                            Por favor, proporcione sus credenciales para ingresar a la aplicación.
                        </Text>

                        {submitError ? (
                            <View className="mb-10 flex flex-row items-center rounded-sm gap-3">
                                <Ionicons name="close-circle" size={24} color={colors.danger} />
                                <Text className="font-medium" style={{ color: colors.danger }}>
                                    {submitError}
                                </Text>
                            </View>
                        ) : null}

                        <TextField isRequired className="pb-8" isInvalid={fieldErrors.email.length > 0}>
                            <TextField.Label classNames={{ asterisk: 'text-danger' }}>Correo electrónico</TextField.Label>
                            <TextField.Input
                                colors={{
                                    blurBackground: colors.accentSoft,
                                    focusBackground: colors.surface2,
                                    blurBorder: colors.accentSoft,
                                    focusBorder: colors.surface2,
                                }}
                                className="rounded-sm"
                                placeholder="Ingrese su correo electrónico"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={formData.email}
                                onChangeText={(value) => handleInputChange('email', value)}
                                cursorColor={colors.accent}
                                selectionHandleColor={colors.accent}
                                selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                            />
                            {fieldErrors.email.length > 0 ? <TextField.ErrorMessage>{fieldErrors.email.join('\n')}</TextField.ErrorMessage> : undefined}
                        </TextField>
                        <TextField isRequired className="pb-10" isInvalid={fieldErrors.password.length > 0}>
                            <TextField.Label classNames={{ asterisk: 'text-danger' }}>Contraseña</TextField.Label>
                            <TextField.Input
                                colors={{
                                    blurBackground: colors.accentSoft,
                                    focusBackground: colors.surface2,
                                    blurBorder: colors.accentSoft,
                                    focusBorder: colors.surface2,
                                }}
                                className="rounded-sm"
                                placeholder="Ingrese su contraseña"
                                value={formData.password}
                                onChangeText={(value) => handleInputChange('password', value)}
                                cursorColor={colors.accent}
                                selectionHandleColor={colors.accent}
                                selectionColor={Platform.OS === 'ios' ? colors.accent : colors.muted}
                                secureTextEntry={!isVisible} // Controlado por el estado
                            >
                                <TextField.InputEndContent
                                    name="right"
                                    classNames={{
                                        container: 'flex justify-center items-center pr-2',
                                    }}
                                >
                                    <Button onPress={toggleVisibility} className="rounded-sm bg-transparent" isIconOnly>
                                        <Ionicons
                                            name={isVisible ? 'eye-off' : 'eye'}
                                            size={24}
                                            color={fieldErrors.password.length > 0 ? colors.danger : colors.accent}
                                        />
                                    </Button>
                                </TextField.InputEndContent>
                            </TextField.Input>
                            {/* Mensajes de error para contraseña */}
                            {fieldErrors.password.length > 0 ? <TextField.ErrorMessage>{fieldErrors.password.join('\n')}</TextField.ErrorMessage> : undefined}
                        </TextField>

                        <View className="flex gap-4">
                            <Button onPress={handleLogin} isDisabled={hasFormErrors() || isLoading}>
                                {isLoading ? (
                                    <>
                                        <Spinner color={colors.accentForeground} size="md" />
                                        <Button.Label>Ingresando...</Button.Label>
                                    </>
                                ) : (
                                    <>
                                        <Ionicons name="log-in" size={24} color={colors.accentForeground} />
                                        <Button.Label>Ingresar</Button.Label>
                                    </>
                                )}
                            </Button>
                        </View>
                    </View>
                    <View>
                        <Text className="text-[14px] text-center font-semibold">Footer</Text>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default LoginScreen
