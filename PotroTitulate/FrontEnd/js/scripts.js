


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

document.getElementById('registro-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevenir el envío normal del formulario

    const nombre = document.getElementById('nombre').value;
    const numCuenta = document.getElementById('numCuenta').value;
    const licenciatura = document.getElementById('licenciatura').value;
    const correo = document.getElementById('correo').value;
    const contrasena = document.getElementById('contrasena').value;
    const confirmarContrasena = document.getElementById('confirmarContrasena').value;

    // Verificar que las contraseñas coinciden
    if (contrasena !== confirmarContrasena) {
        alert('Las contraseñas no coinciden');
        return;
    }

    // Crear el objeto de datos para enviar
    const data = {
        nombre: nombre,
        numero_cuenta: numCuenta,
        correo_electronico: correo,
        contrasena: contrasena,
        opcion_titulacion: licenciatura
    };

    // Enviar la solicitud POST a la API de Django
    fetch('http://localhost:8000/api/registro/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.mensaje) {
            alert('Registro exitoso');
            // Redirigir a otra página si es necesario
        } else {
            alert('Error: ' + JSON.stringify(data));
        }
    })
    .catch(error => console.error('Error:', error));
});

//Script para Login
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevenir el envío normal del formulario

    const correo = document.getElementById('correo').value;
    const contrasena = document.getElementById('contrasena').value;

    const data = {
        correo_electronico: correo,
        contrasena: contrasena
    };

    // Enviar la solicitud POST a la API de Django
    fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.id_sustentante) {
            alert('Login exitoso');
            // Redirigir a otra página si es necesario
        } else {
            alert('Error: ' + JSON.stringify(data));
        }
    })
    .catch(error => console.error('Error:', error));
});

