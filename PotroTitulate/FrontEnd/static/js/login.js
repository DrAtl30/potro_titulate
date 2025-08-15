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
document.addEventListener('DOMContentLoaded', function() {
    const csrfTokenLogin = document.querySelector('[name=csrfmiddlewaretoken]');
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const correo = document.getElementById('correo').value;
            const contrasena = document.getElementById('contrasena').value;

            fetch('/verificarCorreoConfirmado/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfTokenLogin ? csrfTokenLogin.value : ''
                },
                body: JSON.stringify({ correo_electronico: correo }),
            })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
                return response.json();
            })
            .then(data => {
                if (!data.confirmado) {
                    mostrarModal('Tu correo aún no ha sido confirmado. Verifica tu bandeja de entrada.', 'errorModal');
                    throw new Error('Correo no confirmado');
                }
                return fetch('/api/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfTokenLogin ? csrfTokenLogin.value : ''
                    },
                    body: JSON.stringify({ correo_electronico: correo, contrasena: contrasena })
                });
            })
            .then(response => {
                if (!response.ok) return response.json().then(err => { throw err; });
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
                            window.location.href = '/index/';
                        });
                    }
                }
            })
            .catch(error => {
                if (error.message !== 'Correo no confirmado') {
                    console.error('Error:', error);
                    mostrarModal('Correo o contraseña incorrectos', 'errorModal');
                }
            });
        });
    }

    // Recuperar contraseña
    const recuperarForm = document.querySelector('.recuperarForm');
    if (recuperarForm) {
        recuperarForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const email = document.getElementById('correo_electronico').value;
            const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;

            fetch('/verificarCorreoConfirmado/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ correo_electronico: email }),
            })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
                return response.json();
            })
            .then(data => {
                if (!data.confirmado) {
                    mostrarModal('Tu correo aún no ha sido confirmado. Verifica tu bandeja de entrada.', 'errorModal');
                    return;
                }
                return fetch('/recuperarContrasena/recuperarContra', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify({ correo_electronico: email }),
                });
            })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
                return response.json();
            })
            .then(data => {
                if (data.redirect) {
                    window.location.href = data.redirect;
                } else if (data.error) {
                    mostrarModal(data.error, 'errorModal');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mostrarModal('Hubo un problema al procesar tu solicitud. Inténtalo de nuevo.', 'errorModal');
            });
        });
    }
});