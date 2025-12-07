import React from 'react'
import { View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from 'heroui-native'

import LogsScreen from '../screens/admin/LogsScreen'
import UsersScreen from '../screens/admin/UsersScreen'
import MenuScreen from '../screens/admin/MenuScreen' // Asumiendo que separaste el menú en su archivo
import StockCataloguesScreen from '../screens/admin/StockCataloguesScreen'
import ProductStatusesScreen from '../screens/admin/ProductStatusesScreen'

const Stack = createStackNavigator()

const MenuNavigator = () => {
    const { colors } = useTheme()

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false, // <--- ESTO OCULTA TODO LO DEL NAVIGATOR
                    animationEnabled: true,
                    // Estilo base para todas las pantallas del stack
                    cardStyle: { backgroundColor: colors.background },
                }}
            >
                <Stack.Screen name="MenuIndex" component={MenuScreen} />
                <Stack.Screen name="Usuarios" component={UsersScreen} />
                <Stack.Screen name="Logs" component={LogsScreen} />
                <Stack.Screen name="Estados" component={ProductStatusesScreen} />
                <Stack.Screen name="Catalogos" component={StockCataloguesScreen} />
            </Stack.Navigator>
        </View>
    )
}

export default MenuNavigator
