document.addEventListener("DOMContentLoaded", function() {
    // 1) Referencias a elementos
    const aspirantesSection = document.getElementById("aspirantesSection");
    const tablaAspirante = document.getElementById("tablaAspirante");
    const mensajeSection = document.getElementById("mensajeSection");

    const btnAspirantes = document.getElementById("btnAspirantes");
    const btnMensajes = document.getElementById("btnMensajes"); // si lo usas
    const btnPerfilAdmin = document.getElementById("btnPerfilAdmin");

    const aspirantesList = document.getElementById("aspirantesList");
    const btnRegresarAspirantes = document.getElementById("btnRegresarAspirantes");
    const btnEnviar = document.getElementById("btnEnviar");
    const conversacionDiv = document.getElementById("conversacion");
    const nombreAspiranteSpan = document.getElementById("nombreAspirante");
    const mensajeTexto = document.getElementById("mensajeTexto");

    let currentAspiranteId = null;

    // 2) Función para CARGAR LISTA SUSTENTANTES
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
                // Limpia la lista
                aspirantesList.innerHTML = "";

                // Por cada sustentante
                data.sustentantes.forEach(s => {
                    const li = document.createElement("li");
                    li.classList.add("list-group-item");
                    li.setAttribute("data-id", s.id_sustentante);
                    // Podrías concatenar s.apellido si gustas
                    li.textContent = s.nombre;

                    aspirantesList.appendChild(li);
                });
            } else {
                console.error("Error en listaSustentantes:", data.error);
            }
        })
        .catch(err => console.error("Error fetch listaSustentantes:", err));
    }

    // 3) Al hacer click en "Aspirantes"
    btnAspirantes.addEventListener("click", () => {
        // Muestra la sección y oculta las demás
        aspirantesSection.style.display = "block";
        tablaAspirante.style.display = "none";
        mensajeSection.style.display = "none";

        // Llama para obtener lista real
        cargarListaSustentantes();
    });

    // 4) Al hacer click en uno de los aspirantes (list-group-item)
    aspirantesList.addEventListener("click", (e) => {
        if (e.target && e.target.matches(".list-group-item")) {
            currentAspiranteId = e.target.getAttribute("data-id");
            const nombreAspirante = e.target.textContent.trim();

            // Oculta aspirantes y muestra chat
            aspirantesSection.style.display = "none";
            tablaAspirante.style.display = "none";
            mensajeSection.style.display = "block";

            nombreAspiranteSpan.textContent = nombreAspirante;
            cargarConversacion(currentAspiranteId);
        }
    });

    // 5) Función para cargar la conversación (GET /obtenerMensajes/<id>/)
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

    // 6) Botón Regresar (a la lista de aspirantes)
    btnRegresarAspirantes.addEventListener("click", () => {
        aspirantesSection.style.display = "block";
        tablaAspirante.style.display = "none";
        mensajeSection.style.display = "none";
        conversacionDiv.innerHTML = "";
        currentAspiranteId = null;
    });

    // 7) Botón Enviar -> llama enviarMensajeAdmin
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
        console.log("Enviando mensaje admin a ID=", currentAspiranteId, "texto=", texto);
        enviarMensajeAdmin(currentAspiranteId, texto);
    });

    // 8) Función enviarMensajeAdmin
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
                // Recargar la conversación
                cargarConversacion(sustentanteId);
            } else {
                console.error("Error al enviar mensaje:", data.error);
            }
        })
        .catch(err => console.error(err));
    }

    // 9) Función irPerfilAdministrador (opcional)
    function irAPerfilAdministrador() {
        // Opción A: cambiar a esa página
        // window.location.href = "/perfilAdministrador/";
        
        // Opción B: fetch y meter HTML
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

    // 10) Listener para btnPerfilAdmin
    if (btnPerfilAdmin) {
        btnPerfilAdmin.addEventListener("click", () => {
            irAPerfilAdministrador();
        });
    }

    // Función getCookie para CSRF
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
