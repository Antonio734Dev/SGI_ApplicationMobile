export function required(value) {
    if (!value || value.trim() === '') {
        return 'El campo es obligatorio.'
    }
    return null // O return undefined; explícitamente
}

export function validEmail(value) {
    if (value && !value.match(/^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/)) {
        return 'El correo electrónico proporcionado no presenta un formato válido.'
    }
    return null
}

export function validPassword(value) {
    if (value && !value.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?])\S{8,}$/)) {
        return 'La contraseña debe tener al menos 8 caracteres (sin espacios), contener una letra minúscula, una mayúscula, un número y un carácter especial.'
    }
    return null
}
