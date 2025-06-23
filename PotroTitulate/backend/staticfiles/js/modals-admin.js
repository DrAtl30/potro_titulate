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
            const escapeKeys = ['Escape', 'Esc'];
            const escapeKeyCodes = [27];
            const escapeKeyCodesDeprecated = [1, '1']; // Algunos teclados pueden enviar un código de tecla de escape diferente
        
            if (escapeKeys.includes(event.key) || escapeKeyCodes.includes(event.keyCode) || escapeKeyCodesDeprecated.includes(event.keyCode)) {
                modal.style.display = 'none';
                resolve();
            }
        };
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
