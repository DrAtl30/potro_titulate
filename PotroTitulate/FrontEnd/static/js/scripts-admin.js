 // Sistema de manejo de modales unificado
 const ModalManager = {
    currentModal: null,
    
    show: function(modalElement) {
        this.hide(); // Cerrar cualquier modal abierto
        this.currentModal = modalElement;
        modalElement.classList.add('show');
        modalElement.style.display = 'block';
        document.body.classList.add('modal-open');
        
        // Agregar backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop fade show';
        document.body.appendChild(backdrop);
    },
    
    hide: function() {
        if (this.currentModal) {
            this.currentModal.classList.remove('show');
            this.currentModal.style.display = 'none';
            document.body.classList.remove('modal-open');
            
            // Remover backdrop
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
            
            this.currentModal = null;
        }
    },
    
    setupModalEvents: function(modalElement) {
        // Botón de cerrar (X)
        modalElement.querySelector('.close').addEventListener('click', () => this.hide());
        
        // Botón Cancelar
        const cancelBtn = modalElement.querySelector('#cancelarAccion');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hide());
        }
        
        // Clic fuera del modal
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) {
                this.hide();
            }
        });
    }
};


// 14) Función getCookie para CSRF
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
    const searchAspirantes = document.getElementById("searchAspirantes");
    const searchTramites = document.getElementById("searchTramites");

    // Elementos de trámites
    const btnMostrarEspera = document.getElementById("btnMostrarEspera");
    const btnMostrarProgreso = document.getElementById("btnMostrarProgreso");
    const listaTramitesEspera = document.getElementById("listaTramitesEspera");
    const listaTramitesProgreso = document.getElementById("listaTramitesProgreso");

   
    const modalConfirmacion = document.createElement('div');
    modalConfirmacion.className = 'modal fade';
    modalConfirmacion.id = 'confirmacionModal';
    modalConfirmacion.setAttribute('tabindex', '-1');
    modalConfirmacion.setAttribute('aria-hidden', 'true');
    modalConfirmacion.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalTitle">Confirmar acción</h5>
                    <button type="button" class="close" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p id="modalMessage">¿Estás seguro de realizar esta acción?</p>
                    <div id="motivoRechazoContainer" style="display: none;">
                        <div class="form-group mt-3">
                            <label for="motivoRechazoInput">Motivo de rechazo:</label>
                            <textarea 
                                id="motivoRechazoInput" 
                                class="form-control" 
                                rows="3" 
                                placeholder="Ingrese el motivo de rechazo"></textarea>
                            <small class="text-muted">Puede modificar el motivo existente</small>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="cancelarAccion">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="confirmarAccion">Confirmar</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modalConfirmacion);

    // Crear modal dinámicamente
    const modalEditar = document.createElement('div');
    modalEditar.className = 'modal fade';
    modalEditar.id = 'modalEditarOportunidades';
    modalEditar.tabIndex = -1;
    modalEditar.innerHTML = `
    <div class="modal-dialog">
        <div class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title">Editar Oportunidades para <span id="nombreSustentante"></span></h5>
            <button type="button" class="close">&times;</button>
        </div>
        <div class="modal-body">
            <p>Oportunidades actuales: <span id="oportunidadesActuales"></span></p>
            <div class="d-flex gap-2">
            <button id="btnAgregar" class="btn btn-success">Agregar</button>
            <button id="btnQuitar" class="btn btn-danger">Quitar</button>
            <button id="cancelarAccion" class="btn btn-secondary">Cancelar</button>
            </div>
        </div>
        </div>
    </div>
    `;


    // Insertarlo en el body
    document.body.appendChild(modalEditar);

    // Configurar eventos del modal recién creado
    ModalManager.setupModalEvents(modalEditar);

    // Event Listeners para botones del modal
    modalEditar.querySelector('#btnAgregar').addEventListener('click', () => {
    if (oportunidadesActuales < 3) {
        oportunidadesActuales++;
        document.getElementById('oportunidadesActuales').textContent = oportunidadesActuales;
        actualizarOportunidades();
    } else {
        alert('No se pueden asignar más de 3 oportunidades.');
    }
    });

    modalEditar.querySelector('#btnQuitar').addEventListener('click', () => {
    if (oportunidadesActuales > 0) {
        oportunidadesActuales--;
        document.getElementById('oportunidadesActuales').textContent = oportunidadesActuales;
        actualizarOportunidades();
    } else {
        alert('No puede haber menos de 0 oportunidades.');
    }
    });


    

    // Configurar eventos para el modal de confirmación
    ModalManager.setupModalEvents(modalConfirmacion);

    // Función para mostrar confirmación con motivo de rechazo (actualizada)
    window.mostrarConfirmacion = function(tramiteId, accion, motivoActual = '') {
        const modal = document.getElementById('confirmacionModal');
        const motivoContainer = document.getElementById('motivoRechazoContainer');
        const motivoInput = document.getElementById('motivoRechazoInput');
        
        // Configurar según el tipo de acción
        if (accion === 'rechazar') {
            document.getElementById('modalTitle').textContent = 'Confirmar rechazo de solicitud';
            document.getElementById('modalMessage').textContent = '¿Estás seguro de rechazar esta solicitud?';
            motivoContainer.style.display = 'block';
            motivoInput.value = motivoActual || 'No cumple con los requisitos establecidos';
        } else {
            document.getElementById('modalTitle').textContent = 'Confirmar solicitud';
            document.getElementById('modalMessage').textContent = '¿Estás seguro de aprobar esta solicitud?';
            motivoContainer.style.display = 'none';
        }

        // Configurar acción del botón confirmar
        const confirmBtn = document.getElementById('confirmarAccion');
        confirmBtn.onclick = function() {
            const data = {
                motivo_rechazo: accion === 'rechazar' ? motivoInput.value.trim() : ''
            };

            fetch(`/api/tramites/${accion}/${tramiteId}/`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCookie("csrftoken"),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    ModalManager.hide();
                    const mensaje = accion === 'aprobar' 
                        ? 'Trámite aprobado correctamente' 
                        : 'Trámite rechazado correctamente';
                    
                    alert(mensaje);
                    cargarTramitesEspera();
                } else {
                    throw new Error(data.error || 'Error desconocido');
                }
            })
            .catch(error => {
                alert(`Error al ${accion} el trámite: ${error.message}`);
            });
        };

        // Mostrar modal usando el manager
        ModalManager.show(modal);
    };

    let currentAspiranteId = null;
    let currentTramiteId = null;
    let currentAction = null; // 'aprobar' o 'rechazar'

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
    let sustentantesData = []; // Variable global para almacenar los datos originales
    function cargarListaSustentantes() {

        fetch("/listaSustentantes/")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                sustentantesData = data.sustentantes; // Guardamos los datos originales
                actualizarListaAspirantes(data.sustentantes);
            } else {
                console.error("Error en listaSustentantes:", data.error);
            }
        })
        .catch(err => console.error("Error fetch listaSustentantes:", err));
    }

    // Función auxiliar para actualizar la lista visualmente
    function actualizarListaAspirantes(sustentantes) {
        aspirantesList.innerHTML = "";
        sustentantes.forEach(s => {
            const li = document.createElement("li");
            li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
            li.setAttribute("data-id", s.id_sustentante);
    
            const contenido = document.createElement("div");
            contenido.innerHTML = `
                <strong>${s.nombre}</strong>
                <div class="text-muted small">
                    ${s.numero_cuenta ? `No. cuenta: ${s.numero_cuenta}` : 'No. cuenta: No disponible'} | 
                    ${s.correo || 'Correo: No disponible'}
                </div>
                <div class="text-muted small">
                    Oportunidades restantes: 
                    <strong id="oportunidades-${s.id_sustentante}">
                        ${s.oportunidades_restantes !== undefined ? s.oportunidades_restantes : 'No disponible'}
                    </strong>
                    <button class="btn btn-primary btn-sm"
                        onclick="editarOportunidades(${s.id_sustentante}, '${s.nombre}', ${s.oportunidades_restantes})">
                        Editar Oportunidades
                    </button>
                </div>
            `;
    
            li.appendChild(contenido);
            aspirantesList.appendChild(li);
        });
    }
    
    
    // 5) Función para cargar trámites en espera (modificada)
    function cargarTramitesEspera() {
        fetch("/api/tramites/espera/")
            .then(response => response.json())
            .then(data => {

                if (!Array.isArray(data.tramites)) {
                    console.error("La respuesta no contiene un array en la propiedad 'tramites':", data);
                    return;
                }

                listaTramitesEspera.innerHTML = "";
                data.tramites.forEach(tramite => {

                    const li = document.createElement("li");
                    li.classList.add("list-group-item", "tramite-item");
                    li.setAttribute("data-id", tramite.id_tramite);
                    li.setAttribute("data-opcion", tramite.id_opcion);
                    li.style.minHeight = '100px';
                    
                    li.innerHTML = `
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <span class="font-weight-bold">${tramite.nombre_completo || tramite.sustentante}</span>
                                <small class="d-block text-muted">${tramite.nombre}</small>
                                <small class="d-block">No. cuenta: ${tramite.numero_cuenta || 'No disponible'}</small>
                                <small class="d-block">Correo: ${tramite.correo || 'No disponible'}</small>
                                <small class="d-block">Inicio: ${tramite.fecha_inicio}</small>
                                <small class="d-block">Oportunidades: ${tramite.oportunidades_restantes || 'No disponible'}</small>
                            </div>
                            <span class="badge badge-opcion-titulacion">
                                ${tramite.nombre_opcion}
                            </span>
                        </div>
                        <div class="tramite-acciones mt-2 text-center" style="display: none;">
                            <button class="btn btn-success btn-sm mr-2" 
                                    onclick="mostrarConfirmacion(${tramite.id_tramite}, 'aprobar')">
                                <i class="fas fa-check"></i> Aprobar
                            </button>
                            <button class="btn btn-danger btn-sm" 
                                    onclick="mostrarConfirmacion(${tramite.id_tramite}, 'rechazar')">
                                <i class="fas fa-times"></i> Rechazar
                            </button>
                        </div>
                    `;
                    listaTramitesEspera.appendChild(li);
                });    

                // Evento para mostrar acciones al hacer click en un trámite
                document.querySelectorAll('.tramite-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        // Evitar que se activen los botones cuando se hace click en ellos
                        if (e.target.tagName === 'BUTTON') return;
                        
                        // Ocultar todas las acciones primero
                        document.querySelectorAll('.tramite-acciones').forEach(accion => {
                            accion.style.display = 'none';
                        });
                        
                        // Mostrar acciones del item clickeado
                        const acciones = item.querySelector('.tramite-acciones');
                        acciones.style.display = acciones.style.display === 'none' ? 'block' : 'none';
                    });
                });

                document.getElementById("tramitesEspera").style.display = "block";
                document.getElementById("tramitesProgreso").style.display = "none";
            })
            .catch(error => console.error("Error en la solicitud:", error));
    }

    //6 Función para cargar trámites en progreso
    function cargarTramitesProgreso() {
        // Mostrar indicador de carga
        listaTramitesProgreso.innerHTML = `
            <li class="list-group-item text-center">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                Cargando trámites en progreso...
            </li>
        `;
    
        fetch("/api/tramites/progreso/")
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Verificación básica de estructura de datos
                if (!data || typeof data !== 'object') {
                    throw new Error('Respuesta no válida del servidor');
                }
    
                if (!data.success) {
                    console.error("Error en la respuesta:", data.error);
                    mostrarErrorEnLista("Error al obtener trámites: " + (data.error || 'Error desconocido'));
                    return;
                }
    
                if (!Array.isArray(data.tramites)) {
                    throw new Error('Formato de datos inesperado: se esperaba array en data.tramites');
                }
    
                // Limpiar lista
                listaTramitesProgreso.innerHTML = "";
    
                // Procesar cada trámite
                data.tramites.forEach(tramite => {
                    try {
                        // Validar campos mínimos requeridos
                        const tramiteId = tramite.id_tramite ? tramite.id_tramite.toString() : 'nd';
                        const nombreSustentante = tramite.sustentante || 'Sustentante no disponible';
                        const nombreTramite = tramite.nombre || 'Trámite sin nombre';
                        const fechaActualizacion = tramite.fecha_actualizacion || 'Fecha no disponible';
                        const nombreOpcion = tramite.nombre_opcion || 'Opción no especificada';
    
                        const li = document.createElement("li");
                        li.classList.add("list-group-item", "tramite-item");
                        li.setAttribute("data-id", tramiteId);
                        li.setAttribute("data-opcion", tramite.id_opcion || '');
                        li.setAttribute("data-sustentante", tramite.id_sustentante || '');
                        li.style.minHeight = '100px';
                        
                        li.innerHTML = `
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <span class="font-weight-bold">${tramite.nombre_completo || tramite.sustentante}</span>
                                    <small class="d-block text-muted">${tramite.nombre}</small>
                                    <small class="d-block">No. cuenta: ${tramite.numero_cuenta || 'No disponible'}</small>
                                    <small class="d-block">Correo: ${tramite.correo || 'No disponible'}</small>
                                    <small class="d-block">Actualizado: ${tramite.fecha_actualizacion}</small>
                                    <small class="d-block">Oportunidades: ${tramite.oportunidades_restantes || 'No disponible'}</small>

                                </div>
                                <div>
                                    <span class="badge badge-opcion-titulacion">
                                        ${tramite.nombre_opcion}
                                    </span>
                                    <span class="badge badge-success ml-2">
                                        ${tramite.estado_actual || 'En progreso'}
                                    </span>
                                </div>
                            </div>
                            <div class="documentos-container mt-2" style="display: none;">
                                <h6 class="mt-3">Documentos enviados:</h6>
                                <ul class="list-group documentos-list" id="documentos-${tramiteId}">
                                    <li class="list-group-item text-center text-muted">
                                        <i class="fas fa-spinner fa-spin mr-2"></i>
                                        Cargando documentos...
                                    </li>
                                </ul>
                            </div>
`;
                        listaTramitesProgreso.appendChild(li);
    
                    } catch (error) {
                        // Mostrar al menos el ID del trámite con error
                        const errorItem = document.createElement("li");
                        errorItem.classList.add("list-group-item", "text-danger");
                        errorItem.innerHTML = `
                            <i class="fas fa-exclamation-triangle mr-2"></i>
                            Error al cargar trámite ${tramite.id_tramite || 'ID desconocido'}
                        `;
                        listaTramitesProgreso.appendChild(errorItem);
                    }
                });
    
                // Configurar eventos para mostrar documentos
                setupDocumentosEvents();
    
                // Mostrar sección
                document.getElementById("tramitesEspera").style.display = "none";
                document.getElementById("tramitesProgreso").style.display = "block";
    
            })
            .catch(error => {
                mostrarErrorEnLista("Error de conexión: " + error.message);
            });
    }
    
    // Función auxiliar para configurar eventos de documentos
    function setupDocumentosEvents() {
        document.querySelectorAll('.tramite-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                // Evitar que se activen los eventos en elementos hijos (botones, enlaces, etc.)
                if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button, a')) {
                    return;
                }
                
                const tramiteId = item.getAttribute('data-id');
                const sustentanteId = item.getAttribute('data-sustentante');
                const documentosContainer = item.querySelector('.documentos-container');
                
                // Alternar visibilidad
                const mostrarDocumentos = documentosContainer.style.display === 'none';
                documentosContainer.style.display = mostrarDocumentos ? 'block' : 'none';
                
                // Cargar documentos solo si se están mostrando y no están ya cargados
                if (mostrarDocumentos) {
                    const documentosList = item.querySelector('.documentos-list');
                    if (documentosList.children.length === 1 && 
                        documentosList.firstElementChild.textContent.includes('Cargando')) {
                        await cargarDocumentosTramite(tramiteId, sustentanteId, item);
                    }
                }
            });
        });
    }
    
    // Función auxiliar para mostrar errores en la lista
    function mostrarErrorEnLista(mensaje) {
        listaTramitesProgreso.innerHTML = `
            <li class="list-group-item text-center text-danger">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                ${mensaje}
                <button class="btn btn-sm btn-outline-primary ml-3" onclick="cargarTramitesProgreso()">
                    <i class="fas fa-sync-alt mr-1"></i> Reintentar
                </button>
            </li>
        `;
    }

    // Función para cargar documentos de un trámite 
    async function cargarDocumentosTramite(tramiteId, sustentanteId, parentElement) {
        const documentosList = parentElement.querySelector(`#documentos-${tramiteId}`);
        
        try {
            // Mostrar estado de carga
            documentosList.innerHTML = `
                <li class="list-group-item text-center">
                    <i class="fas fa-spinner fa-spin mr-2"></i>
                    Cargando documentos...
                </li>
            `;
    
            const response = await fetch(`/api/tramites/documentos/${tramiteId}/`);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
    
            const data = await response.json();
    
            if (!data.success || !Array.isArray(data.documentos)) {
                throw new Error('Estructura de datos inesperada');
            }
    
            documentosList.innerHTML = "";
    
            if (data.documentos.length === 0) {
                documentosList.innerHTML = `
                    <li class="list-group-item text-center text-muted">
                        No se encontraron documentos asociados
                    </li>
                `;
                return;
            }
    
            // Procesar cada documento
            data.documentos.forEach(doc => {
                try {
                    const docItem = document.createElement("li");
                    
                    // Clases base
                    const clases = [
                        "list-group-item", 
                        "d-flex", 
                        "justify-content-between", 
                        "align-items-center"
                    ];
                    
                    // Añadir clase según estado solo si existe
                    if (doc.estado === 'rechazado') {
                        clases.push("list-group-item-danger");
                    } else if (doc.estado === 'aceptado') {
                        clases.push("list-group-item-success");
                    }
                    
                    // Filtrar clases vacías y unir
                    docItem.className = clases.filter(c => c).join(" ");
                    
                    // Obtener icono seguro
                    const icono = obtenerIconoDocumentoSeguro(doc.tipo);
                    const estadoBadge = obtenerBadgeEstadoSeguro(doc.estado);
                    
                    // Manejar valores posibles nulos
                    const nombreDoc = doc.nombre || 'Documento sin nombre';
                    const fechaSubida = doc.fecha_subida ? `Subido: ${doc.fecha_subida}` : '';
                    const comentarios = doc.comentarios ? `<small class="text-muted d-block">${doc.comentarios}</small>` : '';
                    const archivoUrl = doc.archivo_url || '#';
                    
                    docItem.innerHTML = `
                        <div class="d-flex align-items-center">
                            <div class="mr-3" style="font-size: 1.5rem;">
                                ${icono}
                            </div>
                            <div>
                                <strong>${nombreDoc}</strong>
                                ${comentarios}
                                ${fechaSubida ? `<small class="text-muted d-block">${fechaSubida}</small>` : ''}
                            </div>
                        </div>
                        <div>
                            ${estadoBadge}
                            <a href="${archivoUrl}" target="_blank" 
                               class="btn btn-sm btn-outline-primary ml-2"
                               title="Ver documento">
                                <i class="fas fa-eye"></i>
                            </a>
                            ${doc.estado === 'pendiente' ? `
                            <button class="btn btn-sm btn-outline-success ml-2" 
                                    onclick="validarDocumento(${doc.id || 'null'}, 'aceptado', ${tramiteId})"
                                    title="Aprobar documento">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger ml-1" 
                                    onclick="validarDocumento(${doc.id || 'null'}, 'rechazado', ${tramiteId})"
                                    title="Rechazar documento">
                                <i class="fas fa-times"></i>
                            </button>
                            ` : ''}
                        </div>
                    `;
                    documentosList.appendChild(docItem);
                } catch (error) {
                    const errorItem = document.createElement("li");
                    errorItem.className = "list-group-item text-danger";
                    errorItem.textContent = `Error al cargar documento: ${doc.nombre || 'Documento sin nombre'}`;
                    documentosList.appendChild(errorItem);
                }
            });
    
        } catch (error) {
            documentosList.innerHTML = `
                <li class="list-group-item text-center text-danger">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    Error al cargar documentos: ${error.message}
                    <button class="btn btn-sm btn-outline-primary ml-2" 
                            onclick="cargarDocumentosTramite(${tramiteId}, ${sustentanteId}, this.parentElement.parentElement.parentElement)">
                        <i class="fas fa-sync-alt mr-1"></i> Reintentar
                    </button>
                </li>
            `;
        }
    }
    
    // Función auxiliar segura para obtener icono
    function obtenerIconoDocumentoSeguro(tipo) {
        if (!tipo) return '<i class="fas fa-file"></i>';
        
        const iconos = {
            'identificacion': 'fas fa-id-card',
            'certificado': 'fas fa-certificate',
            'tesis': 'fas fa-file-alt',
            'reporte': 'fas fa-file-signature',
            'carta': 'fas fa-envelope',
            'fotografia': 'fas fa-camera',
            'comprobante': 'fas fa-receipt',
            'application/pdf': 'fas fa-file-pdf'
        };
        
        // Buscar coincidencia exacta o parcial
        const tipoLower = tipo.toLowerCase();
        const clase = iconos[tipoLower] || 
                     iconos[tipoLower.split('/')[0]] || 
                     'fas fa-file';
        
        return `<i class="${clase}"></i>`;
    }
    
    // Función auxiliar segura para obtener badge de estado
    function obtenerBadgeEstadoSeguro(estado) {
        if (!estado) return '<span class="badge badge-secondary">Sin estado</span>';
        
        const clases = {
            'pendiente': 'badge badge-warning',
            'aceptado': 'badge badge-success',
            'rechazado': 'badge badge-danger'
        };
        
        const textos = {
            'pendiente': 'Pendiente',
            'aceptado': 'Aprobado',
            'rechazado': 'Rechazado'
        };
        
        const clase = clases[estado.toLowerCase()] || 'badge badge-secondary';
        const texto = textos[estado.toLowerCase()] || estado;
        
        return `<span class="${clase}">${texto}</span>`;
    }


    function mostrarConfirmacionDocumento(documentoId, tramiteId){
        const modal = document.createElement('div')
        modal.className = 'modal fade'
                            // en el botón de "Cancelar" se optó por utilizar el objeto declarado arriba ModalManager, en vez de data-dismiss de Bootstrap
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class= "modal-content">
                    <div class = "modal-header">
                        <h5 class= "modal-title"> Confirmar aprobación</h5>
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p> ¿Estas seguro que seguro que deseas aprobar este documnto?</p>
                    </div>
                    <div class="modal-footer">
                        <button id="cancelarAccion" class="btn btn-secondary">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="confirmarAprobacion">Confirmar</button>
                    </div>
                </div>
            </div>    
        `
        document.body.appendChild(modal)

        ModalManager.show(modal)
        ModalManager.setupModalEvents(modal)   // cierra correctamente el modal al selecionar "Cancelar"

        document.getElementById('confirmarAprobacion').onclick = async () => {
            try{
                $(modal).modal('hide')
                const botones = document.querySelectorAll(`[onclick*="validarDocumento(${documentoId}, 'aceptado', ${tramiteId})"]`)
                botones.forEach(boton => {
                    boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'
                    boton.disabled = true;
                })
                const response = await fetch(`/api/validar_documento/${documentoId}/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": getCookie("csrftoken")
                    },
                    body: JSON.stringify({ 
                        accion: 'aceptado',
                        comentario: '' 
                    })
                })

                botones.forEach(boton => {
                    boton.innerHTML = '<i class="fas fa-check"></i>'
                    boton.disabled = false
                })

                if (!response.ok){
                    throw new Error('Error al aprobar el documento...')
                }
                
                const data = await response.json()

                if(!data.success){
                    throw new Error(data.error || 'Error al aprobar documento')
                }
                mostrarToast('Docummento aprobado correctamente', 'success')
                
                const tramiteItem = document.querySelector(`.tramite-item[data-id="${tramiteId}"]`)


                if (tramiteItem){
                    const sustentanteId = tramiteItem.getAttribute('data-sustentante');
                    const documentosContainer = tramiteItem.querySelector('.documentos-container');
                    if (documentosContainer && documentosContainer.style.display === 'block'){
                        await cargarDocumentosTramite(tramiteId, sustentanteId, tramiteItem);
                    }
                }



            } catch (error){
                mostrarToast(`Error: ${error.message}`, 'error')
            } finally {
                ModalManager.hide()
                setTimeout(() => {
                    if (modal.parentNode){
                        modal.parentNode.removeChild(modal)
                    }
                },500)
            }
        }
        modal.querySelector('.close').addEventListener('click', () => {
            ModalManager.hide();
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 500)
        })


        modal.querySelector('#cancelarAprobacion').addEventListener('click', () => {
            ModalManager.hide();
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 500);
        })
}



    // Función para validar documentos
    window.validarDocumento = async function(documentoId, accion, tramiteId) {

        if (accion === 'aceptado'){
            mostrarConfirmacionDocumento(documentoId, tramiteId)
            return
        }

        try {
            let comentario = '';
            
            // Si es rechazo, pedir motivo usando un modal más elegante
            if (accion === 'rechazado') {
                comentario = await new Promise((resolve) => {
                    const modal = document.createElement('div');
                    modal.className = 'modal fade'; //Quitar data-dismiss y usar el objeto ModalManager declarado anteriormente : cómo estaba: <button type="button" class="btn btn-secondary" data-dismiss="modal">
                    modal.innerHTML = `
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">Motivo de rechazo del documento</h5>
                                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <textarea id="motivoRechazo" class="form-control" rows="3" 
                                            placeholder="Ingrese el motivo del rechazo"></textarea>
                                </div>
                                <div class="modal-footer">
                                    <button id="cancelarAccion" class="btn btn-secondary">Cancelar</button> 
                                    <button type="button" class="btn btn-primary" id="confirmarMotivo">Confirmar</button>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(modal);
                    // utilizar el ModalManager  y los eventos que se activan al seleccionar los botones "Cancalar" y "Confirmar"
                    ModalManager.show(modal)  
                    ModalManager.setupModalEvents(modal)
                    
                    document.getElementById('confirmarMotivo').onclick = () => {
                        const motivo = document.getElementById('motivoRechazo').value.trim();
                        ModalManager.hide()
                        setTimeout(() => {
                            if (modal.parentNode) modal.parentNode.removeChild(modal)
                                resolve(motivo)
                        }, 500)
                    };
                    
                    modal.querySelector('.close').onclick = () => {
                        ModalManager.hide()
                        setTimeout(() => {
                            if (modal.parentNode) modal.parentNode.removeChild(modal)
                                resolve(null)
                        }, 500)
                    };
                });
                
                if (comentario === null || !comentario) {
                    if (comentario === '') {
                        alert('Debe ingresar un motivo para el rechazo');
                    }
                    return;
                }
            }

        // Mostrar indicador de carga
        const botones = document.querySelectorAll(`[onclick*="validarDocumento(${documentoId}, ${accion}, ${tramiteId})"]`);
        botones.forEach(boton => {
            boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            boton.disabled = true;
        });

        // Realizar la petición
        const response = await fetch(`/api/validar_documento/${documentoId}/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: JSON.stringify({ 
                accion: accion,
                comentario: comentario 
            })
        });

        // Restaurar botones
        botones.forEach(boton => {
            boton.innerHTML = accion === 'aceptado' ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>';
            boton.disabled = false;
        });

        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('La respuesta no es JSON');
        }

        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Error al validar documento');
        }

        
        //mostrarToast(`Documento ${accion === 'aceptado' ? 'aprobado' : 'rechazado'} correctamente`, 'success');
        
        
        /*const tramiteItem = document.querySelector(`[data-id="${tramiteId}"]`);
        if (tramiteItem) {
            const sustentanteId = tramiteItem.getAttribute('data-sustentante');
            await cargarDocumentosTramite(tramiteId, sustentanteId, tramiteItem);
        }*/
       
        // Mostrar notificación de éxito
        // Recargar documentos del trámite
        mostrarToast(`Documento ${accion === 'aceptado' ? 'aprobado' : 'rechazado'} correctamente`, 'success')
        const tramiteItem = document.querySelector(`.tramite-item[data-id="${tramiteId}"]`);
        if (tramiteItem){
            const sustentanteId = tramiteItem.getAttribute('data-sustentante');
            const documentosContainer = tramiteItem.querySelector('.documentos-container');
            if (documentosContainer && documentosContainer.style.display === 'block'){
                await cargarDocumentosTramite(tramiteId, sustentanteId, tramiteItem)
            }
        }

    } catch (error) {
        mostrarToast(`Error: ${error.message}`, 'error');
        
        // Restaurar botones en caso de error
        const botones = document.querySelectorAll(`[onclick*="validarDocumento(${documentoId}, ${accion}, ${tramiteId})"]`);
        botones.forEach(boton => {
            boton.innerHTML = accion === 'aceptado' ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>';
            boton.disabled = false;
        });
    }
};

    // Función para mostrar notificaciones toast mejorada
