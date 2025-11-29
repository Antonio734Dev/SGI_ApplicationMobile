import React from 'react'
import { View } from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { useTheme } from 'heroui-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import HomeScreen from '../screens/shared/HomeScreen'
import LogsScreen from '../screens/admin/LogsScreen'
import ProfileScreen from '../screens/shared/ProfileScreen'
import UsersScreen from '../screens/admin/UsersScreen'

const Tab = createMaterialTopTabNavigator()

const AdminTabNavigator = () => {
    const { colors } = useTheme()
    const insets = useSafeAreaInsets()

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Tab.Navigator
                tabBarPosition="bottom"
                screenOptions={({ route }) => ({
                    tabBarActiveTintColor: colors.accent,
                    tabBarInactiveTintColor: colors.mutedForeground,

                    // Estilo del Label (Texto)
                    tabBarLabelStyle: {
                        fontSize: 14,
                        fontWeight: '600',
                        textTransform: 'capitalize',
                        margin: 0,
                        // Añadimos un pequeño margen superior para separarlo del icono
                        marginTop: 4,
                    },

                    // Estilo de la Barra
                    tabBarStyle: {
                        backgroundColor: colors.background,
                        elevation: 0,
                        shadowOpacity: 0,
                        borderTopWidth: 0,
                        borderTopColor: 'transparent',
                        borderBottomWidth: 0,
                        // Ajustamos la altura total para acomodar icono + texto + insets
                        paddingBottom: insets.bottom,
                        // Altura automática o fija según prefieras, 'auto' suele ir bien con padding
                        height: 'auto',
                    },

                    // Indicador superior
                    tabBarIndicatorStyle: {
                        backgroundColor: 'transparent',
                        height: 0,
                    },

                    // Estilo del Item (Contenedor de Icono + Texto)
                    tabBarItemStyle: {
                        // CAMBIO CLAVE: 'column' pone el texto debajo del icono
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 8,
                    },

                    tabBarShowIcon: true,

                    tabBarIcon: ({ focused, color }) => {
                        let iconName

                        switch (route.name) {
                            case 'Inicio':
                                iconName = focused ? 'home' : 'home-outline'
                                break
                            case 'Usuarios':
                                iconName = focused ? 'people' : 'people-outline'
                                break
                            case 'Logs':
                                iconName = focused ? 'footsteps' : 'footsteps-outline'
                                break
                            case 'Perfil':
                                iconName = focused ? 'person' : 'person-outline'
                                break
                            default:
                                iconName = focused ? 'ellipse' : 'ellipse-outline'
                        }

                        // CAMBIO: Tamaño fijo de 24px
                        return <Ionicons name={iconName} size={24} color={color} />
                    },
                })}
            >
                <Tab.Screen name="Inicio" component={HomeScreen} />
                <Tab.Screen name="Usuarios" component={UsersScreen} />
                <Tab.Screen name="Logs" component={LogsScreen} />
                <Tab.Screen name="Perfil" component={ProfileScreen} />
            </Tab.Navigator>
        </View>
    )
}

export default AdminTabNavigator
