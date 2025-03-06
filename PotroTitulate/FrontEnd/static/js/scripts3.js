document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("admin-login-form").addEventListener("submit", function(event) {
        event.preventDefault();

        let formData = {
            correo_electronico: document.getElementById("correo").value,
            contrasena: document.getElementById("contrasena").value
        };

        fetch("/api/login/administrador/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")  // Para protección CSRF
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.id_administrador) {
                mostrarModal("Inicio de sesión exitoso", "successModal");
                esperarCierreModal("successModal").then(() => {
                    window.location.href = "/administrador/"; // Redirigir tras éxito
                });
            } else {
                mostrarModal("Credenciales incorrectas", "errorModal");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            mostrarModal("Hubo un problema al procesar tu solicitud", "errorModal");
        });
    });

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== "") {
            let cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                let cookie = cookies[i].trim();
                if (cookie.startsWith(name + "=")) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});

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
    } else {
        console.warn(`No se encontró el botón de cierre en ${modalId}`);
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

function esperarCierreModal(modalId) {
    return new Promise((resolve) => {
        const modal = document.getElementById(modalId);
        const closeBtn = modal.querySelector('.close');

        // Resuelve la promesa cuando el modal se cierre
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            resolve();
        };

        // También resuelve la promesa si se hace clic fuera del modal
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                resolve();
            }
        };

        // Resuelve la promesa si se presiona la tecla Escape
        window.onkeydown = (event) => {
            if (event.key === 'Escape') {
                modal.style.display = 'none';
                resolve();
            }
        };
    });
}

function aprobarTramite(tramiteId, csrfToken) {
    fetch('/revisarOpcionesTitulacion/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken
        },
        body: `tramite_id=${tramiteId}&estado=aprobado`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            mostrarModal('Error al aprobar el trámite', 'errorModal');
        }
    })
    .catch(error => {
        console.error("Error:", error);
        mostrarModal('Hubo un problema al procesar tu solicitud', 'errorModal');
    });
}

function rechazarTramite(tramiteId, csrfToken) {
    fetch('/revisarOpcionesTitulacion/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrfToken
        },
        body: `tramite_id=${tramiteId}&estado=rechazado`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload();
        } else {
            mostrarModal('Error al rechazar el trámite', 'errorModal');
        }
    })
    .catch(error => {
        console.error("Error:", error);
        mostrarModal('Hubo un problema al procesar tu solicitud', 'errorModal');
    });
}
