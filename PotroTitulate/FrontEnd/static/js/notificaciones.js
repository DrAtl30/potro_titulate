// Función para obtener y mostrar notificaciones
function cargarNotificaciones(sustentanteId) {
    fetch(`/api/notificaciones/${sustentanteId}/`) // Asegúrate que esta URL API exista y funcione
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const contenedor = document.getElementById('lista-notificaciones-aqui'); // Apunta al contenedor interno
            const noNotifMsg = document.getElementById('no-notificaciones-msg');
            const badge = document.getElementById('notificaciones-badge');

            if (!contenedor || !noNotifMsg) return; // Salir si los elementos no existen

            if (data.success && data.notificaciones && data.notificaciones.length > 0) {
                mostrarNotificaciones(data.notificaciones);
                noNotifMsg.style.display = 'none'; // Oculta mensaje "no hay notificaciones"
                if (badge) {
                     // Opcional: Contar no leídas si tu API devuelve esa info, si no, solo mostrar si hay alguna
                    const noLeidasCount = data.notificaciones.filter(n => !n.estado_lectura).length; // Asume que API devuelve estado_lectura
                    if (noLeidasCount > 0) {
                        badge.textContent = noLeidasCount > 9 ? '9+' : noLeidasCount; // Muestra el número o 9+
                        badge.style.display = 'inline-block';
                    } else {
                         badge.style.display = 'none';
                    }
                }
            } else {
                contenedor.innerHTML = ''; // Limpia notificaciones viejas
                noNotifMsg.style.display = 'block'; // Muestra mensaje "no hay notificaciones"
                 if (badge) {
                     badge.style.display = 'none'; // Oculta el badge
                 }
                 // Opcional: Podrías mostrar un error si data.success es false
                 if (!data.success) {
                    console.error('Error al cargar notificaciones:', data.error || 'Respuesta no exitosa');
                 }
            }
        })
        .catch(error => console.error('Error en fetch al cargar notificaciones:', error));
}

// Función para mostrar notificaciones en la UI (modificada para usar el contenedor interno)
function mostrarNotificaciones(notificaciones) {
    const contenedor = document.getElementById('lista-notificaciones-aqui'); // Apunta al contenedor interno
    if (!contenedor) return;

    contenedor.innerHTML = ''; // Limpiar contenedor antes de añadir nuevas

    notificaciones.forEach(notif => {
        const notificacionElement = document.createElement('div');
        // Clases base de Bootstrap + clase específica si quieres diferenciar
        notificacionElement.className = `alert alert-${notif.es_de_administrador ? 'warning' : 'info'} alert-dismissible fade show`;
        notificacionElement.setAttribute('role', 'alert');
        // Asigna un ID único basado en la notificación para poder removerla fácilmente
        notificacionElement.id = `notificacion-${notif.id}`; // Usar notif.id que viene de la API

        // Contenido de la alerta
        notificacionElement.innerHTML = `
            <div>
                <strong>${notif.administrativo || 'Sistema'}</strong> <p class="mb-1">${notif.mensaje}</p>
                <small class="text-muted">${new Date(notif.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</small> </div>
            <button type="button" class="btn-close" aria-label="Close" onclick="marcarNotificacionLeida(${notif.id})"></button>
        `;
        // Se usa btn-close de Bootstrap 5 que maneja el cierre visual
        // El onclick llama a tu función para marcarla como leída en el backend

        contenedor.appendChild(notificacionElement);
    });
}

