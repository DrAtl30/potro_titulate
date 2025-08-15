// FUNCIONES PARA MANEJAR MODALES (compartidas con login.js)
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

// RECUPERAR CONTRASEÑA
document.addEventListener('DOMContentLoaded', function() {
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

    // Cambiar contraseña
    const cambiarContrasenaForm = document.querySelector('.cambiarContrasenaForm');
    if (cambiarContrasenaForm) {
        cambiarContrasenaForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const nuevaContrasena = document.getElementById('nueva_contrasena').value;
            const confirmarContrasena = document.getElementById('confirmar_contrasena').value;
            const idSustentante = document.getElementById('id_sustentante').value;
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

            fetch(`/cambiarContrasena/${idSustentante}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({ 
                    nueva_contrasena: nuevaContrasena, 
                    confirmar_contrasena: confirmarContrasena 
                }),
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
                } else {
                    mostrarModal('Contraseña actualizada correctamente', 'successModal');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mostrarModal('Hubo un problema al procesar tu solicitud. Inténtalo de nuevo.', 'errorModal');
            });
        });
    }
});