function mostrarToast(mensaje, tipo = 'success', tiempo = 5000) {
    // Configuración de tipos
    const tipos = {
        success: {
            bg: 'bg-success',
            icon: 'fas fa-check-circle'
        },
        error: {
            bg: 'bg-danger',
            icon: 'fas fa-exclamation-circle'
        },
        warning: {
            bg: 'bg-warning',
            icon: 'fas fa-exclamation-triangle'
        },
        info: {
            bg: 'bg-info',
            icon: 'fas fa-info-circle'
        }
    };

    // Seleccionar configuración según tipo (default a success)
    const config = tipos[tipo.toLowerCase()] || tipos.success;

    // Crear contenedor principal de toasts si no existe
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '9999';
        toastContainer.style.maxWidth = '350px';
        toastContainer.style.width = '100%';
        document.body.appendChild(toastContainer);
    }

    // Crear toast individual
    const toastId = `toast-${Date.now()}`;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast show ${config.bg} text-white mb-3`;
    toast.role = 'alert';
    toast.ariaLive = 'assertive';
    toast.ariaAtomic = 'true';
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-icon p-3 d-flex align-items-center">
                <i class="${config.icon} fa-2x"></i>
            </div>
            <div class="toast-body">
                <strong class="text-capitalize">${tipo}</strong>
                <div>${mensaje}</div>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                    onclick="document.getElementById('${toastId}').remove()">
            </button>
        </div>
    `;

    // Agregar al contenedor
    toastContainer.insertBefore(toast, toastContainer.firstChild);

    // Auto-eliminación después del tiempo especificado
    let timeoutId = setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, tiempo);

    // Pausar desvanecimiento al hacer hover
    toast.addEventListener('mouseenter', () => {
        clearTimeout(timeoutId);
    });

    // Reanudar desvanecimiento al salir
    toast.addEventListener('mouseleave', () => {
        timeoutId = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 1000);
    });
}


    // 7) Event listeners para botones principales
    btnAspirantes.addEventListener("click", () => {
        showSection(aspirantesSection);
        cargarListaSustentantes();
    });

    btnMensajes.addEventListener("click", () => {
        showSection(mensajeSection);
    });

    btnTramites.addEventListener("click", () => {
        showSection(tramitesSection);
    });

    // 8) Event listeners para botones de trámites
    btnMostrarEspera.addEventListener("click", cargarTramitesEspera);
    btnMostrarProgreso.addEventListener("click", cargarTramitesProgreso);
    
    // 9) Al hacer click en un aspirante
    aspirantesList.addEventListener("click", (e) => {
        if (e.target && e.target.matches(".list-group-item")) {
            currentAspiranteId = e.target.getAttribute("data-id");
            const nombreAspirante = e.target.textContent.trim();

            showSection(mensajeSection);
            nombreAspiranteSpan.textContent = nombreAspirante;
            cargarConversacion(currentAspiranteId);
        }
    });

    // 10) Función para cargar la conversación
    function cargarConversacion(sustentanteId) {
    
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

    // 11) Botón Regresar
    btnRegresarAspirantes.addEventListener("click", () => {
        showSection(aspirantesSection);
        conversacionDiv.innerHTML = "";
        currentAspiranteId = null;
    });

    // 12) Botón Enviar mensaje
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

    // 13) Función enviarMensajeAdmin
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

    
    


function filtrarAspirantes() {
    const searchTerm = searchAspirantes.value.toLowerCase().trim();
    const items = aspirantesList.querySelectorAll("li.list-group-item");
    
    items.forEach(item => {
        // Encontrar el elemento que contiene el número de cuenta
        const cuentaElement = item.querySelector('.text-muted.small');
        let mostrarItem = false;
        
        if (cuentaElement) {
            const textoCuenta = cuentaElement.textContent.toLowerCase();
            // Buscar el patrón "no. cuenta: XXXXXX"
            const match = textoCuenta.match(/no\. cuenta:\s*([^|]+)/);
            
            if (match) {
                const numeroCuenta = match[1].trim();
                mostrarItem = numeroCuenta.includes(searchTerm);
            }
        }
        
        item.style.display = mostrarItem ? "flex" : "none";
        
        if (searchTerm && !mostrarItem) {
            item.classList.add('d-none');
        } else {
            item.classList.remove('d-none');
        }
    });

}


    
    // Función para filtrar trámites
    function filtrarTramites() {
        const searchTerm = searchTramites.value.toLowerCase();
        const items = [...document.querySelectorAll("#listaTramitesEspera li.tramite-item, #listaTramitesProgreso li.tramite-item")];
        
        items.forEach(item => {
            const cuentaText = item.textContent.toLowerCase();
            if (cuentaText.includes(searchTerm)) {
                item.style.display = "flex";
            } else {
                item.style.display = "none";
            }
        });
    }
    
    // Event listeners para los campos de búsqueda
    if (searchAspirantes) {
        searchAspirantes.addEventListener("input", filtrarAspirantes);
    }
    
    if (searchTramites) {
        searchTramites.addEventListener("input", filtrarTramites);
    }
<<<<<<< HEAD
});
=======

    

});


