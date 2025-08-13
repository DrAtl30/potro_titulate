// FUNCIONES PARA MANEJAR MODALES 
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

        closeBtn.onclick = () => {
            modal.style.display = 'none';
            resolve();
        };

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                resolve();
            }
        };

        window.onkeydown = (event) => {
            const escapeKeys = ['Escape', 'Esc'];
            const escapeKeyCodes = [27];
            const escapeKeyCodesDeprecated = [1, '1'];
        
            if (escapeKeys.includes(event.key) || escapeKeyCodes.includes(event.keyCode) || escapeKeyCodesDeprecated.includes(event.keyCode)) {
                modal.style.display = 'none';
                resolve();
            }
        };
    });
}


function validatePassword(password) {
    // Longitud mínima de 8 caracteres
    const lengthValid = password.length >= 8;
    document.getElementById('length-icon').textContent = lengthValid ? '✓' : '✗';
    document.getElementById('length-icon').className = lengthValid ? 'requirement-icon valid' : 'requirement-icon invalid';
    
    // Al menos una mayúscula
    const uppercaseValid = /[A-Z]/.test(password);
    document.getElementById('uppercase-icon').textContent = uppercaseValid ? '✓' : '✗';
    document.getElementById('uppercase-icon').className = uppercaseValid ? 'requirement-icon valid' : 'requirement-icon invalid';
    
    // Al menos una minúscula
    const lowercaseValid = /[a-z]/.test(password);
    document.getElementById('lowercase-icon').textContent = lowercaseValid ? '✓' : '✗';
    document.getElementById('lowercase-icon').className = lowercaseValid ? 'requirement-icon valid' : 'requirement-icon invalid';
    
    // Al menos un número
    const numberValid = /[0-9]/.test(password);
    document.getElementById('number-icon').textContent = numberValid ? '✓' : '✗';
    document.getElementById('number-icon').className = numberValid ? 'requirement-icon valid' : 'requirement-icon invalid';
    
    // Al menos un carácter especial
    const specialValid = /[!@#$%^&*()]/.test(password);
    document.getElementById('special-icon').textContent = specialValid ? '✓' : '✗';
    document.getElementById('special-icon').className = specialValid ? 'requirement-icon valid' : 'requirement-icon invalid';
}

document.addEventListener('DOMContentLoaded', function() {
    // Configuración del carrusel (si existe) (ORIGINAL)
    var carouselElement = document.getElementById('carouselEjemplo');
    if (carouselElement) {
        var carousel = new bootstrap.Carousel(carouselElement, {
            interval: 2000,
            ride: 'carousel'
        });
    }

    
    const numCuenta = document.getElementById('numCuenta');
    const contrasena = document.getElementById('contrasena');
    const confirmarContrasena = document.getElementById('confirmarContrasena');
    const passwordRequirements = document.getElementById('password-requirements');
    const passwordTooltip = document.getElementById('password-tooltip');
    
    //Manejo de escuelas incorporadas
    const escuelasContainer = document.getElementById('escuelas-container');
    const selectEscuelas = document.getElementById('escuela_seleccionada');
    const escuelaSi = document.getElementById('escuela_si')
    const escuelaNo = document.getElementById('escuela_no')

    fetch('/api/escuelas-incorporadas/')
        .then(response => {
            if (!response.ok){
                throw new Error('Error al cargar escuelas');
            }
            return response.json()
        })
        .then(data => {
            selectEscuelas.innerHTML='';
            const defaultOption  = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Seleciona tu escuela incorparada';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            selectEscuelas.appendChild(defaultOption);

            data.escuelas.forEach(escuela => {
                const option = document.createElement('option');
                option.value = escuela.id;
                option.textContent = escuela.nombre;
                selectEscuelas.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            selectEscuelas.innerHTML='<option value="">Error cargando escuelasss</option>';
        });
        
        escuelaSi.addEventListener('change', function() {
            escuelasContainer.style.display = 'block';
            selectEscuelas.required = true;
        });

        escuelaNo.addEventListener('change', function(){
            escuelasContainer.style.display = 'none';
            selectEscuelas.required = false;
        });



    if (contrasena) {
        contrasena.addEventListener('focus', function() {
            passwordRequirements.style.display = 'block';
        });
        
        contrasena.addEventListener('blur', function() {
            setTimeout(() => {
                if (!passwordRequirements.contains(document.activeElement)) {
                    passwordRequirements.style.display = 'none';
                }
            }, 200);
        });
    }
    
    if (passwordTooltip) {
        passwordTooltip.addEventListener('click', function(e) {
            e.stopPropagation();
            passwordRequirements.style.display = passwordRequirements.style.display === 'block' ? 'none' : 'block';
        });
    }
    
    // Validación del número de cuenta (7 dígitos) 
    if (numCuenta) {
        numCuenta.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length > 7) {
                this.value = this.value.slice(0, 7);
            }
        });
    }
    
   
    if (contrasena) {
        contrasena.addEventListener('input', function() {
            validatePassword(this.value);
        });
    }
    
    // Validación de coincidencia de contraseñas (NUEVO)
    if (confirmarContrasena) {
        confirmarContrasena.addEventListener('input', function() {
            const matchElement = document.getElementById('password-match');
            if (this.value !== contrasena.value) {
                matchElement.style.display = 'block';
            } else {
                matchElement.style.display = 'none';
            }
        });
    }

  
    const csrfTokenRegistro = document.querySelector('[name=csrfmiddlewaretoken]');
    const registroForm = document.getElementById('registro-form');
    if (registroForm) {
        registroForm.addEventListener('submit', function(event) {
            event.preventDefault();

           
            // Validar número de cuenta
            if (numCuenta.value.length !== 7 || !/^\d+$/.test(numCuenta.value)) {
                mostrarModal('El número de cuenta debe tener exactamente 7 dígitos.', 'errorModal');
                return;
            }
            
            // Validar contraseña
            const password = contrasena.value;
            if (password.length < 8) {
                mostrarModal('La contraseña debe tener al menos 8 caracteres.', 'errorModal');
                return;
            }
            
            if (!/[A-Z]/.test(password)) {
                mostrarModal('La contraseña debe contener al menos una letra mayúscula.', 'errorModal');
                return;
            }
            
            if (!/[a-z]/.test(password)) {
                mostrarModal('La contraseña debe contener al menos una letra minúscula.', 'errorModal');
                return;
            }
            
            if (!/[0-9]/.test(password)) {
                mostrarModal('La contraseña debe contener al menos un número.', 'errorModal');
                return;
            }
            
            if (!/[!@#$%^&*()]/.test(password)) {
                mostrarModal('La contraseña debe contener al menos un carácter especial (!@#$%^&*).', 'errorModal');
                return;
            }
            
            // Validar coincidencia de contraseñas
            if (password !== confirmarContrasena.value) {
                mostrarModal('Las contraseñas no coinciden.', 'errorModal');
                return;
            }

            const nombre = document.getElementById('nombre').value;
            const apellido = document.getElementById('apellidos').value;
            const licenciatura = document.getElementById('licenciatura').value;
            const correo = document.getElementById('correo').value;
            const periodo_ingreso = document.getElementById('periodo_ingreso').value;
            const periodo_egreso = document.getElementById('periodo_egreso').value;

            const year_ingreso = extraerAno(periodo_ingreso);
            const year_egreso = extraerAno(periodo_egreso);

            const esEscuelaIncorporada = document.getElementById('escuela_si').checked;
            const escuela = esEscuelaIncorporada
                ? document.getElementById('escuela_seleccionada').options[document.getElementById('escuela_seleccionada').selectedIndex].text
                : 'Universidad Autónoma del Estado de México';

            if ((year_egreso - year_ingreso) < 3) {
                mostrarModal('Debe de haber un mínimo de 3 años entre el ingreso y el egreso',
                    'errorModal'
                );
                return;
            }

            if (periodo_egreso < periodo_egreso) {
                mostrarModal('El periodo de egreso no puede ser anterior al de ingreso',
                    'errorModal');
                    return;
            }
            const data = {
                nombre: nombre,
                apellido: apellido,
                numero_cuenta: numCuenta.value,
                correo_electronico: correo,
                contrasena: password,
                licenciatura: licenciatura,
                periodo_ingreso : periodo_ingreso,
                periodo_egreso : periodo_egreso,
                es_escuela_incorporada: esEscuelaIncorporada,
                escuela_de_procedencia: escuela
            };

            // temporal
            console.log("Datos a enviar:", {
                es_escuela_incorporada: esEscuelaIncorporada,
                escuela_de_procedencia: esEscuelaIncorporada
                ? document.getElementById('escuela_seleccionada').options[document.getElementById('escuela_seleccionada').selectedIndex].text
                : 'Universidad Autónoma del Estado de México'
            });

            console.log('Periodos:', {
                ingreso: periodo_ingreso,
                egreso: periodo_egreso
            });
            //finaliza temporal

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

   
    const csrfTokenLogin = document.querySelector('[name=csrfmiddlewaretoken]');
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const correo = document.getElementById('correo').value;
            const contrasena = document.getElementById('contrasena').value;

            // Verificar si el correo está confirmado antes de continuar
            fetch('/verificarCorreoConfirmado/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRFToken': csrfTokenLogin ? csrfTokenLogin.value : ''
                },
                body: JSON.stringify({ correo_electronico: correo }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP Error ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!data.confirmado) {
                    mostrarModal('Tu correo aún no ha sido confirmado. Verifica tu bandeja de entrada.', 'errorModal');
                    return Promise.reject('Correo no confirmado');
                }

                // Si el correo está confirmado, proceder con el inicio de sesión
                return fetch('/api/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfTokenLogin ? csrfTokenLogin.value : ''
                    },
                    body: JSON.stringify({ correo_electronico: correo, contrasena: contrasena })
                });
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw err; });
                }
                return response.json();
            })
            .then(data => {

                if (data.id_sustentante) {
                    sessionStorage.setItem('sustentante', JSON.stringify(data));

                    if (data.redirigir_a_cambiar_contrasena) {
                        window.location.href = `/cambiarContrasena/${data.id_sustentante}/`;
                    } else {
                        mostrarModal('Inicio de sesión exitoso', 'successModal');
                        esperarCierreModal('successModal').then(() => {
                            window.location.href = '/index/';
                        });
                    }
                }
            })
            .catch(error => {
                if (error !== 'Correo no confirmado') {
                    console.error('Error:', error);
                    mostrarModal('Correo o contraseña incorrectos', 'errorModal');
                }
            });
        });
    }

    // Script para el Modal de recuperar contraseña 
    const recuperarForm = document.querySelector('.recuperarForm');

    if (recuperarForm) {
        recuperarForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var email = document.getElementById('correo_electronico').value;

            // Verificar si el correo está confirmado antes de continuar
            fetch('/verificarCorreoConfirmado/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRFToken': document.querySelector('input[name="csrfmiddlewaretoken"]').value
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
                if (!data.confirmado) {
                    mostrarModal('Tu correo aún no ha sido confirmado. Verifica tu bandeja de entrada.', 'errorModal');
                    return;
                }

                // Si el correo está confirmado, proceder con la recuperación de contraseña
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
                        window.location.href = data.redirect;
                    } else if (data.error) {
                        mostrarModal(data.error, 'errorModal');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    mostrarModal('Hubo un problema al procesar tu solicitud. Inténtalo de nuevo.', 'errorModal');
                });
            })
            .catch(error => {
                mostrarModal('Hubo un problema al verificar tu correo. Inténtalo de nuevo.', 'errorModal');
            });
        });
    }

    const cambiarContrasenaForm = document.querySelector('.cambiarContrasenaForm');
    const csrfTokeCambiarContrasena = document.querySelector('[name=csrfmiddlewaretoken]');
    if (cambiarContrasenaForm) {
        cambiarContrasenaForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            var nuevaContrasena = document.getElementById('nueva_contrasena').value;
            var confirmarContrasena = document.getElementById('confirmar_contrasena').value;
            var idSustentante = document.getElementById('id_sustentante').value;
    
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
                    window.location.href = data.redirect;
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

    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
        
        if (!event.target.closest('#password-requirements') && 
            !event.target.closest('#password-tooltip') && 
            event.target !== contrasena) {
            if (passwordRequirements) {
                passwordRequirements.style.display = 'none';
            }
        }
    });
});


// Función para manejar el 'Number input spinner'

function extraerAno(periodo) {
    return parseInt(periodo.substring(0, 4));
}


const periodos = []

for (let year = 1960; year <=2051; year++){
    periodos.push(`${year}A`);
    periodos.push(`${year}B`);
}

function cambiarPeriodo(step, tipoPeriodo){

    const inputID = tipoPeriodo === 'egreso' ? 'periodo_egreso' : 'periodo_ingreso';
    const input = document.getElementById(inputID);
    const currentIndex = periodos.indexOf(input.value);

    let newIndex = currentIndex + step;

    if (newIndex < 0) newIndex = periodos.length -1;
    if (newIndex >= periodos.length) newIndex = 0;
    
    input.value = periodos[newIndex]
}

document.getElementById('periodo_ingreso').addEventListener('keydown',
    function(e){
        if(e.key === 'ArrowUp'){
            cambiarPeriodo(1);
            e.preventDefault();
        }
        else if (e.key === 'ArrowDown'){
            cambiarPeriodo(-1);
            e.preventDefault();
        }
    }
)
// ternima el Number input spinner