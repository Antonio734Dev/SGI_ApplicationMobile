import React, { useRef } from 'react'
import { Text, View, TouchableOpacity, Dimensions, Animated, StyleSheet } from 'react-native'
import { Modalize } from 'react-native-modalize'
import { BlurView } from 'expo-blur'

const { height } = Dimensions.get('window')

// 1. Creamos el componente animado fuera del render
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

const HomeScreen = () => {
    const modalizeRef = useRef(null)

    // 2. Valor animado para la opacidad (0 = invisible, 1 = visible)
    const blurOpacity = useRef(new Animated.Value(0)).current

    const data = Array.from({ length: 50 }, (_, i) => ({
        id: i.toString(),
        name: `Usuario ${i + 1}`,
        email: `usuario${i + 1}@ejemplo.com`,
    }))

    const onOpen = () => {
        // 3. Animar entrada del blur
        Animated.timing(blurOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start()

        modalizeRef.current?.open()
    }

    const onClosed = () => {
        // 4. Animar salida del blur
        Animated.timing(blurOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start()
    }

    const renderItem = ({ item }) => (
        <View className="border-b border-gray-100 p-4">
            <Text className="mb-1 text-base font-medium text-black">{item.name}</Text>
            <Text className="text-sm font-light text-gray-500">{item.email}</Text>
        </View>
    )

    return (
        <View className="flex-1 justify-center items-center bg-white">
            <TouchableOpacity onPress={onOpen} className="bg-blue-600 px-6 py-3 rounded-lg shadow-md">
                <Text className="text-white font-bold text-lg">Abrir Lista</Text>
            </TouchableOpacity>

            {/* 5. El componente de Blur posicionado absolutamente */}
            <AnimatedBlurView
                intensity={20} // Nivel de desenfoque
                tint="dark" // 'light', 'dark', 'default'
                style={[
                    StyleSheet.absoluteFill,
                    {
                        zIndex: 10, // Debe estar encima del contenido pero debajo del modal
                        opacity: blurOpacity,
                    },
                ]}
                pointerEvents="none" // Para que no bloquee toques cuando es invisible
            />

            <Modalize
                ref={modalizeRef}
                snapPoint={400}
                modalHeight={height * 0.8}
                // 6. Configuración clave para el overlay custom
                withOverlay={false} // Desactiva el fondo gris por defecto
                onClosed={onClosed} // Llama a la animación de salida al cerrar
                zIndex={20} // Asegura que el modal esté encima del blur
                flatListProps={{
                    data: data,
                    renderItem: renderItem,
                    keyExtractor: (item) => item.id,
                    showsVerticalScrollIndicator: false,
                }}
            />
        </View>
    )
}

export default HomeScreen
