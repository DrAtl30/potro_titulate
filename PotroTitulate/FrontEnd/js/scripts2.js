let progress = 0; // Valor inicial de la barra
const progressBar = document.querySelector('.progress-bar');
const advanceButton = document.getElementById('advanceProgress');
const totalSteps = 10; // Número total de pasos

function updateProgressStep() {
    if (progress < totalSteps) {
        progress += 1; // Avance de 1 paso
        const progressPercentage = (progress / totalSteps) * 100; // Calcula el porcentaje

        progressBar.style.width = `${progressPercentage}%`; // Actualiza el ancho de la barra
        progressBar.setAttribute('aria-valuenow', progressPercentage); // Actualiza el valor de 'aria-valuenow'
        progressBar.textContent = `Paso ${progress} de ${totalSteps}`; // Muestra el paso actual, por ejemplo, "Paso 1 de 10"
    }
}

// Avanzar la barra cuando se presiona el botón
advanceButton.addEventListener('click', updateProgressStep);







