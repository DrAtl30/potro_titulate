// FUNCIONES PARA MANEJAR MODALES (igual que en login.js)
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

function esperarCierreModal(modalId) {
    return new Promise((resolve) => {
        const modal = document.getElementById(modalId);
        if (!modal) return resolve();

        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
                resolve();
            };
        }

        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                resolve();
            }
        };

        window.onkeydown = (event) => {
            if (['Escape', 'Esc'].includes(event.key)) {
                modal.style.display = 'none';
                resolve();
            }
        };
    });
}

// VALIDACIÓN DE CONTRASEÑA
function validatePassword(password) {
    const elements = {
        length: document.getElementById('length-icon'),
        uppercase: document.getElementById('uppercase-icon'),
        lowercase: document.getElementById('lowercase-icon'),
        number: document.getElementById('number-icon'),
        special: document.getElementById('special-icon')
    };

    const validations = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*()]/.test(password)
    };

    Object.keys(validations).forEach(key => {
        if (elements[key]) {
            elements[key].textContent = validations[key] ? '✓' : '✗';
            elements[key].className = validations[key] ? 'requirement-icon valid' : 'requirement-icon invalid';
        }
    });
}

// REGISTRO
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del formulario
    const numCuenta = document.getElementById('numCuenta');
    const contrasena = document.getElementById('contrasena');
    const confirmarContrasena = document.getElementById('confirmarContrasena');
    const passwordRequirements = document.getElementById('password-requirements');
    const passwordTooltip = document.getElementById('password-tooltip');
    const registroForm = document.getElementById('registro-form');
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');

    // Validación de número de cuenta
    if (numCuenta) {
        numCuenta.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value.length > 7) {
                this.value = this.value.slice(0, 7);
            }
        });
    }

    // Mostrar requisitos de contraseña
    if (contrasena && passwordRequirements) {
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

        contrasena.addEventListener('input', function() {
            validatePassword(this.value);
        });
    }

    // Validación de coincidencia de contraseñas
    if (confirmarContrasena) {
        confirmarContrasena.addEventListener('input', function() {
            const matchElement = document.getElementById('password-match');
            if (matchElement) {
                matchElement.style.display = this.value !== contrasena.value ? 'block' : 'none';
            }
        });
    }

    const periodoIngreso = document.getElementById('periodo_ingreso');
    if (periodoIngreso) {
        periodoIngreso.addEventListener('keydown', function(e) {
            if (e.key === 'ArrowUp') {
                cambiarPeriodo(1, 'ingreso');
                e.preventDefault();
            } else if (e.key === 'ArrowDown') {
                cambiarPeriodo(-1, 'ingreso');
                e.preventDefault();
            }
        });
    }

    // Escuelas incorporadas
    const escuelasContainer = document.getElementById('escuelas-container');
    const selectEscuelas = document.getElementById('escuela_seleccionada');
    const escuelaSi = document.getElementById('escuela_si');
    const escuelaNo = document.getElementById('escuela_no');

    if (selectEscuelas) {
        fetch('/api/escuelas-incorporadas/')
            .then(response => {
                if (!response.ok) throw new Error('Error al cargar escuelas');
                return response.json();
            })
            .then(data => {
                selectEscuelas.innerHTML = '';
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Selecciona tu escuela incorporada';
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
                selectEscuelas.innerHTML = '<option value="">Error cargando escuelas</option>';
            });
    }

    if (escuelaSi && escuelaNo && escuelasContainer) {
        escuelaSi.addEventListener('change', function() {
            escuelasContainer.style.display = 'block';
            if (selectEscuelas) selectEscuelas.required = true;
        });

        escuelaNo.addEventListener('change', function() {
            escuelasContainer.style.display = 'none';
            if (selectEscuelas) selectEscuelas.required = false;
        });
    }

    // Envío del formulario
    if (registroForm && csrfToken) {
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
                    'X-CSRFToken': csrfToken ? csrfToken.value : ''
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
});

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