// Función para marcar notificación como leída (Modificada para remover por ID)
window.marcarNotificacionLeida = function(notificacionId) {
    fetch(`/api/notificaciones/marcar_leida/${notificacionId}/`, { // Asegúrate que esta URL API exista
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'), // Usa la función getCookie definida en el HTML
             'Content-Type': 'application/json' // Buena práctica indicar el tipo de contenido
        }
        // No necesitas body si la URL ya identifica la notificación
    })
    .then(response => {
         if (!response.ok) {
             // Si falla, intenta obtener el error del JSON si lo hay
             return response.json().then(errData => {
                 throw new Error(errData.error || `HTTP error! status: ${response.status}`);
             }).catch(() => {
                 // Si no hay JSON en el error, lanza error genérico
                 throw new Error(`HTTP error! status: ${response.status}`);
             });
         }
         return response.json();
    })
    .then(data => {
        if (data.success) {
            // Eliminar la notificación de la UI usando su ID
            const notifElement = document.getElementById(`notificacion-${notificacionId}`);
            if (notifElement) {
                // Usar Bootstrap 5 para remover el alert con animación (opcional)
                 const alertInstance = bootstrap.Alert.getOrCreateInstance(notifElement);
                 if (alertInstance) {
                    alertInstance.close(); // Esto dispara el evento 'closed.bs.alert'
                    // Esperar a que se cierre visualmente antes de verificar si quedan notificaciones
                    notifElement.addEventListener('closed.bs.alert', function () {
                        // Verificar si quedan otras notificaciones
                         const contenedor = document.getElementById('lista-notificaciones-aqui');
                         if (contenedor && contenedor.childElementCount === 0) {
                             document.getElementById('no-notificaciones-msg').style.display = 'block';
                             const badge = document.getElementById('notificaciones-badge');
                             if(badge) badge.style.display = 'none';
                         }
                         // Actualizar badge (podrías recalcular o simplemente ocultar si llega a 0)
                         const badge = document.getElementById('notificaciones-badge');
                         if (badge) {
                            const currentCount = parseInt(badge.textContent) || 0;
                            if (currentCount > 1) {
                                badge.textContent = currentCount - 1;
                            } else {
                                badge.style.display = 'none';
                            }
                         }
                    });
                 } else {
                     notifElement.remove(); // Fallback si Bootstrap no está listo o falla
                     // Re-verificar si quedan notificaciones después de remover directamente
                     const contenedor = document.getElementById('lista-notificaciones-aqui');
                     if (contenedor && contenedor.childElementCount === 0) {
                         document.getElementById('no-notificaciones-msg').style.display = 'block';
                         const badge = document.getElementById('notificaciones-badge');
                         if(badge) badge.style.display = 'none';
                     }
                 }
            }
        } else {
             console.error('Fallo al marcar notificación como leída:', data.error || 'Error desconocido');
             // Opcional: Mostrar un mensaje de error al usuario
             alert(`Error al marcar la notificación: ${data.error || 'Intente de nuevo'}`);
        }
    })
    .catch(error => {
         console.error('Error en fetch al marcar notificación:', error);
         alert(`Error de red al marcar la notificación: ${error.message}`);
     });
};

// Llamar periódicamente para actualizar notificaciones
// Asegúrate que obtenerIdDelSustentante esté definida antes de este punto
const intervalId = setInterval(() => {
    const sustentanteId = obtenerIdDelSustentante(); // Usa la función definida en el HTML
    if (sustentanteId) {
        cargarNotificaciones(sustentanteId);
    } else {
         // Si no podemos obtener el ID (ej. usuario deslogueado), detenemos el intervalo
         console.log("No se encontró ID de sustentante, deteniendo polling de notificaciones.");
         clearInterval(intervalId);
    }
}, 30000); // Actualiza cada 30 segundos

// Opcional: Limpiar intervalo si el usuario navega fuera de la página
window.addEventListener('beforeunload', () => {
    clearInterval(intervalId);
});

// Opcional: Carga inicial cuando el script es parseado (mejor si se hace desde el HTML con DOMContentLoaded)
/*
document.addEventListener('DOMContentLoaded', () => {
    const sustentanteId = obtenerIdDelSustentante();
    if (sustentanteId) {
        cargarNotificaciones(sustentanteId);
    }
});
*/