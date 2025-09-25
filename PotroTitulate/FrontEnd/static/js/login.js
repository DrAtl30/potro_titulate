// FUNCIONES PARA MANEJAR MODALES (compartidas)
function mostrarModal(mensaje, modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`No se encontró el modal con ID ${modalId}`);
        return;
    }

    var modalMessage = modal.querySelector('.modalMessage');
    if (modalMessage) {
        modalMessage.textContent = mensaje;
    } else {
        console.warn(`No se encontró el elemento con clase 'modalMessage' dentro de ${modalId}`);
    }

    modal.style.display = 'flex';

    var closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        };
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    window.onkeydown = function(event) {
        if (event.key === 'Escape') {
            modal.style.display = 'none';
        }
    };
}

// Función para esperar a que el modal se cierre
function esperarCierreModal(modalId) {
    return new Promise((resolve) => {
        const modal = document.getElementById(modalId);
        if (!modal) return resolve();

        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
                resolve();
            };
        }

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                resolve();
            }
        };

        window.onkeydown = (event) => {
            if (['Escape', 'Esc'].includes(event.key)) {
                modal.style.display = 'none';
                resolve();
            }
        };
    });
}

// INICIO DE SESIÓN

// --- Función de utilidad para obtener la cookie CSRF ---
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function mostrarModal(mensaje, modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const modalMessage = modal.querySelector('.modalMessage');
    if (modalMessage) {
        modalMessage.textContent = mensaje;
    }
    modal.style.display = 'flex';
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
        closeBtn.onclick = () => modal.style.display = 'none';
    }
}

function esperarCierreModal(modalId) {
    return new Promise((resolve) => {
        const modal = document.getElementById(modalId);
        if (!modal) return resolve();
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
                resolve();
            };
        }
    });
}


// =============== LÓGICA PRINCIPAL (SE EJECUTA AL CARGAR LA PÁGINA) ===============

document.addEventListener('DOMContentLoaded', function() {

    // --- LÓGICA PARA EL FORMULARIO DE INICIO DE SESIÓN ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const correo = document.getElementById('correo').value;
            const contrasena = document.getElementById('contrasena').value;
            const csrfToken = getCookie('csrftoken');

            // 1. Verificar si el correo está confirmado
            fetch('/api/verificarCorreoConfirmado/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
                body: JSON.stringify({ correo_electronico: correo }),
            })
            .then(async response => {
                if (!response.ok) throw await response.json().catch(() => ({}));
                return response.json();
            })
            .then(data => {
                if (!data.confirmado) {
                    mostrarModal('Tu correo aún no ha sido confirmado. Verifica tu bandeja de entrada.', 'errorModal');
                    throw new Error('Correo no confirmado');
                }
                // 2. Si está confirmado, proceder con el login
                const loginData = { correo_electronico: correo, contrasena: contrasena };
                return fetch('/api/login/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
                    body: JSON.stringify(loginData)
                });
            })
            .then(async response => {
                if (!response.ok) throw await response.json().catch(() => ({}));
                return response.json();
            })
            .then(data => {
                if (data.id_sustentante) {
                    sessionStorage.setItem('sustentante', JSON.stringify(data));
                    if (data.redirigir_a_cambiar_contrasena) {
                        window.location.href = `/cambiarContrasena/${data.id_sustentante}/`;
                    } else {
                        mostrarModal('Inicio de sesión exitoso', 'successModal');
                        esperarCierreModal('successModal').then(() => {
                            window.location.href = '/';
                        });
                    }
                }
            })
            .catch(error => {
                if (error.message === 'Correo no confirmado') return;
                let errorMessage = 'Correo o contraseña incorrectos.';
                if (error.non_field_errors && error.non_field_errors.length > 0) {
                    errorMessage = error.non_field_errors[0];
                } else if (error.error) {
                    errorMessage = error.error;
                }
                console.error('Error durante el login:', error);
                mostrarModal(errorMessage, 'errorModal');
            });
        });
    }

    // --- LÓGICA PARA EL FORMULARIO DE RECUPERAR CONTRASEÑA ---
    const recuperarForm = document.querySelector('.recuperarForm');
    if (recuperarForm) {
        recuperarForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('correo_electronico').value;
            const csrfToken = getCookie('csrftoken'); // Usar getCookie para consistencia

            // Nota: El flujo original de verificar correo antes de recuperar no es necesario
            // ya que el backend puede manejar si el correo no existe. Simplificamos a una sola llamada.
            fetch('/api/recuperarContrasena/', { // URL corregida
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
                body: JSON.stringify({ correo_electronico: email }),
            })
            .then(async response => {
                // El backend puede responder OK incluso si el correo no existe (por seguridad)
                // así que siempre tratamos la respuesta como válida.
                return response.json();
            })

            .then(data => {
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else if (data.error) {
                    // Si el backend sí devuelve un error explícito
                    mostrarModal(data.error, 'errorModal');
                } else {
                    // Si el backend no devuelve redirect, asumimos que todo salió bien
                    // para no revelar si un correo existe o no.
                    window.location.href = '/recuperarContrasenaExito/';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mostrarModal('Hubo un problema al procesar tu solicitud. Inténtalo de nuevo.', 'errorModal');
            });
        });
    }

});