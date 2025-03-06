document.addEventListener("DOMContentLoaded", function() {
    const aspirantesSection = document.getElementById("aspirantesSection");
    const tablaAspirante = document.getElementById("tablaAspirante");
    const mensajeSection = document.getElementById("mensajeSection");
    
    const btnRegresarAspirantes = document.getElementById("btnRegresarAspirantes");
    const btnEnviar = document.getElementById("btnEnviar");
    const conversacionDiv = document.getElementById("conversacion");
    const nombreAspiranteSpan = document.getElementById("nombreAspirante");
    const mensajeTexto = document.getElementById("mensajeTexto");

    // ID de aspirante con quien se está "chateando"
    let currentAspiranteId = null;

    // Ejemplo: cuando clicas un aspirante del listado
    const aspirantesList = document.getElementById("aspirantesList");
    aspirantesList.addEventListener("click", (e) => {
        if (e.target && e.target.matches(".list-group-item")) {
            currentAspiranteId = e.target.getAttribute("data-id");
            const nombreAspirante = e.target.textContent.trim();

            // Muestra sección de mensajes
            aspirantesSection.style.display = "none";
            tablaAspirante.style.display = "none";
            mensajeSection.style.display = "block";

            // Coloca el nombre en el encabezado
            nombreAspiranteSpan.textContent = nombreAspirante;

            // Carga la conversación desde el backend
            cargarConversacion(currentAspiranteId);
        }
    });

    // Botón para regresar al listado de aspirantes
    btnRegresarAspirantes.addEventListener("click", () => {
        // Muestra la sección de aspirantes, oculta la de mensajes
        aspirantesSection.style.display = "block";
        tablaAspirante.style.display = "none";
        mensajeSection.style.display = "none";
        conversacionDiv.innerHTML = ""; // Limpia la conversación
        currentAspiranteId = null;
    });

    // Función para obtener la conversación
    function cargarConversacion(sustentanteId) {
        console.log("Cargando conversación para ID:", sustentanteId);

        fetch(`/obtenerMensajes/${sustentanteId}/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al obtener mensajes");
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    conversacionDiv.innerHTML = ""; // Limpia el contenido

                    data.mensajes.forEach(msg => {
                        // Creamos un párrafo para cada mensaje
                        const p = document.createElement("p");
                        const remitente = msg.es_de_administrador ? "Admin" : "Sustentante";
                        p.textContent = `${remitente}: ${msg.mensaje}`;
                        conversacionDiv.appendChild(p);
                    });
                } else {
                    console.error("Error al obtener mensajes:", data.error);
                }
            })
            .catch(err => console.error("Error fetch:", err));
    }

    // Al enviar mensaje
    btnEnviar.addEventListener("click", () => {
        if (!currentAspiranteId) {
            console.warn("No hay aspirante seleccionado.");
            return;
        }
        
        const texto = mensajeTexto.value.trim();
        if (!texto) {
            console.warn("Mensaje vacío, no se envía.");
            return;
        }

        console.log("Enviando mensaje:", texto, "al ID", currentAspiranteId);

        // Hacemos POST al endpoint para enviar el mensaje
        fetch("/enviarMensajeAdmin/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Ajusta si usas CSRF en Django
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify({
                sustentante_id: currentAspiranteId,
                mensaje: texto
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al enviar mensaje");
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Limpiamos el textarea
                mensajeTexto.value = "";
                // Recargamos la conversación
                cargarConversacion(currentAspiranteId);
            } else {
                console.error("Error al enviar mensaje:", data.error);
            }
        })
        .catch(err => console.error("Error fetch:", err));
    });

    // Función getCookie para CSRF (si usas django con csrf activado)
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
