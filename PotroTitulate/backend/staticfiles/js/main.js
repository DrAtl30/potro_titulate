document.addEventListener('DOMContentLoaded', function () {
    const sustentante = JSON.parse(sessionStorage.getItem('sustentante'));

    const loginButton = document.getElementById('btn-login');
    const registerButton = document.getElementById('btn-register');
    const perfilContainer = document.getElementById('perfil-container');
    const perfilNombre = document.getElementById('perfil-nombre');
    const perfilMenu = document.getElementById('perfil-menu');
    const logoutButton = document.getElementById('btn-logout');

    if (sustentante) {
        loginButton.style.display = 'none';
        registerButton.style.display = 'none';
        perfilContainer.style.display = 'inline-block';
        perfilNombre.textContent = sustentante.nombre;
    } else {
        loginButton.style.display = 'inline-block';
        registerButton.style.display = 'inline-block';
        perfilContainer.style.display = 'none';
    }

    // Mostrar / ocultar el menú al hacer clic en "Perfil"
    perfilNombre.addEventListener('click', function () {
        perfilContainer.classList.toggle('active');
    });

    // Cerrar sesión
    logoutButton.addEventListener('click', function () {
        sessionStorage.removeItem('sustentante');
        window.location.reload();
    });

    // Cerrar el menú si se hace clic fuera
    document.addEventListener('click', function (event) {
        if (!perfilContainer.contains(event.target)) {
            perfilContainer.classList.remove('active');
        }
    });
});
