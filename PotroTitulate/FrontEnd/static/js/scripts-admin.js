document.addEventListener("DOMContentLoaded", function() {
    // 1) Referencias a elementos
    const aspirantesSection = document.getElementById("aspirantesSection");
    const tablaAspirante = document.getElementById("tablaAspirante");
    const mensajeSection = document.getElementById("mensajeSection");

    const btnAspirantes = document.getElementById("btnAspirantes");
    const btnMensajes = document.getElementById("btnMensajes");
    const btnPerfilAdmin = document.getElementById("btnPerfilAdmin");

    const aspirantesList = document.getElementById("aspirantesList");
    const btnRegresarAspirantes = document.getElementById("btnRegresarAspirantes");
    const btnEnviar = document.getElementById("btnEnviar");
    const conversacionDiv = document.getElementById("conversacion");
    const nombreAspiranteSpan = document.getElementById("nombreAspirante");
    const mensajeTexto = document.getElementById("mensajeTexto");

    let currentAspiranteId = null;

    // 2) Función para alternar visibilidad de secciones
    function toggleSection(sectionToShow) {
        if (sectionToShow.style.display === "none" || sectionToShow.style.display === "") {
            aspirantesSection.style.display = (sectionToShow === aspirantesSection) ? "block" : "none";
            mensajeSection.style.display = (sectionToShow === mensajeSection) ? "block" : "none";
        } else {
            sectionToShow.style.display = "none";
        }
    }

    // 3) Función para CARGAR LISTA SUSTENTANTES
    function cargarListaSustentantes() {
        console.log("Cargando lista de sustentantes...");

        fetch("/listaSustentantes/")
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al obtener la lista de sustentantes");
            }
            return response.json();
        })
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

    // 4) Alternar visibilidad de la lista de aspirantes
    btnAspirantes.addEventListener("click", () => {
        toggleSection(aspirantesSection);
        if (aspirantesSection.style.display === "block") {
            cargarListaSustentantes();
        }
    });

    // 5) Alternar visibilidad de la sección de mensajes
    btnMensajes.addEventListener("click", () => {
        toggleSection(mensajeSection);
    });

    // 6) Al hacer click en un aspirante
    aspirantesList.addEventListener("click", (e) => {
        if (e.target && e.target.matches(".list-group-item")) {
            currentAspiranteId = e.target.getAttribute("data-id");
            const nombreAspirante = e.target.textContent.trim();

            aspirantesSection.style.display = "none";
            mensajeSection.style.display = "block";

            nombreAspiranteSpan.textContent = nombreAspirante;
            cargarConversacion(currentAspiranteId);
        }
    });

    // 7) Función para cargar la conversación
    function cargarConversacion(sustentanteId) {
        console.log("Cargando conversación para ID:", sustentanteId);

        fetch(`/obtenerMensajes/${sustentanteId}/`)
        .then(r => {
            if (!r.ok) {
                throw new Error("Error al obtener mensajes");
            }
            return r.json();
        })
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
        .catch(err => console.error(err));
    }

    // 8) Botón Regresar (a la lista de aspirantes)
    btnRegresarAspirantes.addEventListener("click", () => {
        aspirantesSection.style.display = "block";
        mensajeSection.style.display = "none";
        conversacionDiv.innerHTML = "";
        currentAspiranteId = null;
    });

    // 9) Botón Enviar mensaje
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

    // 10) Función enviarMensajeAdmin
    function enviarMensajeAdmin(sustentanteId, texto) {
        fetch("/enviarMensajeAdmin/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify({
                sustentante_id: sustentanteId,
                mensaje: texto
            })
        })
        .then(r => {
            if (!r.ok) {
                throw new Error("Error al enviar mensaje admin");
            }
            return r.json();
        })
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

    // 11) Función irPerfilAdministrador (opcional)
    function irAPerfilAdministrador() {
        fetch("/perfilAdministrador/")
        .then(r => r.text())
        .then(html => {
            const contenedor = document.getElementById("contenedor-principal");
            if (contenedor) {
                contenedor.innerHTML = html;
            } else {
                console.warn("No existe #contenedor-principal para inyectar");
            }
        })
        .catch(err => console.error(err));
    }

    // 12) Listener para btnPerfilAdmin
    if (btnPerfilAdmin) {
        btnPerfilAdmin.addEventListener("click", () => {
            irAPerfilAdministrador();
        });
    }

    // 13) Función getCookie para CSRF
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
