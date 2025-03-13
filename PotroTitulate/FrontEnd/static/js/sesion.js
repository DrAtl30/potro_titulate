/*
/ Verifica si la sesión está activa
function verificarSesion() {
    fetch('/api/perfil/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (response.status === 401) {
            // Si la respuesta es 401, significa que la sesión no es válida, redirige al login
            window.location.href = '/iniciosesion';  // Cambia la URL al login de tu aplicación
        }
    })
    .catch(error => {
        console.error('Error al verificar sesión:', error);
    });
}

// Llama a la función de verificación cuando la página se carga
document.addEventListener("DOMContentLoaded", function() {
    verificarSesion();
});
*/