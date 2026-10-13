
document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // VARIABLES GENERALES
    // ==========================================

    let currentStage = 1;
    let firstDigitFromStage1 = '';

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
            firstDigitFromStage1 = value.match(/\d/)[0];
            showStageCompleteModal(1);
        }
    }

    passwordInput.addEventListener('input', evaluateStage1);

    // ==========================================
    // ETAPA 2: NUMERIC BYPASS
    // ==========================================

    const stage2Rules = [
        {
            text: () =>
                `El primer dígito debe ser ${firstDigitFromStage1}.`,
            check: digits =>
                digits.length >= 1 &&
                digits[0] === Number(firstDigitFromStage1)
        },
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
            text: () =>
                'No se puede repetir ningún dígito ni utilizar el 0.',
            check: digits =>
                !digits.includes(0) &&
                new Set(digits).size === digits.length
        },
        {
            text: () =>
                'El último dígito debe ser el doble del segundo.',
            check: digits =>
                digits.length === 5 &&
                digits[4] === digits[1] * 2
        },
        {
            text: () =>
                'El tercer dígito debe ser el último menos el primero.',
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
    // CARTEL DE TRANSICIÓN
    // ==========================================

    function showStageCompleteModal(stage) {
        winModal.classList.remove('d-none');

        if (stage === 1) {
            modalTitle.textContent = '¡ETAPA 1 COMPLETADA!';

            modalDesc.innerHTML = `
                Contraseña aceptada.<br>
                Tu primer dígito para la siguiente etapa es:
                <strong class="text-warning fs-4">
                    ${firstDigitFromStage1}
                </strong>
            `;

            nextStageBtn.textContent = 'PASAR A LA ETAPA 2';
        } else if (stage === 2) {
            modalTitle.textContent = '¡ETAPA 2 COMPLETADA!';

            modalDesc.textContent =
                'Has descifrado el código numérico correctamente.';

            nextStageBtn.textContent = 'CONTINUAR A LA ETAPA 3';
        }
    }

    nextStageBtn.addEventListener('click', () => {
        winModal.classList.add('d-none');
        goToStage(currentStage + 1);
    });

    // ==========================================
    // CAMBIO DE ETAPAS
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

            sysStatus.textContent = 'SYSTEM_OVERRIDDEN';
            sysStatus.className = 'value text-success';

            passedCount.textContent = 'COMPLETADO';
        }
    }

    // Iniciar el juego
    goToStage(1);

});
