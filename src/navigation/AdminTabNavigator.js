import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/shared/HomeScreen";
import { useTheme } from 'heroui-native';
import { Ionicons } from '@expo/vector-icons';
import AdminScreen from "../screens/admin/AdminScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { Text, View } from "react-native";

const Tab = createBottomTabNavigator();

const AdminTabNavigator = () => {
    const { colors } = useTheme();
    
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({ // Convertimos screenOptions en una función
                headerShown: false,
                tabBarActiveTintColor: colors.accent, // Ej: Tu color de acento
                tabBarInactiveTintColor: colors.muted, // Ej: Un color gris

                // 5. Estilo de la barra (opcional, pero recomendado para el tema)
                tabBarStyle: {
                    backgroundColor: colors.background, // Fondo de la barra
                    borderTopWidth: 0, // Quita la línea superior
                    height: 60
                },

                tabBarItemStyle: {
                    justifyContent: 'center', // Centra el ícono y la etiqueta verticalmente
                },

                tabBarShowLabel: false,

                // 6. Función que renderiza el ícono
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Inicio') {
                        iconName = focused ? 'home' : 'home';
                    } else if (route.name === 'Ajustes') {
                        iconName = focused ? 'settings' : 'settings';
                    } else if (route.name === 'Perfil') {
                        iconName = focused ? 'person' : 'person';
                    }

                    // Devuelve el componente de ícono
                    return( 
                        <View className="flex flex-col rounded-sm items-center justify-center size-14" style={{ backgroundColor: focused ? colors.panel : 'transparent' }}>
                            <Text>
                                <Ionicons name={iconName} size={20} color={color} />
                            </Text>
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="Inicio" component={HomeScreen} />
            <Tab.Screen name="Perfil" component={ProfileScreen} />
            <Tab.Screen name="Ajustes" component={AdminScreen} />
        </Tab.Navigator>
    );
};

export default AdminTabNavigator;
