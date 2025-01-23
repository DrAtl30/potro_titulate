let progress = 0;
const progressBar = document.querySelector('.progress-bar');
let totalSteps = 0;

function showRequirements(option) {
    const requisitosContainer = document.getElementById('requisitosContainer');
    requisitosContainer.innerHTML = '';

    const requisitos = {
        'Opción 1': ['Requisito A', 'Requisito B', 'Requisito C'],
        'Opción 2': ['Requisito D', 'Requisito E'],
        'Creditos en estudios avanzados': [
            { nombre: 'Formato 8.1 con sus firmas', descripcion: '' },
            { nombre: 'Certificado de 100% de plan de estudios', descripcion: '' },
            { nombre: 'Certificado de Servicio Social', descripcion: '' },
            { nombre: 'Certificado de Prácticas Profesionales', descripcion: '' },
            { nombre: 'Acta de nacimiento', descripcion: '' },
            { nombre: 'Certificado de Bachillerato', descripcion: '' },
            { nombre: 'Constancia de no adeudo a biblioteca', descripcion: '' },
            { nombre: 'Constancia de no adeudo a Dirección de Control Escolar', descripcion: '' },
            { nombre: 'Constancia de no adeudo a la UAEM-Contraloría', descripcion: '' },
            { nombre: 'Comprobante de Expedición de Titulo', descripcion: '' },
            { nombre: 'Comprobante-Baucher pago a derecho a Evaluación Profesional', descripcion: '' },
            { nombre: 'Aviso Firmado de Privacidad de la UAEM', descripcion: '' },
            { nombre: 'Formato de Llenado de Datos Personales', descripcion: '' },
            { nombre: 'Formato 8.9', descripcion: '' },
            { nombre: '*Oficio de solicitud', descripcion: '' },
            { nombre: 'Certificado de Diplomado Superior', descripcion: '' }
        ],
        'Examen General para el egreso de la Licenciatura EGEL':[
            { nombre: 'Formato 8.1 con sus firmas', descripcion: '' },
            { nombre: 'Certificado de 100% de plan de estudios', descripcion: '' },
            { nombre: 'Certificado de Servicio Social', descripcion: '' },
            { nombre: 'Certificado de Prácticas Profesionales', descripcion: '' },
            { nombre: 'Acta de nacimiento', descripcion: '' },
            { nombre: 'aviso firmado de privacidad de la UAEM', descripcion: '' },
            { nombre: 'oficio de solicitud', descripcion: '' },
            { nombre: 'Certificado de bachilletaro', descripcion: '' },
            { nombre: 'Constancia de no adeudo a biblioteca', descripcion: '' },
            { nombre: 'Constancia de no adeudo a Dirección de Control Escolar', descripcion: '' },
            { nombre: 'Constancia de no adeudo a la UAEM-Contraloría', descripcion: '' },
            { nombre: 'Comprobante de Expedición de Titulo', descripcion: '' },
            { nombre: 'Comprobante-Baucher pago a derecho a Evaluación Profesional', descripcion: '' },
            { nombre: 'Formato de Llenado de Datos Personales', descripcion: '' },
            { nombre: 'formato 8.9', descripcion: '' },
            { nombre: 'Testimonio que les manda SENEVAL a su correo', descripcion: '' }
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
    window.location.href = 'index(2).html'; 
}
