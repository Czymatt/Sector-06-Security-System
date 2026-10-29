document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // VARIABLES GENERALES
    // ==========================================

    let currentStage = 1;

    const passwordInput = document.getElementById('password-input');
    const lengthVal = document.getElementById('length-val');
    const rulesContainer = document.getElementById('rules-container');

    const numericInput = document.getElementById('numeric-input');
    const numLengthVal = document.getElementById('num-length-val');
    const numericRulesContainer = document.getElementById('numeric-rules-container');

    const passedCount = document.getElementById('passed-count');
    const stageTitle = document.getElementById('stage-title');
    const sectorLabel = document.getElementById('sector-label');
    const sysStatus = document.getElementById('sys-status');

    const winModal = document.getElementById('win-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const nextStageBtn = document.getElementById('next-stage-btn');

    // ==========================================
    // ETAPA 1: PASSWORD MATRIX
    // ==========================================

    const stage1Rules = [
        {
            text: 'La contraseña debe tener al menos 6 caracteres.',
            check: val => val.length >= 6
        },
        {
            text: 'Debe contener al menos un número arábigo (0-9).',
            check: val => /\d/.test(val)
        },
        {
            text: 'Debe incluir una letra mayúscula.',
            check: val => /[A-Z]/.test(val)
        },
        {
            text: 'Debe incluir un carácter especial (!, @, #, $, %).',
            check: val => /[!@#$%]/.test(val)
        },
        {
            text: 'Debe contener al menos un número romano (I, V, X, L, C, D, M).',
            check: val => /[IVXLCDM]/.test(val)
        },
        {
            text: 'Debe incluir el nombre de un país sudamericano.',
            check: val => {
                const paises = [
                    'argentina', 'chile', 'brasil', 'uruguay',
                    'peru', 'bolivia', 'colombia', 'paraguay',
                    'ecuador', 'venezuela'
                ];

                return paises.some(pais =>
                    val.toLowerCase().includes(pais)
                );
            }
        }
    ];

    function evaluateStage1() {
        if (currentStage !== 1) return;

        const value = passwordInput.value;
        lengthVal.textContent = value.length;

        let passed = 0;
        rulesContainer.innerHTML = '';

        for (let i = 0; i < stage1Rules.length; i++) {
            const rule = stage1Rules[i];
            const isPassed = rule.check(value);

            const div = document.createElement('div');

            div.className =
                'p-2 rounded border small d-flex justify-content-between align-items-center ' +
                (isPassed
                    ? 'bg-success bg-opacity-20 border-success text-success'
                    : 'bg-dark border-secondary text-light');

            div.innerHTML = `
                <span>
                    <strong>[REGLA ${i + 1}]</strong>
                    ${rule.text}
                </span>
                <strong class="ms-2">
                    ${isPassed ? '✓ PASADO' : '✗ PENDIENTE'}
                </strong>
            `;

            rulesContainer.appendChild(div);

            if (!isPassed) break;

            passed++;
        }

        passedCount.textContent =
            `${passed} / ${stage1Rules.length}`;

        if (passed === stage1Rules.length) {
            showStageCompleteModal(1);
        }
    }

    passwordInput.addEventListener('input', evaluateStage1);

    // ==========================================
    // ETAPA 2: NUMERIC BYPASS
    // ==========================================

    const stage2Rules = [
        {
            text: () => 'El código debe contener exactamente 5 dígitos.',
            check: digits => digits.length === 5
        },
        {
            text: () => 'La suma de los 5 dígitos debe ser exactamente 20.',
            check: digits =>
                digits.length === 5 &&
                digits.reduce((a, b) => a + b, 0) === 20
        },
        {
            text: () => 'No se puede repetir ningún dígito ni utilizar el 0.',
            check: digits =>
                !digits.includes(0) &&
                new Set(digits).size === digits.length
        },
        {
            text: () => 'El último dígito debe ser el doble del segundo.',
            check: digits =>
                digits.length === 5 &&
                digits[4] === digits[1] * 2
        },
        {
            text: () => 'El tercer dígito debe ser el último menos el primero.',
            check: digits =>
                digits.length === 5 &&
                digits[2] === digits[4] - digits[0]
        }
    ];

    function evaluateStage2() {
        if (currentStage !== 2) return;

        const value = numericInput.value;
        const digits = value.split('').map(Number);

        numLengthVal.textContent = value.length;

        let passed = 0;
        numericRulesContainer.innerHTML = '';

        for (let i = 0; i < stage2Rules.length; i++) {
            const rule = stage2Rules[i];
            const isPassed = rule.check(digits);

            const div = document.createElement('div');

            div.className =
                'p-2 rounded border small d-flex justify-content-between align-items-center ' +
                (isPassed
                    ? 'bg-warning bg-opacity-20 border-warning text-warning'
                    : 'bg-dark border-secondary text-light');

            div.innerHTML = `
                <span>
                    <strong>[PISTA 0${i + 1}]</strong>
                    ${rule.text()}
                </span>
                <strong class="ms-2">
                    ${isPassed ? '✓ CUMPLIDA' : '✗ PENDIENTE'}
                </strong>
            `;

            numericRulesContainer.appendChild(div);

            if (!isPassed) break;

            passed++;
        }

        passedCount.textContent =
            `${passed} / ${stage2Rules.length}`;

        if (passed === stage2Rules.length) {
            showStageCompleteModal(2);
        }
    }

    // Teclado numérico de la pantalla
    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (
                currentStage === 2 &&
                numericInput.value.length < 5
            ) {
                numericInput.value += btn.dataset.val;
                evaluateStage2();
            }
        });
    });

    // Borrar todos los dígitos
    document.getElementById('num-clear').addEventListener('click', () => {
        if (currentStage === 2) {
            numericInput.value = '';
            evaluateStage2();
        }
    });

    // Borrar el último dígito
    document.getElementById('num-backspace').addEventListener('click', () => {
        if (currentStage === 2) {
            numericInput.value = numericInput.value.slice(0, -1);
            evaluateStage2();
        }
    });

    // Teclado físico
    document.addEventListener('keydown', e => {
        if (currentStage !== 2) return;

        if (e.key >= '0' && e.key <= '9') {
            if (numericInput.value.length < 5) {
                numericInput.value += e.key;
                evaluateStage2();
            }
        } else if (e.key === 'Backspace') {
            numericInput.value = numericInput.value.slice(0, -1);
            evaluateStage2();
        } else if (e.key === 'Escape' || e.key === 'Delete') {
            numericInput.value = '';
            evaluateStage2();
        }
    });

    // ==========================================
    // ETAPA 3: TERMINAL OVERRIDE (CIFRADO CÉSAR)
    // ==========================================

    const stage3Messages = [
        { original: "ACCESO", hint: "Un permiso para entrar al sistema" },
        { original: "FIREWALL", hint: "Barrera de seguridad de red" },
        { original: "MATRIX", hint: "El mundo virtual principal" },
        { original: "CYBER", hint: "Prefijo relacionado a la tecnología y redes" },
        { original: "KERNEL", hint: "El núcleo central del sistema operativo" }
    ];

    let caesarCurrentOriginal = "";
    let caesarCurrentCiphered = "";
    let caesarShift = 3;

    const cipheredMsgEl = document.getElementById('ciphered-msg');
    const caesarHintEl = document.getElementById('caesar-hint');
    const caesarInput = document.getElementById('caesar-input');
    const caesarSubmitBtn = document.getElementById('caesar-submit-btn');
    const caesarFeedbackEl = document.getElementById('caesar-feedback');

    // Función para cifrar texto con Código César
    function cipherText(text, shift) {
        let result = "";
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            let code = text.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                char = String.fromCharCode(((code - 65 + shift) % 26) + 65);
            }
            result += char;
        }
        return result;
    }

    // Renderizar abecedario de referencia en celdas (Tabla)
    function renderAlphabetReference() {
        const tableBody = document.getElementById('alphabet-table-body');
        if (!tableBody) return;
        tableBody.innerHTML = '';

        const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
        const lettersPerRow = 5; // Cantidad de letras por fila
        
        for (let i = 0; i < alphabet.length; i += lettersPerRow) {
            const tr = document.createElement('tr');
            
            // Creamos las celdas para este bloque de 5 letras
            for (let j = 0; j < lettersPerRow; j++) {
                const td = document.createElement('td');
                td.className = 'bg-black text-success fw-bold fs-5 p-2 border-secondary text-center';
                
                // Si la letra existe dentro del abecedario, la ponemos; si sobra espacio en la última fila, queda vacío
                if (i + j < alphabet.length) {
                    td.textContent = alphabet[i + j];
                } else {
                    td.textContent = "";
                }
                tr.appendChild(td);
            }
            tableBody.appendChild(tr);
        }
    }

    // Inicializar la Etapa 3 con valores aleatorios
    function initStage3() {
        if (currentStage !== 3) return;

        const randomMsgObj = stage3Messages[Math.floor(Math.random() * stage3Messages.length)];
        caesarCurrentOriginal = randomMsgObj.original;

        caesarShift = Math.floor(Math.random() * 6) + 2;
        caesarCurrentCiphered = cipherText(caesarCurrentOriginal, caesarShift);

        if (cipheredMsgEl) cipheredMsgEl.textContent = caesarCurrentCiphered;
        if (caesarHintEl) caesarHintEl.textContent = `Pista: ${randomMsgObj.hint} (Desplazamiento: ${caesarShift} posiciones hacia atrás)`;
        if (caesarInput) caesarInput.value = '';
        if (caesarFeedbackEl) caesarFeedbackEl.textContent = '';

        renderAlphabetReference();
    }

    // Comprobar la respuesta del Cifrado César
    function evaluateStage3() {
        if (currentStage !== 3) return;

        const userValue = caesarInput.value.trim().toUpperCase();

        if (userValue === caesarCurrentOriginal) {
            caesarFeedbackEl.textContent = '¡Correcto! Acceso concedido al sector.';
            caesarFeedbackEl.className = 'text-success fw-bold mt-2';
            
            passedCount.textContent = '3 / 3';

            setTimeout(() => {
                showStageCompleteModal(3);
            }, 1000);
        } else {
            caesarFeedbackEl.textContent = '✗ Código incorrecto. Probá de nuevo usando el abecedario.';
            caesarFeedbackEl.className = 'text-danger fw-bold mt-2';
        }
    }

    if (caesarSubmitBtn) {
        caesarSubmitBtn.addEventListener('click', evaluateStage3);
    }

    if (caesarInput) {
        caesarInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                evaluateStage3();
            }
        });
    }

    // ==========================================
    // CARTEL DE TRANSICIÓN
    // ==========================================

    function showStageCompleteModal(stage) {
        winModal.classList.remove('d-none');

        if (stage === 1) {
            modalTitle.textContent = '¡ETAPA 1 COMPLETADA!';
            modalDesc.innerHTML = `Contraseña aceptada.`;
            nextStageBtn.textContent = 'PASAR A LA ETAPA 2';
        } else if (stage === 2) {
            modalTitle.textContent = '¡ETAPA 2 COMPLETADA!';
            modalDesc.textContent = 'Has descifrado el código numérico correctamente.';
            nextStageBtn.textContent = 'CONTINUAR A LA ETAPA 3';
        } else if (stage === 3) {
            modalTitle.textContent = '¡SISTEMA DOMINADO!';
            modalDesc.textContent = 'Has completado todas las fases de seguridad con éxito.';
            nextStageBtn.textContent = 'FIN DEL JUEGO';
        }
    }

    nextStageBtn.addEventListener('click', () => {
        winModal.classList.add('d-none');
        if (currentStage < 3) {
            goToStage(currentStage + 1);
            // Dentro de goToStage(stageNum), agregá esto:
    tiempoRestante = 180; // Resetea a 3 minutos (180 segundos)
    actualizarRelojVisual(); // Función que actualiza el texto "03:00" en pantalla
        }
    });

    // ==========================================
    // CAMBIO DE ETAPAS (Única función)
    // ==========================================

    function goToStage(stageNum) {
        currentStage = stageNum;

        document.getElementById('stage-1').classList.add('d-none');
        document.getElementById('stage-2').classList.add('d-none');
        document.getElementById('stage-3').classList.add('d-none');

        if (stageNum === 1) {
            document.getElementById('stage-1').classList.remove('d-none');
            stageTitle.textContent = '[STAGE_01 // PASSWORD_MATRIX]';
            sectorLabel.textContent = '// SECTOR 01';
            evaluateStage1();

        } else if (stageNum === 2) {
            document.getElementById('stage-2').classList.remove('d-none');
            stageTitle.textContent = '[STAGE_02 // NUMERIC_BYPASS]';
            sectorLabel.textContent = '// SECTOR 02';
            numericInput.value = '';
            evaluateStage2();

        } else if (stageNum === 3) {
            document.getElementById('stage-3').classList.remove('d-none');
            stageTitle.textContent = '[STAGE_03 // TERMINAL_OVERRIDE]';
            sectorLabel.textContent = '// SECTOR 03';
            sysStatus.textContent = 'ACTIVE_DECRYPTION';
            sysStatus.className = 'value text-warning';
            initStage3();
        }
    }

    // Iniciar el juego en la Etapa 1
    goToStage(1);

});