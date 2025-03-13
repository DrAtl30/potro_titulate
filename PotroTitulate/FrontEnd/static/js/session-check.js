let currentSessionKey = getCookie('session_key');
console.log('Valor de currentSessionKey:', currentSessionKey); // Depuración
let forcedReload = false;
let sessionCheckInterval;

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue); // Usamos decodeURIComponent para manejar valores codificados
        }
    }
    return null;
}


async function checkSession() {
    try {
        // Si no hay una sesión activa, no hacer nada
        if (!currentSessionKey) {
            console.log('No hay sesión activa.');
            return;
        }

        const response = await fetch('/api/verificar-sesion/', { method: 'GET', credentials: 'same-origin' });

        if (response.status === 401) {
            console.log('Sesión cerrada detectada. Cerrando sesión...');
            alert('Tu sesión ha expirado o ha sido cerrada en otro dispositivo.');
            cerrarSesion(); // Cierra la sesión automáticamente
            clearInterval(sessionCheckInterval); // Detener la verificación de sesión
        } else if (response.ok) {
            const data = await response.json();
            console.log('Respuesta del backend:', data); // Depuración
            const newSessionKey = data.current_session_key; // Obtener el session_key actual del backend

            // Si el backend no devuelve un session_key, no hacer nada
            if (!newSessionKey) {
                console.log('No se recibió un session_key válido del backend.');
                return;
            }

            // Solo se activa si la clave de sesión ha cambiado
            if (newSessionKey !== currentSessionKey) {
                console.log('Nueva sesión detectada. Cerrando la sesión anterior...');
                alert('Se ha detectado un nuevo inicio de sesión. Redirigiendo...');
                cerrarSesion(); // Si hay una sesión nueva, cierra la anterior
                clearInterval(sessionCheckInterval); // Detener la verificación de sesión
            } else {
                console.log('La sesión actual es válida.');
            }
        }
    } catch (error) {
        console.error('Error al verificar la sesión:', error);
    }
}

function cerrarSesion() {
    // Crear un formulario oculto para enviar la solicitud de cierre de sesión
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/logout/';

    // Obtener CSRF desde el DOM o cookies
    let csrfTokenElement = document.querySelector('input[name="csrfmiddlewaretoken"]');
    let csrfToken = csrfTokenElement ? csrfTokenElement.value : getCookie('csrftoken');

    if (csrfToken) {
        let csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrfmiddlewaretoken';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);
    }

    // Limpiar localStorage y sessionStorage
    sessionStorage.clear();
    localStorage.clear();

    // Añadir el formulario al body y enviarlo
    document.body.appendChild(form);
    form.submit();

    // Redirigir al usuario a la página principal después de un breve retraso
    setTimeout(() => {
        window.location.href = '/';
    }, 100);
}

// Evento para cerrar sesión en otras pestañas
window.addEventListener('storage', (event) => {
    if (event.key === 'sessionClosed' && !forcedReload) {
        forcedReload = true;
        console.log('Recargando página por cierre de sesión...');
        window.location.reload(true);
    }
});

// Verifica cada 5 segundos si la sesión sigue activa
sessionCheckInterval = setInterval(checkSession, 5000);

// Llamar al script al cargar la página
window.addEventListener('load', () => {
    // Solo verificar la sesión si hay una sesión activa
    if (currentSessionKey) {
        checkSession();
    } else {
        console.log('No hay sesión activa al cargar la página.');
    }
});