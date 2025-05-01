document.addEventListener('DOMContentLoaded', () => {
    const botonMensajes = document.getElementById('botonMensajes');
    const zonaMensajes = document.getElementById('zonaMensajes');
    const cerrarMensajes = document.getElementById('cerrarMensajes');
    
    if (botonMensajes && zonaMensajes && cerrarMensajes) {
        botonMensajes.addEventListener('click', cargarMensajes);
        cerrarMensajes.addEventListener('click', () => {
            zonaMensajes.style.display = 'none';
        })
        
        // Cerrar el modal al hacer click afuera de la zonaMnesajes
       document.addEventListener('click', (evento) => {
        if ((!zonaMensajes.contains(evento.target) && (evento.target !== botonMensajes))){
            zonaMensajes.style.display='none'
        }
       })
    }

    function formatearFechaBonita(fechaStr) {
        try {
            // Intenta parsear la fecha con el objeto Date
            const fecha = new Date(fechaStr);
            
            // Si la fecha es inválida
            if (isNaN(fecha.getTime())) throw new Error('Fecha inválida');
            
            // Formatear a DD/MM/YYYY
            const dia = String(fecha.getDate()).padStart(2, '0');
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const anio = fecha.getFullYear();
            
            return `${dia}/${mes}/${anio}`;
        } catch (e) {
            console.error('❌ Error formateando fecha:', fechaStr, e);
            return fechaStr; // Devuelve el original si falla
        }
    }

    
    function cargarMensajes() {
        const sustentanteId = document.getElementById('idSustentante').value

        if (!sustentanteId) {
            console.warn('⚠️ID de sustentante no disponible')
            return;
        }

        zonaMensajes.style.display = 'block';

        fetch(`/obtener_mensajes/${sustentanteId}/`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const listaMensajes = document.getElementById('listaMensajes')
                    const listaResumen = document.getElementById('listaResumenMensajes')
                    
                    // Limpiar listas
                    listaMensajes.innerHTML = ''
                    listaResumen.innerHTML = ''
                    
                    // Agrupar mensajes por fecha (o lógica que necesites)
                    const mensajesPorFecha = {};
                    data.mensajes.forEach(mensaje => {
                        const fecha = mensaje.fecha_envio.split('T')[0];
                        
                        if (!mensajesPorFecha[fecha]) {
                            mensajesPorFecha[fecha] = [];
                        }
                        mensajesPorFecha[fecha].push(mensaje)
                    });
                    
                    // Llenar barra lateral
                    Object.entries(mensajesPorFecha).forEach(([fecha, mensajes]) => {
                        const liResumen = document.createElement('li')
                        liResumen.className = 'item-resumen-mensaje'
                        liResumen.innerHTML = `
                            <span class="titulo-resumen">${formatearFechaBonita(fecha)}</span>
                            <span class="fecha-resumen">${mensajes.length} mensaje${mensajes.length !== 1 ? 's' : ''}</span>
                        `
                        
                        liResumen.addEventListener('click', () => {
                            // Remover clase activa de todos
                            document.querySelectorAll('.item-resumen-mensaje').forEach(el => {
                                el.classList.remove('activo')
                            });
                            // Añadir clase activa al seleccionado
                            liResumen.classList.add('activo')
                            
                            // Mostrar mensajes de esta fecha
                            mostrarMensajesFecha(mensajes)
                        });
                        
                        listaResumen.appendChild(liResumen)
                    });
                    
                    // Mostrar todos los mensajes inicialmente
                    if (data.mensajes.length > 0) {
                        mostrarMensajesFecha(data.mensajes)
                        // Activar primer elemento de la barra lateral
                        const primerItem = listaResumen.firstElementChild
                        if (primerItem) {
                            primerItem.classList.add('activo')
                        }
                    }
                } else {
                    console.error('❌ Error al cargar mensajes:', data.error)
                }
            })
            .catch(error => console.error('❌ Error:', error))
    }
    
    function mostrarMensajesFecha(mensajes) {
        const listaMensajes = document.getElementById('listaMensajes')
        listaMensajes.innerHTML = ''
        
        mensajes.forEach(mensaje => {

            const li = document.createElement('li')
            li.className = 'item-mensaje'
            li.innerHTML = `
                <div class="encabezado-item-mensaje">
                    <span class="remitente-mensaje ${mensaje.es_de_administrador ? '' : 'usuario'}">
                        ${mensaje.es_de_administrador ? 'Administrativo' : 'Sustentante'}:
                    </span> 
                </div>
                <div class="texto-mensaje">${mensaje.mensaje}</div>
            `
            listaMensajes.appendChild(li)
        });
        
        // Scroll al inicio de los mensajes
        listaMensajes.firstElementChild?.scrollIntoView({ behavior: 'smooth' })
    }

})



