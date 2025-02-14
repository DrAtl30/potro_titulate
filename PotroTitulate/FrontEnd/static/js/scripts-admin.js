document.addEventListener('DOMContentLoaded', function () {
    const btnAspirantes = document.getElementById('btnAspirantes');
    const btnMensajes = document.getElementById('btnMensajes');
    const aspirantesSection = document.getElementById('aspirantesSection');
    const aspirantesList = document.getElementById('aspirantesList');
    const tablaAspirante = document.getElementById('tablaAspirante');
    const mensajeSection = document.getElementById('mensajeSection');
    const nombreAspirante = document.getElementById('nombreAspirante');
    const btnRegresar = document.getElementById('btnRegresar');
    const btnRegresarAspirantes = document.getElementById('btnRegresarAspirantes');
    const btnRevisarRequisitos = document.getElementById('btnRevisarRequisitos');
    const listaRequisitos = document.getElementById('listaRequisitos');

    btnAspirantes.addEventListener('click', function () {
        aspirantesSection.style.display = aspirantesSection.style.display === 'none' || aspirantesSection.style.display === '' ? 'block' : 'none';
        tablaAspirante.style.display = 'none';
        mensajeSection.style.display = 'none';
    });

    btnMensajes.addEventListener('click', function () {
        aspirantesSection.style.display = 'block';
        tablaAspirante.style.display = 'none';
        mensajeSection.style.display = 'none';
    });

    aspirantesList.addEventListener('click', function (event) {
        if (event.target.tagName === 'LI') {
            if (btnMensajes.classList.contains('active')) {
                nombreAspirante.textContent = event.target.textContent;
                aspirantesSection.style.display = 'none';
                mensajeSection.style.display = 'block';
            } else {
                aspirantesSection.style.display = 'none';
                tablaAspirante.style.display = 'block';

                document.getElementById('opcionTitulacion').textContent = 'Tesis';
                document.getElementById('estadoProgreso').textContent = 'Aprobado';
                document.getElementById('correoInstitucional').textContent = 'correo@alumnouaemex.mx';
                document.getElementById('numeroCuenta').textContent = '17266253';
                document.getElementById('fechaActualizacion').textContent = 'Fecha de última actualización';
            }
        }
    });

    btnRegresar.addEventListener('click', function () {
        tablaAspirante.style.display = 'none';
        aspirantesSection.style.display = 'block';
    });

    btnRegresarAspirantes.addEventListener('click', function () {
        mensajeSection.style.display = 'none';
        aspirantesSection.style.display = 'block';
    });

    btnRevisarRequisitos.addEventListener('click', function () {
        listaRequisitos.style.display = listaRequisitos.style.display === 'none' ? 'block' : 'none';
    });

    btnAspirantes.addEventListener('click', function () {
        btnAspirantes.classList.add('active');
        btnMensajes.classList.remove('active');
    });

    btnMensajes.addEventListener('click', function () {
        btnMensajes.classList.add('active');
        btnAspirantes.classList.remove('active');
    });

    function cambiarEstado(idRequisito, nuevoEstado) {
        const requisito = document.getElementById(idRequisito);

        const semaforos = requisito.querySelectorAll('.semaforo');
        semaforos.forEach(semaforo => semaforo.classList.remove('activo'));

        let estadoActivo;
        switch (nuevoEstado) {
            case 'pendiente':
                estadoActivo = requisito.querySelector('.semaforo.pendiente');
                break;
            case 'aceptado':
                estadoActivo = requisito.querySelector('.semaforo.aceptado');
                break;
            case 'rechazado':
                estadoActivo = requisito.querySelector('.semaforo.rechazado');
                break;
            default:
                estadoActivo = requisito.querySelector('.semaforo.no-entregado'); // Estado por defecto
        }

        if (estadoActivo) {
            estadoActivo.classList.add('activo');
        }

        mostrarModal(`Estado del requisito cambiado a: ${nuevoEstado}`, 'successModal');

        fetch('/actualizarEstadoRequisito/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('input[name="csrfmiddlewaretoken"]').value
            },
            body: JSON.stringify({
                idRequisito: idRequisito,
                nuevoEstado: nuevoEstado
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Estado actualizado correctamente en el backend');
                } else {
                    console.error('Error al actualizar el estado:', data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    function mostrarModal(mensaje, modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`No se encontró el modal con ID ${modalId}`);
            return;
        }

        const modalMessage = modal.querySelector('.modalMessage');
        if (modalMessage) {
            modalMessage.textContent = mensaje;
        } else {
            console.warn(`No se encontró el elemento con clase 'modalMessage' dentro de ${modalId}`);
        }

        modal.style.display = 'flex';

        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = function () {
                modal.style.display = 'none';
            };
        }

        window.onclick = function (event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };

        window.onkeydown = function (event) {
            if (event.key === 'Escape') {
                modal.style.display = 'none';
            }
        };
    }

    document.querySelectorAll('.btn-cambiar-estado').forEach(button => {
        button.addEventListener('click', function () {
            const idRequisito = this.getAttribute('data-requisito');
            const nuevoEstado = this.getAttribute('data-estado');
            cambiarEstado(idRequisito, nuevoEstado);
        });
    });

    document.querySelectorAll('.requisito-item').forEach(requisito => {
        const semaforoNoEntregado = requisito.querySelector('.semaforo.no-entregado');
        if (semaforoNoEntregado) {
            semaforoNoEntregado.classList.add('activo');
        }
    });
});