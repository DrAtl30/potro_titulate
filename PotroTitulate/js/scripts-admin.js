document.addEventListener('DOMContentLoaded', function() {
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

    btnAspirantes.addEventListener('click', function() {
        aspirantesSection.style.display = aspirantesSection.style.display === 'none' || aspirantesSection.style.display === '' ? 'block' : 'none';
        tablaAspirante.style.display = 'none';
        mensajeSection.style.display = 'none';
    });

    btnMensajes.addEventListener('click', function() {
        aspirantesSection.style.display = 'block';
        tablaAspirante.style.display = 'none';
        mensajeSection.style.display = 'none';
    });

    aspirantesList.addEventListener('click', function(event) {
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

    btnRegresar.addEventListener('click', function() {
        tablaAspirante.style.display = 'none';
        aspirantesSection.style.display = 'block';
    });

    btnRegresarAspirantes.addEventListener('click', function() {
        mensajeSection.style.display = 'none';
        aspirantesSection.style.display = 'block';
    });

    btnRevisarRequisitos.addEventListener('click', function() {
        listaRequisitos.style.display = listaRequisitos.style.display === 'none' ? 'block' : 'none';
    });

    btnAspirantes.addEventListener('click', function() {
        btnAspirantes.classList.add('active');
        btnMensajes.classList.remove('active');
    });

    btnMensajes.addEventListener('click', function() {
        btnMensajes.classList.add('active');
        btnAspirantes.classList.remove('active');
    });
});
