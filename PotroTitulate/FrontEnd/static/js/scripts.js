


document.addEventListener('DOMContentLoaded', function() {
    var carouselElement = document.getElementById('carouselEjemplo');
    if (carouselElement) {
        var carousel = new bootstrap.Carousel(carouselElement, {
            interval: 2000,
            ride: 'carousel'
        });
    }
});



//Script para Registro
const csrfTokenRegistro = document.querySelector('[name=csrfmiddlewaretoken]').value;
document.getElementById('registro-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const apellidos = document.getElementById('apellidos').value;
    const numCuenta = document.getElementById('numCuenta').value;
    const licenciatura = document.getElementById('licenciatura').value;
    const correo = document.getElementById('correo').value;
    const contrasena = document.getElementById('contrasena').value;
    const confirmarContrasena = document.getElementById('confirmarContrasena').value;

    console.log('Formulario enviado');
    console.log({ nombre, apellidos, numCuenta, licenciatura, correo, contrasena, confirmarContrasena });

    if (contrasena !== confirmarContrasena) {
        alert('Las contraseñas no coinciden');
        return;
    }

    if (contrasena.length < 8) {
        alert('La contraseña debe tener al menos 8 caracteres');
        return;
    }
    

    const data = {
        nombre,
        apellidos,
        numero_cuenta: numCuenta,
        correo_electronico: correo,
        contrasena,
        licenciatura: licenciatura
    };

    console.log('Datos a enviar:', data);

    fetch('/api/registro/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfTokenRegistro
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



//Script para Login
const csrfTokenLogin = document.querySelector('[name=csrfmiddlewaretoken]').value;
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const correo = document.getElementById('correo').value;
    const contrasena = document.getElementById('contrasena').value;

    const data = { correo_electronico: correo, contrasena };

    fetch('/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 
            'X-CSRFToken': csrfTokenLogin
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
            window.location.href = '/index(2)/'; // Redirigir a la página principal o dashboard
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error en el inicio de sesión: ' + (error.detail || 'Credenciales incorrectas.'));
        });
});


