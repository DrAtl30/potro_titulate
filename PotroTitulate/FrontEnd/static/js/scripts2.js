document.addEventListener("DOMContentLoaded", function() {    // Obtener la opción de titulación desde el HTML
    const opcionTitulacion = document.getElementById("opcionTitulacionData").dataset.opcion;

    const requisitos = {
        'Trabajo escrito': [
            'Formato 8.1 con sus firmas',
            'Aviso Firmado de Privacidad de la UAEM',
            'Certificado de 100% de plan de estudios',
            'Certificado de Servicio Social',
            'Certificado de Prácticas Profesionales',
            'Acta de nacimiento',
            'Formato 8.3',
            'Formato 8.5',
            'Nuevo: Reporte de porcentaje de similitud',
            'Formato 8.11',
            'Certificado de Bachillerato',
            'Constancia de no adeudo a biblioteca',
            'Constancia de no adeudo a Dirección de Control Escolar',
            'Constancia de no adeudo a la UAEM-Contraloría',
            'Comprobante/Baucher de Expedición de Titulo',
            'Comprobante-Baucher pago a derecho a Evaluación Profesional',
            'Formato de Llenado de Datos Personales',
            'Formato 8.9',
            'Evaluación Profesional: Formato 8.2',
            'Evaluación Profesional: Formato 8.4',
            'Evaluación Profesional: Formato 8.6',
            'Evaluación Profesional: Formato 8.8'
        ],
        'Artículo Especializado para la Publicación en una Revista Indexada': [
            'Formato 8.1 con sus firmas',
            'Aviso Firmado de Privacidad de la UAEM',
            'Certificado de 100% de plan de estudios',
            'Certificado de Servicio Social',
            'Certificado de Prácticas Profesionales',
            'Acta de nacimiento',
            'Artículo aceptado para publicación',
            'Carta de aceptación de la revista indexada',
            'Certificado de Bachillerato',
            'Constancia de no adeudo a biblioteca',
            'Constancia de no adeudo a Dirección de Control Escolar',
            'Constancia de no adeudo a la UAEM-Contraloría',
            'Comprobante/Baucher de Expedición de Titulo',
            'Comprobante-Baucher pago a derecho a Evaluación Profesional',
            'Formato de Llenado de Datos Personales',
            'Formato 8.9'
        ],
        'Ensayo': [
            'Formato 8.1 con sus firmas',
            'Aviso Firmado de Privacidad de la UAEM',
            'Certificado de 100% de plan de estudios',
            'Certificado de Servicio Social',
            'Certificado de Prácticas Profesionales',
            'Acta de nacimiento',
            'Ensayo aprobado por el comité',
            'Certificado de Bachillerato',
            'Constancia de no adeudo a biblioteca',
            'Constancia de no adeudo a Dirección de Control Escolar',
            'Constancia de no adeudo a la UAEM-Contraloría',
            'Comprobante/Baucher de Expedición de Titulo',
            'Comprobante-Baucher pago a derecho a Evaluación Profesional',
            'Formato de Llenado de Datos Personales',
            'Formato 8.9'
        ],
        'Memoria de Experiencia Laboral': [
            'Formato 8.1 con sus firmas',
            'Aviso Firmado de Privacidad de la UAEM',
            'Certificado de 100% de plan de estudios',
            'Certificado de Servicio Social',
            'Certificado de Prácticas Profesionales',
            'Acta de nacimiento',
            'Memoria de experiencia laboral aprobada',
            'Certificado de Bachillerato',
            'Constancia de no adeudo a biblioteca',
            'Constancia de no adeudo a Dirección de Control Escolar',
            'Constancia de no adeudo a la UAEM-Contraloría',
            'Comprobante/Baucher de Expedición de Titulo',
            'Comprobante-Baucher pago a derecho a Evaluación Profesional',
            'Formato de Llenado de Datos Personales',
            'Formato 8.9'
        ],
        'Reporte de Aplicación de Conocimientos': [
            'Formato 8.1 con sus firmas',
            'Aviso Firmado de Privacidad de la UAEM',
            'Certificado de 100% de plan de estudios',
            'Certificado de Servicio Social',
            'Certificado de Prácticas Profesionales',
            'Acta de nacimiento',
            'Reporte de aplicación de conocimientos aprobado',
            'Certificado de Bachillerato',
            'Constancia de no adeudo a biblioteca',
            'Constancia de no adeudo a Dirección de Control Escolar',
            'Constancia de no adeudo a la UAEM-Contraloría',
            'Comprobante/Baucher de Expedición de Titulo',
            'Comprobante-Baucher pago a derecho a Evaluación Profesional',
            'Formato de Llenado de Datos Personales',
            'Formato 8.9'
        ],
        'Reporte de Autoempleo Profesional': [
            'Formato 8.1 con sus firmas',
            'Aviso Firmado de Privacidad de la UAEM',
            'Certificado de 100% de plan de estudios',
            'Certificado de Servicio Social',
            'Certificado de Prácticas Profesionales',
            'Acta de nacimiento',
            'Reporte de autoempleo profesional aprobado',
            'Certificado de Bachillerato',
            'Constancia de no adeudo a biblioteca',
            'Constancia de no adeudo a Dirección de Control Escolar',
            'Constancia de no adeudo a la UAEM-Contraloría',
            'Comprobante/Baucher de Expedición de Titulo',
            'Comprobante-Baucher pago a derecho a Evaluación Profesional',
            'Formato de Llenado de Datos Personales',
            'Formato 8.9'
        ],
        'Reporte de Residencia de Investigación': [
            'Formato 8.1 con sus firmas',
            'Aviso Firmado de Privacidad de la UAEM',
            'Certificado de 100% de plan de estudios',
            'Certificado de Servicio Social',
            'Certificado de Prácticas Profesionales',
            'Acta de nacimiento',
            'Reporte de residencia de investigación aprobado',
            'Certificado de Bachillerato',
            'Constancia de no adeudo a biblioteca',
            'Constancia de no adeudo a Dirección de Control Escolar',
            'Constancia de no adeudo a la UAEM-Contraloría',
            'Comprobante/Baucher de Expedición de Titulo',
            'Comprobante-Baucher pago a derecho a Evaluación Profesional',
            'Formato de Llenado de Datos Personales',
            'Formato 8.9'
        ],
        'Tesina': [
            'Formato 8.1 con sus firmas',
            'Aviso Firmado de Privacidad de la UAEM',
            'Certificado de 100% de plan de estudios',
            'Certificado de Servicio Social',
            'Certificado de Prácticas Profesionales',
            'Acta de nacimiento',
            'Tesina aprobada',
            'Certificado de Bachillerato',
            'Constancia de no adeudo a biblioteca',
            'Constancia de no adeudo a Dirección de Control Escolar',
            'Constancia de no adeudo a la UAEM-Contraloría',
            'Comprobante/Baucher de Expedición de Titulo',
            'Comprobante-Baucher pago a derecho a Evaluación Profesional',
            'Formato de Llenado de Datos Personales',
            'Formato 8.9'
        ],
        'Tesis': [
            'Formato 8.1 con sus firmas',
            'Aviso Firmado de Privacidad de la UAEM',
            'Certificado de 100% de plan de estudios',
            'Certificado de Servicio Social',
            'Certificado de Prácticas Profesionales',
            'Acta de nacimiento',
            'Tesis aprobada',
            'Certificado de Bachillerato',
            'Constancia de no adeudo a biblioteca',
            'Constancia de no adeudo a Dirección de Control Escolar',
            'Constancia de no adeudo a la UAEM-Contraloría',
            'Comprobante/Baucher de Expedición de Titulo',
            'Comprobante-Baucher pago a derecho a Evaluación Profesional',
            'Formato de Llenado de Datos Personales',
            'Formato 8.9'
        ],
        'Aprovechamiento académico': [
            'Formato 8.1 con sus firmas',
            'Certificado de 100% de plan de estudios',
            'Certificado de Servicio Social',
            'Certificado de Prácticas Profesionales',
            'Acta de nacimiento',
            'Aviso Firmado de Privacidad de la UAEM',
            '*Oficio de solicitud',
            'Constancia de no haber cometido Falta a la Comunidad Universitaria',
            'Historial Académico/Trayectoria Académica',
            'Certificado de Bachillerato',
            'Constancia de no adeudo a biblioteca',
            'Constancia de no adeudo a Dirección de Control Escolar',
            'Constancia de no adeudo a la UAEM-Contraloría',
            'Comprobante de Expedición de Titulo',
            'Comprobante-Baucher pago a derecho a Evaluación Profesional',
            'Formato de Llenado de Datos Personales',
            'Formato 8.9'
        ],
        'Creditos en estudios avanzados': [
            'Formato 8.1 con sus firmas',
            'Certificado de 100% de plan de estudios',
            'Certificado de Servicio Social',
            'Certificado de Prácticas Profesionales',
            'Acta de nacimiento',
            'Certificado de Bachillerato',
            'Constancia de no adeudo a biblioteca',
            'Constancia de no adeudo a Dirección de Control Escolar',
            'Constancia de no adeudo a la UAEM-Contraloría',
            'Comprobante de Expedición de Titulo',
            'Comprobante-Baucher pago a derecho a Evaluación Profesional',
            'Aviso Firmado de Privacidad de la UAEM',
            'Formato de Llenado de Datos Personales',
            'Formato 8.9',
            '*Oficio de solicitud',
            'Certificado de Diplomado Superior'
        ],
        'Examen General para el egreso de la Licenciatura EGEL': [
            'Formato 8.1 con sus firmas',
            'Certificado de 100% de plan de estudios',
            'Certificado de Servicio Social',
            'Certificado de Prácticas Profesionales',
            'Acta de nacimiento',
            'Aviso firmado de privacidad de la UAEM',
            'Oficio de solicitud',
            'Certificado de bachillerato',
            'Constancia de no adeudo a biblioteca',
            'Constancia de no adeudo a Dirección de Control Escolar',
            'Constancia de no adeudo a la UAEM-Contraloría',
            'Comprobante de Expedición de Titulo',
            'Comprobante-Baucher pago a derecho a Evaluación Profesional',
            'Formato de Llenado de Datos Personales',
            'Formato 8.9',
            'Testimonio que les manda SENEVAL a su correo'
        ]
    };

    function showRequirements(option) {
        if (option !== opcionTitulacion) {
            mostrarModal(`Solo puedes subir documentos para la opción de titulación: ${opcionTitulacion}`, 'errorModal');
            return;
        }
    
        const requisitosContainer = document.getElementById('requisitosContainer');
        requisitosContainer.innerHTML = '';
    
        if (!requisitos[option]) {
            mostrarModal('No hay requisitos definidos para esta opción de titulación.', 'errorModal');
            return;
        }
    
        const ul = document.createElement('ul');
        totalSteps = requisitos[option].length;
    
        requisitos[option].forEach(requisito => {
            const li = document.createElement('li');
            li.classList.add('requisito-item');
            li.innerHTML = `
                <span class="requisito-texto">${requisito}</span>
                <button class="btn btn-link" onclick="uploadFile('${requisito}')">Subir</button>
                <input type="file" id="file-${requisito}" style="display:none;" onchange="handleFileChange('${requisito}')">
                <div class="semaforo">
                    <span class="estado no-entregado" id="estado-${requisito}-no-entregado"></span>
                    <span class="estado pendiente" id="estado-${requisito}-pendiente" style="opacity: 0.3;"></span>
                    <span class="estado aceptado" id="estado-${requisito}-aceptado" style="opacity: 0.3;"></span>
                    <span class="estado rechazado" id="estado-${requisito}-rechazado" style="opacity: 0.3;"></span>
                </div>
            `;
            ul.appendChild(li);
        });
    
        requisitosContainer.appendChild(ul);
    }

    window.showRequirements = showRequirements; // Hacer la función accesible globalmente
});


