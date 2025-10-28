import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Spinner } from "heroui-native";
import { useAuth } from "../context/AuthContext";
import AppNavigator from "./AppNavigator";
import LoginScreen from "../screens/LoginScreen";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    const { userToken, isLoading } = useAuth();

    if (isLoading) {
        return <Spinner />
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {userToken == null ? (
                    // No hay token, mostrar pantalla de Login
                    <Stack.Screen name="Auth" component={LoginScreen} />
                ) : (
                    // Usuario logueado, mostrar el navegador de la App (que internamente decide por rol)
                    <Stack.Screen name="App" component={AppNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;
