import axios from 'axios'
import { API_BASE_URL } from '@env'
import * as SecureStore from 'expo-secure-store'

// Callback para manejar la expiración de sesión (será "inyectado" desde AuthContext)
let onSessionExpired = null

export const setSessionExpiredCallback = (callback) => {
    onSessionExpired = callback
}

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptor de Solicitud (Request)
// Se ejecuta ANTES de CADA solicitud que use esta instancia "api"
api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('userToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

// Interceptor de Respuesta (Response)
// Se ejecuta DESPUÉS de CADA respuesta
api.interceptors.response.use(
    (response) => response, // Si la respuesta es 2xx, simplemente la devuelve
    (error) => {
        // Manejamos errores
        const status = error.response?.status

        if (status === 401) {
            // ¡Sesión expirada o token inválido!
            // Ejecutamos el callback (nuestro "evento" sessionExpired) si ha sido configurado
            if (onSessionExpired) {
                onSessionExpired()
            }
        }

        // Rechazamos la promesa para que el .catch() en la llamada original (ej. en LoginScreen) también se ejecute.
        return Promise.reject(error)
    },
)

export { api }
