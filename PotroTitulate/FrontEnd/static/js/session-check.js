let currentSessionKey = getCookie('session_key');
let forcedReload = false;

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
        const response = await fetch('/api/verificarSesion/', {
            method: 'GET',
            credentials: 'same-origin',
        });

        if (response.status === 200) {
            const data = await response.json();

            // Si no hay sesión activa, no hacer nada
            if (data.mensaje === 'No hay sesión activa') {
                return;
            }

            // Si la sesión es válida, actualizar currentSessionKey
            if (data.mensaje === 'Sesión válida') {
                const newSessionKey = getCookie('session_key');  // Obtener el valor de session_key

                if (newSessionKey) {
                    // Si la sesión es diferente
                    if (newSessionKey !== currentSessionKey) {
                        mostrarAlerta('ℹ️ Se ha detectado un nuevo inicio de sesión. Redirigiendo...', 'info');
                        cerrarSesion(); // Si hay una sesión nueva, cierra la anterior
                    } else {
                    }

                    currentSessionKey = newSessionKey;  // Actualiza currentSessionKey para futuras comparaciones
                }
            }
        } else if (response.status === 401) {
            // Solo cerrar la sesión si hay una sesión activa
            if (currentSessionKey !== null) {
                mostrarAlerta('ℹ️ Tu sesión ha expirado o ha sido cerrada en otro dispositivo.', 'info');
                cerrarSesion(); // Cierra la sesión automáticamente
            } else {
            }
        }
    } catch (error) {
        console.error('Error al verificar la sesión:', error);
    }
}

function cerrarSesion() {
    // Guardar el id_sustentante de la nueva sesión
    const idSustentante = sessionStorage.getItem('id_sustentante');

    // Limpiar solo los datos innecesarios del sessionStorage
    Object.keys(sessionStorage).forEach(key => {
        if (key !== 'id_sustentante') {
            sessionStorage.removeItem(key);
        }
    });

    // Limpiar localStorage si es necesario
    localStorage.clear();

    // Restaurar el id_sustentante en sessionStorage (por si acaso)
    if (idSustentante) {
        sessionStorage.setItem('id_sustentante', idSustentante);
    }

    // Crear un formulario oculto para enviar la solicitud de cierre de sesión
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/specialLogout/';  // Usar la nueva vista especial

    // Obtener CSRF desde el DOM o cookies
    let csrfTokenElement = document.querySelector('input[name="csrfmiddlewaretoken"]');
    let csrfToken = csrfTokenElement ? csrfTokenElement.value : getCookie('csrftoken');

    if (!csrfToken) {
        console.error('No se pudo obtener el token CSRF.');
        return;
    }

    // Agregar el token CSRF al formulario
    let csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrfmiddlewaretoken';
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    // Añadir el formulario al body y enviarlo
    document.body.appendChild(form);
    form.submit();
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
setInterval(checkSession, 5000);

// Llamar al script al cargar la página
window.addEventListener('load', () => {
    checkSession();
});

function mostrarAlerta(mensaje, tipo = "success", duracion = 5000) {
    const toastEl = document.getElementById("toastAlerta");
    const toastBody = toastEl.querySelector(".toast-body");

    // Cambiar color de fondo según el tipo
    toastEl.className = `toast align-items-center text-white bg-${tipo} border-0`;

    // Mensaje
    toastBody.textContent = mensaje;

    // Mostrar
    const toast = new bootstrap.Toast(toastEl, { delay: duracion });
    toast.show();
}
