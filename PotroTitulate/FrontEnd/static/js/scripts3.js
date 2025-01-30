document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("admin-login-form").addEventListener("submit", function(event) {
        event.preventDefault();

        let formData = {
            correo_electronico: document.getElementById("correo").value,
            contrasena: document.getElementById("contrasena").value
        };

        fetch("/api/login/administrador/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")  // Para protección CSRF
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.id_administrador) {
                alert("Inicio de sesión exitoso");
                window.location.href = "/admin/dashboard/";  // Redirigir tras éxito
            } else {
                document.getElementById("mensaje").innerText = "Credenciales incorrectas";
            }
        })
        .catch(error => console.error("Error:", error));
    });

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== "") {
            let cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                let cookie = cookies[i].trim();
                if (cookie.startsWith(name + "=")) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
