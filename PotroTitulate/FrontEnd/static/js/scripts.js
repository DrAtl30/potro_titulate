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
                    alert('Registro exitoso');
                    window.location.href = '/iniciosesion/';
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error en el registro: ' + (error.detail || 'Revisa los campos.'));
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
                alert('Login exitoso');
                window.location.href = '/perfilUsuario/'; // Redirigir a la página principal o dashboard
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error en el inicio de sesión: ' + (error.detail || 'Credenciales incorrectas.'));
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Seleccionar el formulario de recuperación
    const csrfTokenRecuperar = document.querySelector('[name=csrfmiddlewaretoken]');
    const recuperarForm = document.querySelector('.recuperar-form');

    if (recuperarForm) {
        recuperarForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Evita el comportamiento predeterminado del formulario
            console.log('Formulario de recuperación enviado');

            // Obtener el correo ingresado
            const correo = document.getElementById('correoInstitucional').value;

            // Validar que el correo tenga un formato válido
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo)) {
                alert('Por favor, ingresa un correo electrónico válido.');
                return;
            }

            // Datos a enviar al servidor
            const data = { correo_electronico: correo };

            // Realizar la solicitud POST
            fetch('/api/recuperarContra/', { // Cambia esta URL según tu backend
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfTokenRecuperar ? csrfTokenRecuperar.value : ''
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
                alert('Si el correo ingresado está registrado, recibirás un mensaje con instrucciones para restablecer tu contraseña.');
                console.log('Respuesta del servidor:', data);
                recuperarForm.reset(); // Opcional: limpia el formulario tras enviarlo
            })
            .catch(error => {
                console.error('Error en la recuperación de contraseña:', error);
                alert('Hubo un problema al procesar tu solicitud. Inténtalo de nuevo más tarde.');
            });
        });
    }
});
