document.addEventListener("DOMContentLoaded", () => {
    /* ---------------------------- login ---------------------------- */
    const loginForm = document.getElementById("admin-login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const formData = {
                correo_electronico: document.getElementById("correo").value,
                contrasena: document.getElementById("contrasena").value,
            };

            fetch("/api/login/administrador/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCookie("csrftoken"),
                },
                body: JSON.stringify(formData),
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.id_administrador) {
                        /* --- ÉXITO --- */
                        mostrarModal(
                            "Inicio de sesión exitoso",
                            "successModal"
                        );
                        esperarCierreModal("successModal").then(() => {
                            window.location.href = "/administrador/";
                        });
                    } else {
                        /* --- CREDENCIALES INCORRECTAS --- */
                        mostrarModal(
                            "Credenciales incorrectas",
                            "errorModal"
                        );
                        esperarCierreModal("errorModal");
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                    mostrarModal(
                        "Hubo un problema al procesar tu solicitud",
                        "errorModal"
                    );
                    esperarCierreModal("errorModal");
                });
        });
    }

    /* ------------------------ utilidades ------------------------- */
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie) {
            document.cookie.split(";").forEach((c) => {
                const cookie = c.trim();
                if (cookie.startsWith(name + "=")) {
                    cookieValue = decodeURIComponent(
                        cookie.substring(name.length + 1)
                    );
                }
            });
        }
        return cookieValue;
    }
});

/* -----------------------------------------------------------------
   Mostrar modal
------------------------------------------------------------------ */
function mostrarModal(mensaje, modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`No se encontró el modal con ID ${modalId}`);
        return;
    }
    const modalMessage = modal.querySelector(".modalMessage");
    if (modalMessage) modalMessage.textContent = mensaje;
    modal.style.display = "flex";
}

/* -----------------------------------------------------------------
   Esperar cierre modal (X, clic sombra, Escape)
------------------------------------------------------------------ */
function esperarCierreModal(modalId) {
    return new Promise((resolve) => {
        const modal = document.getElementById(modalId);
        const closeBtn = modal.querySelector(".close");

        function cerrar() {
            if (modal.style.display !== "none") {
                modal.style.display = "none";
                quitarListeners();
                resolve();
            }
        }
        function clickSombra(e) {
            if (e.target === modal) cerrar();
        }
        function teclaEsc(e) {
            if (e.key === "Escape" || e.key === "Esc" || e.keyCode === 27)
                cerrar();
        }
        function quitarListeners() {
            if (closeBtn) closeBtn.removeEventListener("click", cerrar);
            modal.removeEventListener("click", clickSombra);
            document.removeEventListener("keydown", teclaEsc);
        }

        if (closeBtn) {
            closeBtn.addEventListener("click", cerrar);
        } else {
            console.warn(
                `No se encontró el botón de cierre en el modal ${modalId}`
            );
        }
        modal.addEventListener("click", clickSombra);
        document.addEventListener("keydown", teclaEsc);
    });
}


