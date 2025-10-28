import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/shared/HomeScreen";
import { useTheme } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import ProfileScreen from "../screens/ProfileScreen";
import { Text, View } from "react-native";

const Tab = createBottomTabNavigator();

const UserTabNavigator = () => {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.muted,

                tabBarStyle: {
                    borderTopRightRadius: 4,
                    borderTopLeftRadius: 4,
                    backgroundColor: colors.accentSoft,
                    borderTopWidth: 0,
                    height: 60,
                },

                tabBarShowLabel: false,

                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    const label = route.name; // El nombre de la ruta es la etiqueta

                    if (route.name === "Inicio") {
                        iconName = focused ? "home" : "home";
                    } else if (route.name === "Perfil") {
                        iconName = focused ? "person" : "person";
                    }

                    return (
                        <View className="flex justify-center items-center size-14"
                            style={{
                                backgroundColor: focused
                                    ? colors.surface3
                                    : "transparent",
                                borderRadius: 8,
                                margin: 4,
                            }}
                        >
                            <Ionicons
                                name={iconName}
                                size={size}
                                color={color}
                            />

                            <Text
                                style={{ color: color }}
                                className="font-semibold text-[14px]"
                            >
                                {label}
                            </Text>
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="Inicio" component={HomeScreen} />
            <Tab.Screen name="Perfil" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default UserTabNavigator;
