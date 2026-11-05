document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // VARIABLES GENERALES Y TEMPORIZADOR
    // ==========================================

    let currentStage = 1;
    let segundosRestantes = 180;
    let intervalo = null;

    const temporizadorEl = document.getElementById("temporizador");
    const mensajeEl = document.getElementById("mensaje");
    const btnReiniciar = document.getElementById("btnReiniciar");

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

    function mostrarTiempo() {
        if (!temporizadorEl) return;
        const minutos = Math.floor(segundosRestantes / 60);
        const segundos = segundosRestantes % 60;
        temporizadorEl.textContent = 
            String(minutos).padStart(2, "0") + ":" + 
            String(segundos).padStart(2, "0");
    }

    function iniciarTemporizador() {
        clearInterval(intervalo);
        segundosRestantes = 180;
        mostrarTiempo();

        if (mensajeEl) {
            mensajeEl.textContent = "Desafío en curso...";
            mensajeEl.className = "alert alert-info border border-secondary text-light small py-2 mb-3";
        }

        intervalo = setInterval(() => {
            segundosRestantes--;
            mostrarTiempo();

            if (segundosRestantes <= 0) {
                clearInterval(intervalo);
                intervalo = null;
                ejecutarGameOver();
            }
        }, 1000);
    }

    function ejecutarGameOver() {
        if (mensajeEl) {
            mensajeEl.textContent = "SYSTEM BREACHED — YOU HAVE BEEN HACKED";
            mensajeEl.className = "alert alert-danger border border-danger fw-bold small py-2 mb-3";
        }

        if (passwordInput) passwordInput.disabled = true;
        if (numericInput) numericInput.disabled = true;

        if (winModal) {
            winModal.classList.remove('d-none');
            if (modalTitle) {
                modalTitle.textContent = 'GAME OVER';
                modalTitle.className = 'glitch-text text-danger display-5 fw-bold';
            }
            if (modalDesc) {
                modalDesc.textContent = 'El tiempo se ha agotado. El sistema ha colapsado.';
            }
            if (nextStageBtn) {
                nextStageBtn.textContent = 'REINTENTAR';
                nextStageBtn.className = 'btn btn-danger fw-bold py-2';
            }
        }
    }

    if (btnReiniciar) {
        btnReiniciar.addEventListener("click", () => {
            location.reload();
        });
    }

    // ==========================================
    // ETAPA 1: PASSWORD MATRIX
    // ==========================================

    const stage1Rules = [
        { text: 'La contraseña debe tener al menos 6 caracteres.', check: val => val.length >= 6 },
        { text: 'Debe contener al menos un número arábigo (0-9).', check: val => /\d/.test(val) },
        { text: 'Debe incluir una letra mayúscula.', check: val => /[A-Z]/.test(val) },
        { text: 'Debe incluir un carácter especial (!, @, #, $, %).', check: val => /[!@#$%]/.test(val) },
        { text: 'Debe contener al menos un número romano (I, V, X, L, C, D, M).', check: val => /[IVXLCDM]/.test(val) },
        {
            text: 'Debe incluir el nombre de un país sudamericano.',
            check: val => {
                const paises = ['argentina', 'chile', 'brasil', 'uruguay', 'peru', 'bolivia', 'colombia', 'paraguay', 'ecuador', 'venezuela'];
                return paises.some(pais => val.toLowerCase().includes(pais));
            }
        }
    ];

    function evaluateStage1() {
        if (currentStage !== 1 || !passwordInput || !rulesContainer) return;

        const value = passwordInput.value;
        if (lengthVal) lengthVal.textContent = value.length;

        let passed = 0;
        rulesContainer.innerHTML = '';

        for (let i = 0; i < stage1Rules.length; i++) {
            const rule = stage1Rules[i];
            const isPassed = rule.check(value);

            const div = document.createElement('div');
            div.className = 'p-2 rounded border small d-flex justify-content-between align-items-center ' +
                (isPassed ? 'bg-success bg-opacity-20 border-success text-success' : 'bg-dark border-secondary text-light');

            div.innerHTML = `
                <span><strong>[REGLA ${i + 1}]</strong> ${rule.text}</span>
                <strong class="ms-2">${isPassed ? '✓ PASADO' : '✗ PENDIENTE'}</strong>
            `;
            rulesContainer.appendChild(div);

            if (!isPassed) break;
            passed++;
        }

        if (passedCount) passedCount.textContent = `${passed} / ${stage1Rules.length}`;

        if (passed === stage1Rules.length) {
            showStageCompleteModal(1);
        }
    }

    if (passwordInput) {
        passwordInput.addEventListener('input', evaluateStage1);
    }

    // ==========================================
    // ETAPA 2: NUMERIC BYPASS (CORREGIDA)
    // ==========================================

    const stage2Rules = [
        { text: () => 'El código debe contener exactamente 5 dígitos.', check: digits => digits.length === 5 },
        { text: () => 'La suma de los 5 dígitos debe ser exactamente 20.', check: digits => digits.length === 5 && digits.reduce((a, b) => a + b, 0) === 20 },
        { text: () => 'No se puede repetir ningún dígito ni utilizar el 0.', check: digits => !digits.includes(0) && new Set(digits).size === digits.length },
        { text: () => 'El último dígito debe ser el doble del segundo.', check: digits => digits.length === 5 && digits[4] === digits[1] * 2 },
        { text: () => 'El tercer dígito debe ser el último menos el primero.', check: digits => digits.length === 5 && digits[2] === digits[4] - digits[0] }
    ];

    function evaluateStage2() {
        if (currentStage !== 2 || !numericInput || !numericRulesContainer) return;

        const value = numericInput.value;
        const digits = value.split('').map(Number);
        if (numLengthVal) numLengthVal.textContent = value.length;

        let passed = 0;
        numericRulesContainer.innerHTML = '';

        for (let i = 0; i < stage2Rules.length; i++) {
            const rule = stage2Rules[i];
            const isPassed = rule.check(digits);

            const div = document.createElement('div');
            div.className = 'p-2 rounded border small d-flex justify-content-between align-items-center ' +
                (isPassed ? 'bg-warning bg-opacity-20 border-warning text-warning' : 'bg-dark border-secondary text-light');

            div.innerHTML = `
                <span><strong>[PISTA 0${i + 1}]</strong> ${rule.text()}</span>
                <strong class="ms-2">${isPassed ? '✓ CUMPLIDA' : '✗ PENDIENTE'}</strong>
            `;
            numericRulesContainer.appendChild(div);

            if (!isPassed) break;
            passed++;
        }

        if (passedCount) passedCount.textContent = `${passed} / ${stage2Rules.length}`;

        if (passed === stage2Rules.length) {
            showStageCompleteModal(2);
        }
    }

    // Manejo limpio de botones numéricos en pantalla (evita duplicados)
    const numButtons = document.querySelectorAll('.num-btn');
    numButtons.forEach(btn => {
        // Clonamos el botón o limpiamos eventos previos reemplazándolos para evitar doble binding
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        newBtn.addEventListener('click', () => {
            if (currentStage === 2 && numericInput && numericInput.value.length < 5) {
                numericInput.value += newBtn.dataset.val;
                evaluateStage2();
            }
        });
    });

    const numClear = document.getElementById('num-clear');
    if (numClear) {
        const newClear = numClear.cloneNode(true);
        numClear.parentNode.replaceChild(newClear, numClear);
        newClear.addEventListener('click', () => {
            if (currentStage === 2 && numericInput) {
                numericInput.value = '';
                evaluateStage2();
            }
        });
    }

    const numBackspace = document.getElementById('num-backspace');
    if (numBackspace) {
        const newBack = numBackspace.cloneNode(true);
        numBackspace.parentNode.replaceChild(newBack, numBackspace);
        newBack.addEventListener('click', () => {
            if (currentStage === 2 && numericInput) {
                numericInput.value = numericInput.value.slice(0, -1);
                evaluateStage2();
            }
        });
    }

    // Teclado físico controlado para la etapa 2
    document.addEventListener('keydown', e => {
        if (currentStage !== 2 || !numericInput) return;

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
    // ETAPA 3: TERMINAL OVERRIDE
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

    function cipherText(text, shift) {
        let result = "";
        for (let i = 0; i < text.length; i++) {
            let code = text.charCodeAt(i);
            if (code >= 65 && code <= 90) {
                result += String.fromCharCode(((code - 65 + shift) % 26) + 65);
            } else {
                result += text[i];
            }
        }
        return result;
    }

    function renderAlphabetReference() {
        const tableBody = document.getElementById('alphabet-table-body');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
        const lettersPerRow = 5;
        
        for (let i = 0; i < alphabet.length; i += lettersPerRow) {
            const tr = document.createElement('tr');
            for (let j = 0; j < lettersPerRow; j++) {
                const td = document.createElement('td');
                td.className = 'bg-black text-success fw-bold fs-5 p-2 border-secondary text-center';
                td.textContent = (i + j < alphabet.length) ? alphabet[i + j] : "";
                tr.appendChild(td);
            }
            tableBody.appendChild(tr);
        }
    }

    function initStage3() {
        if (currentStage !== 3) return;
        const randomMsgObj = stage3Messages[Math.floor(Math.random() * stage3Messages.length)];
        caesarCurrentOriginal = randomMsgObj.original;
        caesarShift = Math.floor(Math.random() * 6) + 2;
        caesarCurrentCiphered = cipherText(caesarCurrentOriginal, caesarShift);

        if (cipheredMsgEl) cipheredMsgEl.textContent = caesarCurrentCiphered;
        if (caesarHintEl) caesarHintEl.textContent = `Pista: ${randomMsgObj.hint} (Desplazamiento: ${caesarShift} posiciones)`;
        if (caesarInput) caesarInput.value = '';
        if (caesarFeedbackEl) caesarFeedbackEl.textContent = '';
        renderAlphabetReference();
    }

    function evaluateStage3() {
        if (currentStage !== 3 || !caesarInput) return;
        const userValue = caesarInput.value.trim().toUpperCase();

        if (userValue === caesarCurrentOriginal) {
            if (caesarFeedbackEl) {
                caesarFeedbackEl.textContent = '¡Correcto! Acceso concedido al sector.';
                caesarFeedbackEl.className = 'text-success fw-bold mt-2';
            }
            if (passedCount) passedCount.textContent = '3 / 3';
            setTimeout(() => showStageCompleteModal(3), 1000);
        } else {
            if (caesarFeedbackEl) {
                caesarFeedbackEl.textContent = '✗ Código incorrecto. Probá de nuevo usando el abecedario.';
                caesarFeedbackEl.className = 'text-danger fw-bold mt-2';
            }
        }
    }

    if (caesarSubmitBtn) caesarSubmitBtn.addEventListener('click', evaluateStage3);
    if (caesarInput) {
        caesarInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') evaluateStage3();
        });
    }

    // ==========================================
    // MODAL Y CAMBIO DE ETAPAS
    // ==========================================

    function showStageCompleteModal(stage) {
        if (!winModal) return;
        winModal.classList.remove('d-none');

        if (stage === 1) {
            if (modalTitle) modalTitle.textContent = '¡ETAPA 1 COMPLETADA!';
            if (modalDesc) modalDesc.textContent = 'Contraseña aceptada.';
            if (nextStageBtn) nextStageBtn.textContent = 'PASAR A LA ETAPA 2';
        } else if (stage === 2) {
            if (modalTitle) modalTitle.textContent = '¡ETAPA 2 COMPLETADA!';
            if (modalDesc) modalDesc.textContent = 'Has descifrado el código numérico correctamente.';
            if (nextStageBtn) nextStageBtn.textContent = 'CONTINUAR A LA ETAPA 3';
        } else if (stage === 3) {
            if (modalTitle) modalTitle.textContent = '¡SISTEMA DOMINADO!';
            if (modalDesc) modalDesc.textContent = 'Has completado todas las fases de seguridad con éxito.';
            if (nextStageBtn) nextStageBtn.textContent = 'REINICIAR JUEGO';
        }
    }

    if (nextStageBtn) {
        nextStageBtn.addEventListener('click', () => {
            if (currentStage < 3) {
                winModal.classList.add('d-none');
                goToStage(currentStage + 1);
            } else {
                location.reload();
            }
        });
    }

    function goToStage(stageNum) {
        currentStage = stageNum;
        const s1 = document.getElementById('stage-1');
        const s2 = document.getElementById('stage-2');
        const s3 = document.getElementById('stage-3');

        if (s1) s1.classList.add('d-none');
        if (s2) s2.classList.add('d-none');
        if (s3) s3.classList.add('d-none');

        if (stageNum === 1) {
            if (s1) s1.classList.remove('d-none');
            if (stageTitle) stageTitle.textContent = '[STAGE_01 // PASSWORD_MATRIX]';
            if (sectorLabel) sectorLabel.textContent = '// SECTOR 01';
            evaluateStage1();
        } else if (stageNum === 2) {
            if (s2) s2.classList.remove('d-none');
            if (stageTitle) stageTitle.textContent = '[STAGE_02 // NUMERIC_BYPASS]';
            if (sectorLabel) sectorLabel.textContent = '// SECTOR 02';
            if (numericInput) numericInput.value = '';
            evaluateStage2();
        } else if (stageNum === 3) {
            if (s3) s3.classList.remove('d-none');
            if (stageTitle) stageTitle.textContent = '[STAGE_03 // TERMINAL_OVERRIDE]';
            if (sectorLabel) sectorLabel.textContent = '// SECTOR 03';
            if (sysStatus) {
                sysStatus.textContent = 'ACTIVE_DECRYPTION';
                sysStatus.className = 'value text-warning';
            }
            initStage3();
        }
    }

    // ARRANQUE INMEDIATO AL CARGAR LA PÁGINA
    goToStage(1);
    iniciarTemporizador();

});s