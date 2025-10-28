import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { setSessionExpiredCallback } from '../service/config/api';
import { loginRequest } from '../service/auth';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleLogout = async () => {
        await SecureStore.deleteItemAsync('userToken');

        setUserToken(null);
        setUserRole(null);

        // NOTA: No necesitamos limpiar la cabecera de Axios manualmente.
        // El interceptor de solicitud intentará obtener el token,
        // no lo encontrará, y la siguiente solicitud se enviará sin autorización.
    };

    // 2. Conectamos el interceptor de 401 (expiración de sesión) a nuestra función de logout
    // Esto se ejecuta solo una vez cuando se monta el AuthProvider
    useEffect(() => {
        setSessionExpiredCallback(handleLogout);
    }, []);

    useEffect(() => {
        // Al cargar la app, intentar recuperar el TOKEN
        const bootstrapAsync = async () => {
            let token;
            try {
                // 1. Usamos SecureStore para obtener el token encriptado
                token = await SecureStore.getItemAsync('userToken');

                if (token) {
                    // 2. Decodificamos el token para extraer el rol
                    // Asegúrate de que tu JWT de Spring Boot incluya el "role"
                    const decodedToken = jwtDecode(token);
                    const roleFromToken = decodedToken.role; // Asumiendo que el rol está en la propiedad 'role'

                    if (roleFromToken) {
                        // 3. Establecemos el estado
                        setUserToken(token);
                        setUserRole(roleFromToken);

                        // IMPORTANTE: Ya NO necesitamos configurar Axios aquí.
                        // El interceptor de solicitud se encargará de esto automáticamente.
                        // api.defaults.headers.common['Authorization'] = `Bearer ${token}`; // <-- ELIMINADO
                    } else {
                        // El token es inválido o no tiene rol
                        throw new Error("Token inválido o malformado");
                    }
                }
            } catch (e) {
                // Error al restaurar o decodificar el token, forzamos logout
                console.error("Error al restaurar token", e);
                await SecureStore.deleteItemAsync('userToken');
                // api.defaults.headers.common['Authorization'] = null; // <-- ELIMINADO
            }

            // 4. Terminamos la carga
            setIsLoading(false);
        };

        bootstrapAsync();
    }, []);

    const authContextValue = {
        login: async (email, password) => {
            try {
                const responseData = await loginRequest({ email, password });

                // La respuesta ya es response.data (el objeto Message)
                const token = responseData.result.jwt; 

                // 3. Decodificamos el token INMEDIATAMENTE para obtener el rol
                const decodedToken = jwtDecode(token);
                const roleFromToken = decodedToken.role; // Confirma que tu JWT incluya 'role'

                if (!roleFromToken) {
                    throw new Error("Token recibido no contiene un rol.");
                }

                // 4. Guardar SOLO EL TOKEN en almacenamiento seguro
                await SecureStore.setItemAsync('userToken', token);

                // 5. Ya NO necesitamos configurar la cabecera de Axios aquí.
                // El interceptor lo hará en la próxima solicitud.
                // api.defaults.headers.common['Authorization'] = `Bearer ${token}`; // <-- ELIMINADO

                // 6. Establecer estado de React
                setUserToken(token);
                setUserRole(roleFromToken);
            } catch (error) {
                // El manejo de error ahora recibe el error del backend
                const errorMessage = error.response?.data?.description || "Error de conexión";
                throw new Error(errorMessage);
            }
        },
        logout: handleLogout,
        userToken,
        userRole,
        isLoading,
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};
