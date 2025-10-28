import { Button, Text } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
    const { logout, userRole } = useAuth();

    return (
        <SafeAreaView className="flex-1 bg-background">
            <Text>Home Screen. Tu rol actual es: {userRole}</Text>
            <Button title="Cerrar Sesión (Test)" onPress={logout} />
        </SafeAreaView>
    );
};

export default HomeScreen;
