import axios from 'axios';
import { API_BASE_URL } from '@env';
import * as SecureStore from 'expo-secure-store';

// 1. Callback para manejar la expiración de sesión (será "inyectado" desde AuthContext)
let onSessionExpired = null;

export const setSessionExpiredCallback = (callback) => {
    onSessionExpired = callback;
};

// 2. Instancia de Axios
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
        "Content-Type": 'application/json',
    },
});

// 3. Interceptor de Solicitud (Request)
// Se ejecuta ANTES de CADA solicitud que use esta instancia "api"
api.interceptors.request.use(
    async (config) => {
        // Obtenemos el token desde SecureStore en lugar de localStorage
        const token = await SecureStore.getItemAsync("userToken");
        if (token) {
            // Si existe, lo añadimos a las cabeceras
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        // Manejar un error en la configuración de la solicitud
        return Promise.reject(error);
    }
);

// 4. Interceptor de Respuesta (Response)
// Se ejecuta DESPUÉS de CADA respuesta
api.interceptors.response.use(
    (response) => response, // Si la respuesta es 2xx, simplemente la devuelve
    (error) => {
        // Manejamos errores
        const status = error.response?.status;

        if (status === 401) {
            // ¡Sesión expirada o token inválido!
            // Ejecutamos el callback (nuestro "evento" sessionExpired) si ha sido configurado
            if (onSessionExpired) {
                onSessionExpired();
            }
        }

        // Rechazamos la promesa para que el .catch() en la llamada original (ej. en LoginScreen)
        // también se ejecute.
        return Promise.reject(error);
    }
);

export { api };