function uploadFile(requisito) {
    const fileInput = document.getElementById(`file-${requisito}`);
    fileInput.click();
}

function handleFileChange(requisito) {
    const fileInput = document.getElementById(`file-${requisito}`);
    const file = fileInput.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('requisito', requisito);
        formData.append('csrfmiddlewaretoken', document.querySelector('input[name="csrfmiddlewaretoken"]').value);

        fetch('/uploadDocument/', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Respuesta del servidor:', data);
            if (data.success) {
                mostrarModal(`Archivo subido correctamente para ${requisito}`, 'successModal');
                updateEstado(requisito, 'aprobado');
            } else {
                mostrarModal(`Error al subir el archivo: ${data.error}`, 'errorModal');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al subir el archivo');
        });
    }
}

function obtenerIdTramite() {
    var idTramite = document.getElementById('idTramite').value;
    return idTramite;
}


function updateEstado(requisito, nuevoEstado) {
    const estados = ['no-entregado', 'pendiente', 'aceptado', 'rechazado'];
    
    // Reinicia la opacidad de todos los estados
    estados.forEach(estado => {
        const elemento = document.getElementById(`estado-${requisito}-${estado}`);
        if (elemento) {
            elemento.style.opacity = '0.3'; // Opacidad baja para estados no activos
        }
    });

    // Activa el estado correspondiente
    const estadoActivo = document.getElementById(`estado-${requisito}-${nuevoEstado}`);
    if (estadoActivo) {
        estadoActivo.style.opacity = '1'; // Opacidad alta para el estado activo
    }

    // Actualiza el progreso si el estado es "aceptado"
    if (nuevoEstado === 'aceptado') {
        actualizarProgresoBackend();
    }
}