// Variable global para almacenar el ID del sustentante
let sustentanteSeleccionado = null;

function editarOportunidades(idSustentante, nombreSustentante, oportunidades) {
    sustentanteSeleccionado = idSustentante;
    oportunidadesActuales = oportunidades;
  
    document.getElementById('nombreSustentante').textContent = nombreSustentante;
    document.getElementById('oportunidadesActuales').textContent = oportunidades;
  
    ModalManager.show(document.getElementById('modalEditarOportunidades'));
}

function actualizarOportunidades() {
    // Verificar que tenemos un ID válido
    if (!sustentanteSeleccionado) {
        console.error('Error: No se ha seleccionado un sustentante');
        alert('Por favor, seleccione un sustentante primero');
        return;
    }

    // Obtener el valor actualizado del input/mostrador
    const nuevasOportunidades = parseInt(document.getElementById('oportunidadesActuales').textContent);
    
    const csrftoken = getCookie('csrftoken');

    fetch(`/api/sustentante/${sustentanteSeleccionado}/actualizar_oportunidades/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrftoken,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            oportunidades_restantes: nuevasOportunidades,
            accion: 'actualizar'
        })
    })
    .then(async response => {
        console.log('Status:', response.status);
        
        // Verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(text || 'Respuesta no válida del servidor');
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error ${response.status}`);
        }

        return response.json();
    })
    .then(data => {
        if (data.success) {
            console.log('Actualización exitosa', data);
            alert('Oportunidades actualizadas correctamente');
            ModalManager.hide(document.getElementById('modalEditarOportunidades'));
            
            // Actualizar la vista si es necesario
            const oportunidadesElement = document.querySelector(`[data-id="${sustentanteSeleccionado}"] #oportunidades-${sustentanteSeleccionado}`);
            if (oportunidadesElement) {
                oportunidadesElement.textContent = data.oportunidades_restantes;
            }
        } else {
            throw new Error(data.error || 'Hubo un problema al actualizar');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert(error.message);
    });
}
>>>>>>> 8fdc37aa921740df5a4951ca82b210fd4a2fd159
