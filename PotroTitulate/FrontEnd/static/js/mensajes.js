document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('botonMensajes').addEventListener('click', () => {
        console.log('✅ Botón de mensajes presionado.');

        const sustentanteId = document.getElementById('idSustentante').value;
        console.log('🔎 ID de sustentante obtenido:', sustentanteId);

        if (!sustentanteId) {
            console.warn('⚠️ ID de sustentante no disponible.');
            return;
        }

        // Mostrar el contenedor de mensajes
        const zonaMensajes = document.getElementById('zonaMensajes');
        zonaMensajes.style.display = 'block'; // Hacer visible la zona de mensajes

        fetch(`/obtener_mensajes/${sustentanteId}/`)
            .then(response => response.json())
            .then(data => {
                console.log('📥 Respuesta del servidor:', data);
                if (data.success) {
                    const listaMensajes = document.getElementById('listaMensajes');
                    if (!listaMensajes) {
                        console.error('❌ No se encontró el contenedor de mensajes');
                        return;
                    }
                    listaMensajes.innerHTML = ''; // Limpiar lista previa

                    data.mensajes.forEach(mensaje => {
                        const li = document.createElement('li');
                        li.classList.add('list-group-item');
                        li.innerHTML = `
                            <div>
                                <strong>${mensaje.es_de_administrador ? 'Administrador:' : 'Sustentante:'}</strong>
                                ${mensaje.mensaje}
                            </div>
                            <small>${mensaje.fecha_envio}</small>
                        `;
                        listaMensajes.appendChild(li);
                    });
                } else {
                    console.error('❌ Error en la respuesta:', data.error);
                }
            })
            .catch(error => console.error('❌ Error en la solicitud:', error));
    });

    // Cerrar la ventana de mensajes
    document.getElementById('cerrarMensajes').addEventListener('click', () => {
        const zonaMensajes = document.getElementById('zonaMensajes');
        zonaMensajes.style.display = 'none'; // Ocultar la ventana de mensajes
    });
});
