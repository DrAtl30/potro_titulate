document.addEventListener("DOMContentLoaded", function() {
    // 1) Referencias a elementos
    const aspirantesSection = document.getElementById("aspirantesSection");
    const tablaAspirante = document.getElementById("tablaAspirante");
    const mensajeSection = document.getElementById("mensajeSection");
    const tramitesSection = document.getElementById("tramitesSection");

    const btnAspirantes = document.getElementById("btnAspirantes");
    const btnMensajes = document.getElementById("btnMensajes");
    const btnTramites = document.getElementById("btnTramites");

    const aspirantesList = document.getElementById("aspirantesList");
    const btnRegresarAspirantes = document.getElementById("btnRegresarAspirantes");
    const btnEnviar = document.getElementById("btnEnviar");
    const conversacionDiv = document.getElementById("conversacion");
    const nombreAspiranteSpan = document.getElementById("nombreAspirante");
    const mensajeTexto = document.getElementById("mensajeTexto");

    // Elementos de trámites
    const btnMostrarEspera = document.getElementById("btnMostrarEspera");
    const btnMostrarProgreso = document.getElementById("btnMostrarProgreso");
    const listaTramitesEspera = document.getElementById("listaTramitesEspera");
    const listaTramitesProgreso = document.getElementById("listaTramitesProgreso");

    let currentAspiranteId = null;

    // 2) Función para ocultar todas las secciones
    function hideAllSections() {
        aspirantesSection.style.display = "none";
        mensajeSection.style.display = "none";
        tablaAspirante.style.display = "none";
        tramitesSection.style.display = "none";
    }

    // 3) Función para mostrar una sección específica
    function showSection(sectionToShow) {
        hideAllSections();
        sectionToShow.style.display = "block";
    }

    // 4) Función para CARGAR LISTA SUSTENTANTES
    function cargarListaSustentantes() {
        console.log("Cargando lista de sustentantes...");

        fetch("/listaSustentantes/")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                aspirantesList.innerHTML = "";
                data.sustentantes.forEach(s => {
                    const li = document.createElement("li");
                    li.classList.add("list-group-item");
                    li.setAttribute("data-id", s.id_sustentante);
                    li.textContent = s.nombre;
                    aspirantesList.appendChild(li);
                });
            } else {
                console.error("Error en listaSustentantes:", data.error);
            }
        })
        .catch(err => console.error("Error fetch listaSustentantes:", err));
    }

    // 5) Función para cargar trámites en espera
    function cargarTramitesEspera() {
        fetch("/api/tramites/espera/")
            .then(response => response.json())
            .then(data => {
                // Asegurarse de que 'data.tramites' sea un array
                if (!Array.isArray(data.tramites)) {
                    console.error("La respuesta no contiene un array en la propiedad 'tramites':", data);
                    return; // Salir de la función si no es un array
                }

                listaTramitesEspera.innerHTML = "";
                data.tramites.forEach(tramite => {
                    const li = document.createElement("li");
                    li.classList.add("list-group-item");
                    li.textContent = `${tramite.sustentante} - ${tramite.nombre}`;
                    listaTramitesEspera.appendChild(li);
                });

                document.getElementById("tramitesEspera").style.display = "block";
                document.getElementById("tramitesProgreso").style.display = "none";
            })
            .catch(error => console.error("Error en la solicitud:", error));
    }


    // 6) Función para cargar trámites en proceso
    function cargarTramitesProgreso() {
        fetch("/api/tramites/progreso/")
            .then(response => response.json())
            .then(data => {
                listaTramitesProgreso.innerHTML = "";

                if (!data.success) {
                    console.error("Error al obtener trámites en progreso:", data.error);
                    return;
                }

                data.tramites.forEach(tramite => {
                    const li = document.createElement("li");
                    li.classList.add("list-group-item");
                    li.textContent = `${tramite.sustentante} - ${tramite.nombre} (Actualizado: ${tramite.fecha_actualizacion})`;
                    listaTramitesProgreso.appendChild(li);
                });

                document.getElementById("tramitesEspera").style.display = "none";
                document.getElementById("tramitesProgreso").style.display = "block";
            })
            .catch(error => console.error("Error en la solicitud:", error));
    }

    // 7) Función para aprobar trámites
    window.aprobarTramite = function(id) {
        fetch(`/api/tramites/aprobar/${id}/`, { method: "POST" })
            .then(response => response.json())
            .then(data => {
                alert("Trámite aprobado");
                cargarTramitesProgreso();
            });
    }

    // 8) Event listeners para botones principales
    btnAspirantes.addEventListener("click", () => {
        showSection(aspirantesSection);
        cargarListaSustentantes();
    });

    btnMensajes.addEventListener("click", () => {
        showSection(mensajeSection);
    });

    btnTramites.addEventListener("click", () => {
        showSection(tramitesSection);
        // Aquí se elimina la llamada automática a cargarTramitesEspera
    });

    // 9) Event listeners para botones de trámites
    btnMostrarEspera.addEventListener("click", cargarTramitesEspera);  // Solo se ejecuta cuando se hace clic en el botón de espera
    btnMostrarProgreso.addEventListener("click", cargarTramitesProgreso);
    
    // 10) Al hacer click en un aspirante
    aspirantesList.addEventListener("click", (e) => {
        if (e.target && e.target.matches(".list-group-item")) {
            currentAspiranteId = e.target.getAttribute("data-id");
            const nombreAspirante = e.target.textContent.trim();

            showSection(mensajeSection);
            nombreAspiranteSpan.textContent = nombreAspirante;
            cargarConversacion(currentAspiranteId);
        }
    });

    // 11) Función para cargar la conversación
    function cargarConversacion(sustentanteId) {
        console.log("Cargando conversación para ID:", sustentanteId);
    
        fetch(`/obtener_mensajes/${sustentanteId}/`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    conversacionDiv.innerHTML = "";
                    data.mensajes.forEach(msg => {
                        const p = document.createElement("p");
                        const remitente = msg.es_de_administrador ? "Admin" : "Sustentante";
                        p.textContent = `${remitente}: ${msg.mensaje}`;
                        conversacionDiv.appendChild(p);
                    });
                } else {
                    console.error("Error al obtener mensajes:", data.error);
                }
            })
            .catch(error => console.error("Error:", error));
    }

    // 12) Botón Regresar
    btnRegresarAspirantes.addEventListener("click", () => {
        showSection(aspirantesSection);
        conversacionDiv.innerHTML = "";
        currentAspiranteId = null;
    });

    // 13) Botón Enviar mensaje
    btnEnviar.addEventListener("click", () => {
        if (!currentAspiranteId) {
            console.warn("No hay aspirante seleccionado");
            return;
        }
        const texto = mensajeTexto.value.trim();
        if (!texto) {
            console.warn("Mensaje vacío");
            return;
        }
        enviarMensajeAdmin(currentAspiranteId, texto);
    });

    // 14) Función enviarMensajeAdmin
    function enviarMensajeAdmin(sustentanteId, mensaje) {
        fetch(`/enviarMensajeAdmin/${sustentanteId}/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify({ mensaje: mensaje })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mensajeTexto.value = "";
                cargarConversacion(sustentanteId);
            } else {
                console.error("Error al enviar mensaje:", data.error);
            }
        })
        .catch(err => console.error(err));
    }
    
    // 15) Función getCookie para CSRF
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

 // Función para esperar a que el modal se cierre
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
            const escapeKeys = ['Escape', 'Esc'];
            const escapeKeyCodes = [27];
            const escapeKeyCodesDeprecated = [1, '1']; // Algunos teclados pueden enviar un código de tecla de escape diferente
        
            if (escapeKeys.includes(event.key) || escapeKeyCodes.includes(event.keyCode) || escapeKeyCodesDeprecated.includes(event.keyCode)) {
                modal.style.display = 'none';
                resolve();
            }
        };
    });
}

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
