function cerrarSesion() {
    // Crear un formulario oculto para enviar la solicitud de cierre de sesión con CSRF
    var form = document.createElement('form');
    form.method = 'POST';
    form.action = '/logout/';

    // Obtener el token CSRF del formulario actual
    var csrfTokenElement = document.querySelector('input[name="csrfmiddlewaretoken"]');
    if (csrfTokenElement) {
        var csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrfmiddlewaretoken';
        csrfInput.value = csrfTokenElement.value;
        form.appendChild(csrfInput);
    }

    // Limpiar el sessionStorage y localStorage para asegurar que la sesión realmente se cierre
    sessionStorage.clear();
    localStorage.clear();

    // Añadir el formulario al body y enviarlo
    document.body.appendChild(form);
    form.submit();

    // Redirigir al usuario a la página principal después de un breve retraso
    setTimeout(() => {
        window.location.href = '/index/';
    }, 500);
}