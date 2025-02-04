let progress = 0;
const progressBar = document.querySelector('.progress-bar');
let totalSteps = 0;

function showRequirements(option) {
    const requisitosContainer = document.getElementById('requisitosContainer');
    requisitosContainer.innerHTML = '';

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
                <span class="estado espera" id="estado-${requisito}-espera"></span>
                <span class="estado revision" id="estado-${requisito}-revision" style="opacity: 0.3;"></span>
                <span class="estado aprobado" id="estado-${requisito}-aprobado" style="opacity: 0.3;"></span>
            </div>
        `;
        ul.appendChild(li);
    });

    requisitosContainer.appendChild(ul);
    updateProgressBar();
}

function updateProgressBar() {
    const progressPercentage = (progress / totalSteps) * 100;
    progressBar.style.width = `${progressPercentage}%`;
    progressBar.setAttribute('aria-valuenow', progressPercentage);
    progressBar.textContent = `Paso ${progress} de ${totalSteps}`;
}

function updateProgressStep() {
    if (progress < totalSteps) {
        progress += 1;
        updateProgressBar();
    }
}

function uploadFile(requisito) {
    const fileInput = document.getElementById(`file-${requisito}`);
    fileInput.click();
}

function handleFileChange(requisito) {
    const fileInput = document.getElementById(`file-${requisito}`);
    const file = fileInput.files[0];
    if (file) {
        alert(`Archivo seleccionado para ${requisito}: ${file.name}`);
        updateEstado(requisito, 'aprobado');
    }
}

function updateEstado(requisito, nuevoEstado) {
    document.getElementById(`estado-${requisito}-espera`).style.opacity = '0.3';
    document.getElementById(`estado-${requisito}-revision`).style.opacity = '0.3';
    document.getElementById(`estado-${requisito}-aprobado`).style.opacity = '0.3';

    document.getElementById(`estado-${requisito}-${nuevoEstado}`).style.opacity = '1';

    if (nuevoEstado === 'aprobado') {
        updateProgressStep();
    }
}
function cerrarSesion() {
    window.location.href ='/index/'; 
}