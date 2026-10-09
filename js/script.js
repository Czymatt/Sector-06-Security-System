document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password-input');
    const rulesContainer = document.getElementById('rules-container');
    const lengthVal = document.getElementById('length-val');
    const passedCount = document.getElementById('passed-count');
    const progressBar = document.getElementById('progress-bar');
    const winModal = document.getElementById('win-modal');
    const restartBtn = document.getElementById('restart-btn');
    const sysStatus = document.getElementById('sys-status');

    // Lista de Reglas del Juego
    const rulesDefinition = [
        {
            id: 1,
            title: "La contraseña debe tener al menos 6 caracteres.",
            check: (val) => val.length >= 6
        },
        {
            id: 2,
            title: "Debe incluir al menos un número.",
            check: (val) => /\d/.test(val)
        },
        {
            id: 3,
            title: "Debe incluir al menos una letra mayúscula.",
            check: (val) => /[A-Z]/.test(val)
        },
        {
            id: 4,
            title: "Debe incluir un carácter especial (!@#$%^&*).",
            check: (val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)
        },
        {
            id: 5,
            title: "Los dígitos numéricos de la contraseña deben sumar exactamente 20.",
            check: (val) => {
                const digits = val.match(/\d/g);
                if (!digits) return false;
                const sum = digits.reduce((acc, curr) => acc + parseInt(curr, 10), 0);
                return sum === 20;
            }
        },
        {
            id: 6,
            title: "Debe contener uno de los siguientes países de la red: 'chile', 'argentina', 'mexico' o 'espana'.",
            check: (val) => {
                const lower = val.toLowerCase();
                return lower.includes('chile') || lower.includes('argentina') || lower.includes('mexico') || lower.includes('espana');
            }
        },
        {
            id: 7,
            title: "Debe incluir un número romano (I, V, X, L, C, D, M) en mayúscula.",
            check: (val) => /[IVXLCDM]/.test(val)
        },
        {
            id: 8,
            title: "Debe incluir la secuencia de hackeo: 'ROOT'.",
            check: (val) => val.includes('ROOT')
        }
    ];

    let activeRulesCount = 1;

    // Actualiza el flujo principal
    function updateGame() {
        const val = passwordInput.value;
        lengthVal.textContent = val.length;

        // Evaluar reglas activas
        let allCurrentPassed = true;

        for (let i = 0; i < activeRulesCount; i++) {
            const rule = rulesDefinition[i];
            const isPassed = rule.check(val);

            if (!isPassed) {
                allCurrentPassed = false;
            }
        }

        // Si se pasaron todas las reglas activas actuales y aún quedan reglas, desbloquear la siguiente
        if (allCurrentPassed && activeRulesCount < rulesDefinition.length) {
            activeRulesCount++;
        }

        renderRules(val);
        updateHeaderAndProgress();
    }

    // Renderizado dinámico de tarjetas de reglas
    function renderRules(val) {
        rulesContainer.innerHTML = '';

        // Renderizar las reglas desbloqueadas en orden inverso (la más nueva arriba)
        for (let i = activeRulesCount - 1; i >= 0; i--) {
            const rule = rulesDefinition[i];
            const isPassed = rule.check(val);

            const card = document.createElement('div');
            card.className = `rule-card ${isPassed ? 'passed' : 'failed'}`;

            card.innerHTML = `
                <div class="rule-card-header">
                    <span class="rule-number">PROTOCOLO #${rule.id}</span>
                    <span class="rule-status">${isPassed ? '✔ CUMPLIDO' : '✖ REQUERIDO'}</span>
                </div>
                <div class="rule-title">${rule.title}</div>
            `;

            rulesContainer.appendChild(card);
        }
    }

    // Actualizar estado general e indicadores
    function updateHeaderAndProgress() {
        const val = passwordInput.value;
        let totalPassed = 0;

        for (let i = 0; i < activeRulesCount; i++) {
            if (rulesDefinition[i].check(val)) {
                totalPassed++;
            }
        }

        passedCount.textContent = `${totalPassed} / ${rulesDefinition.length}`;
        const progressPercentage = (totalPassed / rulesDefinition.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // Condición de Victoria Total
        if (totalPassed === rulesDefinition.length) {
            sysStatus.textContent = "ACCESS_GRANTED";
            sysStatus.style.color = "var(--primary-green)";
            winModal.classList.remove('hidden');
        } else {
            sysStatus.textContent = "BYPASS_IN_PROGRESS";
            sysStatus.style.color = "";
        }
    }

    // Eventos
    passwordInput.addEventListener('input', updateGame);

    restartBtn.addEventListener('click', () => {
        passwordInput.value = '';
        activeRulesCount = 1;
        winModal.classList.add('hidden');
        updateGame();
    });

    // Inicialización
    updateGame();
});