import { api } from './config/api'

export const loginRequest = async (credentials) => {
    try {
        const response = await api.post('/api/auth/login', credentials)
        return response.data // Esto es el objeto "Message" de Spring Boot
    } catch (error) {
        // El interceptor de 'api.js' ya manejó el 401 (logout) si era necesario.
        // Aquí solo nos aseguramos de registrar el error y relanzarlo
        // para que el componente que llamó (AuthContext) pueda reaccionar.
        console.error('[loginRequest] Error en la solicitud de login:', error.response?.data || error.message)
        throw error
    }
}

// Si tuvieras un endpoint de registro, iría aquí:
// export const registerRequest = async (userData) => {
//     try {
//         const response = await api.post('/auth/register', userData);
//         return response.data;
//     } catch (error) {
//         console.error("[registerRequest] Error:", error.response?.data || error.message);
//         throw error;
//     }
// };
