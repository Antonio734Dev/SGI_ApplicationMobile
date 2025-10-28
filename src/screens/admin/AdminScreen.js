import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ThemeSwitcher from "../../components/ThemeSwitcher";

const AdminScreen = () => {
    return (
        <SafeAreaView className="flex-1 bg-background">
            <Text>Admin Screen</Text>
            <ThemeSwitcher/>
        </SafeAreaView>
    );
};

export default AdminScreen;
