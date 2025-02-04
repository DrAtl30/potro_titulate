document.addEventListener('DOMContentLoaded', function() {
    // Configuración del carrusel (si existe)
    var carouselElement = document.getElementById('carouselEjemplo');
    if (carouselElement) {
        var carousel = new bootstrap.Carousel(carouselElement, {
            interval: 2000,
            ride: 'carousel'
        });
    }

    // Script para Registro
    const csrfTokenRegistro = document.querySelector('[name=csrfmiddlewaretoken]');
    const registroForm = document.getElementById('registro-form');
    if (registroForm) {
        registroForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const nombre = document.getElementById('nombre').value;
            const apellido = document.getElementById('apellidos').value;
            const numCuenta = document.getElementById('numCuenta').value;
            const licenciatura = document.getElementById('licenciatura').value;
            const correo = document.getElementById('correo').value;
            const contrasena = document.getElementById('contrasena').value;
            const confirmarContrasena = document.getElementById('confirmarContrasena').value;

            console.log('Formulario de registro enviado');
            console.log({ nombre, apellido, numCuenta, licenciatura, correo, contrasena, confirmarContrasena });

            if (contrasena !== confirmarContrasena) {
                alert('Las contraseñas no coinciden');
                return;
            }

            if (contrasena.length < 8) {
                alert('La contraseña debe tener al menos 8 caracteres');
                return;
            }

            const data = {
                nombre: nombre,
                apellido: apellido,
                numero_cuenta: numCuenta,
                correo_electronico: correo,
                contrasena: contrasena,
                licenciatura: licenciatura
            };

            console.log('Datos a enviar:', data);

            fetch('/api/registro/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfTokenRegistro ? csrfTokenRegistro.value : ''
                },
                body: JSON.stringify(data)
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => { throw err; });
                    }
                    return response.json();
                })
                .then(data => {
                    mostrarModal('Registro exitoso', 'successModal');
                    esperarCierreModal('successModal').then(() => {
                        window.location.href = '/iniciosesion/';
                    });
                })
                .catch(error => {
                    console.error('Error:', error);
                    mostrarModal('Hubo un problema al procesar tu solicitud. Revisa los campos e inténtalo de nuevo.', 'errorModal');
                });
        });
    }

    // Script para Login
        const csrfTokenLogin = document.querySelector('[name=csrfmiddlewaretoken]');
        const loginForm = document.getElementById('login-form');
    
        if (loginForm) {
            loginForm.addEventListener('submit', function(event) {
                event.preventDefault();

                console.log('Formulario de login enviado');
    
                const correo = document.getElementById('correo').value;
                const contrasena = document.getElementById('contrasena').value;
    
                const data = { correo_electronico: correo, contrasena: contrasena };
    
                fetch('/api/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfTokenLogin ? csrfTokenLogin.value : ''
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => { throw err; });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Respuesta del servidor:', data);

                    if (data.redirigir_a_cambiar_contrasena && data.id_sustentante) {
                        window.location.href = `/cambiarContrasena/${data.id_sustentante}/`;
                    } else {
                        mostrarModal('Inicio de sesión exitoso', 'successModal');
                        esperarCierreModal('successModal').then(() => {
                            window.location.href = '/perfilUsuario/'; // Redirigir a la página principal o dashboard
                    });
                }
                })
                .catch(error => {
                    console.error('Error:', error);
                    mostrarModal('Correo o contraseña incorrectos', 'errorModal');
                });
            });
        }
    });

    //Script para el Modal de recuperar contrasena
    const recuperarForm = document.querySelector('.recuperarForm');
    if(recuperarForm) {
        recuperarForm.addEventListener('submit', function(event) {
            event.preventDefault();
            var email = document.getElementById('correo_electronico').value;
        
            fetch('/recuperarContrasena/recuperarContra', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ correo_electronico: email }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP Error ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.redirect) {
                    window.location.href = data.redirect;  // Redirige si la respuesta tiene 'redirect'
                } else if (data.error) {
                    mostrarModal(data.error, 'errorModal');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mostrarModal('Hubo un problema al procesar tu solicitud. Inténtalo de nuevo.', 'errorModal');
            });

        });
        
    }

    //Script para el Modal de cambiar contrasena
    const cambiarContrasenaForm = document.querySelector('.cambiarContrasenaForm');
    const csrfTokeCambiarContrasena = document.querySelector('[name=csrfmiddlewaretoken]');
    if (cambiarContrasenaForm) {
        cambiarContrasenaForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Obtener los valores de los campos de contraseña
            var nuevaContrasena = document.getElementById('nueva_contrasena').value;
            var confirmarContrasena = document.getElementById('confirmar_contrasena').value;
            
            // Obtener el id_sustentante desde el formulario o desde algún otro lugar en la página
            var idSustentante = document.getElementById('id_sustentante').value;
    
            // Realizar la solicitud fetch
            fetch(`/cambiarContrasena/${idSustentante}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRFToken': csrfTokeCambiarContrasena ? csrfTokeCambiarContrasena.value : ''
                },
                body: JSON.stringify({ 
                    nueva_contrasena: nuevaContrasena, 
                    confirmar_contrasena: confirmarContrasena 
                }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP Error ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.redirect) {
                    window.location.href = data.redirect;  // Redirige si la respuesta tiene 'redirect'
                } else if (data.error) {
                    mostrarModal(data.error, 'errorModal');
                } else {
                    mostrarModal('Contraseña actualizada correctamente', 'successModal');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mostrarModal('Hubo un problema al procesar tu solicitud. Inténtalo de nuevo.', 'errorModal');
            });
        });
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
            if (event.key === 'Escape') {
                modal.style.display = 'none';
                resolve();
            }
        };
    });
}