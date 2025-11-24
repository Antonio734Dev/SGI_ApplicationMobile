import { Text } from 'react-native'
import { useAuth } from '../../contexts/AuthContext'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from 'heroui-native'
import ThemeSwitcher from '../../components/ThemeSwitcher'

const ProfileScreen = () => {
    const { logout, userRole } = useAuth()

    return (
        <SafeAreaView className="flex-1 bg-background p-[10%] justify-between">
            <Text className="font-bold text-[32px] text-foreground">Mi perfil ({userRole})</Text>
            <ThemeSwitcher />
            <Button onPress={logout} className="rounded-sm" variant="danger">
                Cerrar Sesión
            </Button>
        </SafeAreaView>
    )
}

export default ProfileScreen
