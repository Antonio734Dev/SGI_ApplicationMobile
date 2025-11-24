import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useTheme } from 'heroui-native'
import { Ionicons } from '@expo/vector-icons'
import { Text, View } from 'react-native'
import HomeScreen from '../screens/shared/HomeScreen'
import ProfileScreen from '../screens/shared/ProfileScreen'

const Tab = createBottomTabNavigator()

const UserTabNavigator = () => {
    const { colors } = useTheme()

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                // Convertimos screenOptions en una función
                headerShown: false,
                tabBarActiveTintColor: colors.accent, // Ej: Tu color de acento
                tabBarInactiveTintColor: colors.muted, // Ej: Un color gris

                // 5. Estilo de la barra (opcional, pero recomendado para el tema)
                tabBarStyle: {
                    backgroundColor: colors.background, // Fondo de la barra
                    borderTopWidth: 0, // Quita la línea superior
                    height: 60,
                },

                tabBarItemStyle: {
                    justifyContent: 'center', // Centra el ícono y la etiqueta verticalmente
                },

                tabBarShowLabel: false,

                // 6. Función que renderiza el ícono
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName

                    if (route.name === 'Inicio') {
                        iconName = focused ? 'home' : 'home'
                    } else if (route.name === 'Perfil') {
                        iconName = focused ? 'person' : 'person'
                    }

                    // Devuelve el componente de ícono
                    return (
                        <View className="flex flex-col items-center justify-center pt-4">
                            <Ionicons name={iconName} size={20} color={color} />
                            <Text className="font-bold text-xs" style={{ color: focused ? colors.accent : colors.muted }}>
                                {route.name}
                            </Text>
                        </View>
                    )
                },
            })}
        >
            <Tab.Screen name="Inicio" component={HomeScreen} />
            <Tab.Screen name="Perfil" component={ProfileScreen} />
        </Tab.Navigator>
    )
}

export default UserTabNavigator