/*function cerrarSesion() {
    window.location.href ='/logout'; 
}*/

function cerrarSesion() {
    // Crea un formulario
    var form = document.createElement('form');
    form.method = 'POST';
    form.action = '/logout/'; 

    // Añade un token CSRF al formulario
    var csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
    var csrfInput = document.createElement('input');
    csrfInput.type = 'hidden';
    csrfInput.name = 'csrfmiddlewaretoken';
    csrfInput.value = csrfToken;
    form.appendChild(csrfInput);

    // Añade el formulario al body y se envia
    document.body.appendChild(form);
    form.submit();
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

function enviarOpcionTitulacion() {
    const opcionId = document.getElementById('opcion_titulacion').value;

    fetch('/seleccionarOpcionTitulacion/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('input[name="csrfmiddlewaretoken"]').value
        },
        body: JSON.stringify({ opcion_id : opcionId})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            location.reload(); // Recargar la página para actualizar la información
        } else {
            mostrarModal(`Error al seleccionar la opción de titulación: ${data.error}`, 'errorModal');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        mostrarModal('Error al enviar la opción de titulación', 'errorModal');
    });
}

function actualizarProgresoBackend() {
    // Aquí se hace una solicitud al backend para actualizar el progreso
    fetch('/actualizarProgreso/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.querySelector('input[name="csrfmiddlewaretoken"]').value
        },
        body: JSON.stringify({
            id_tramite: obtenerIdTramite(), // Asegúrate de obtener correctamente el ID
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Actualiza la barra de progreso con el nuevo valor
            document.querySelector('.progress-bar').style.width = `${data.progreso}%`;
            document.querySelector('.progress-bar').setAttribute('aria-valuenow', data.progreso);
            document.querySelector('.progress-bar').textContent = `${data.progreso}%`;
        } else {
            console.error('Error al actualizar el progreso:', data.error);
        }
    })
    .catch(error => {
        console.error('Error al actualizar el progreso:', error);
    });
}
