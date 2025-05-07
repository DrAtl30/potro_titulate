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
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.id_administrador) {
                // Muestra el modal de éxito y espera a que el usuario lo cierre
                mostrarModal("Inicio de sesión exitoso", "successModal");
                esperarCierreModal("successModal").then(() => {
                    window.location.href = "/administrador/";  // Redirige tras cerrar el modal
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


// Función que muestra el modal
function mostrarModal(mensaje, modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`No se encontró el modal con ID ${modalId}`);
        return;
    }
    var modalMessage = modal.querySelector('.modalMessage');
    if (modalMessage) {
        modalMessage.textContent = mensaje;
    }
    modal.style.display = 'flex';
}

// Función que espera a que el usuario cierre el modal

// Función para esperar a que el modal se cierre
function esperarCierreModal(modalId) {
    return new Promise((resolve) => {
        const modal = document.getElementById(modalId);
        const closeBtn = modal.querySelector('.close');


        function handleClose() {
            if (modal.style.display !== 'none') {
                modal.style.display = 'none';
                removeListeners();
                resolve();
            }
        }

        function handleClickOutside(e) {
            if (e.target === modal) {
                handleClose();
            }
        }

        function handleKeyDown(e) {
            if (e.key === 'Escape') {
                handleClose();
            }
        }

        function removeListeners() {
            if (closeBtn) closeBtn.removeEventListener('click', handleClose);
            modal.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', handleClose);
        } else {
            console.warn(`No se encontró el botón de cierre en ${modalId}`);
        }
        modal.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
    });

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
            const escapeKeys = ['Escape', 'Esc'];
            const escapeKeyCodes = [27];
            const escapeKeyCodesDeprecated = [1, '1']; // Algunos teclados pueden enviar un código de tecla de escape diferente
        
            if (escapeKeys.includes(event.key) || escapeKeyCodes.includes(event.keyCode) || escapeKeyCodesDeprecated.includes(event.keyCode)) {
                modal.style.display = 'none';
                resolve();
            }
        };
    };


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
