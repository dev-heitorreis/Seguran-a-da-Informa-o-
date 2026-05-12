// Configurações e Chaves de Armazenamento
const STORAGE_KEYS = {
    OCCURRENCES: 'soa_data_enc',
    AUDIT: 'soa_audit_enc',
    SESSION: 'soa_session_enc'
};

// --- UTILITÁRIOS DE SEGURANÇA ---

// Codificação para dificultar leitura direta no LocalStorage
const security = {
    encode: (data) => btoa(unescape(encodeURIComponent(JSON.stringify(data)))),
    decode: (str) => {
        if (!str) return null;
        try {
            return JSON.parse(decodeURIComponent(escape(atob(str))));
        } catch (e) { return null; }
    },
    // Sanitização contra XSS
    escapeHtml: (unsafe) => {
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },
    // Validação de CPF simplificada
    validateCpf: (cpf) => {
        const cleanCpf = cpf.replace(/\D/g, '');
        return cleanCpf.length === 11;
    }
};

// --- GESTÃO DE DADOS ---

function getStoredData(key) {
    const raw = localStorage.getItem(key);
    return security.decode(raw) || [];
}

function saveStoredData(key, data) {
    localStorage.setItem(key, security.encode(data));
}

// --- CONTROLE DE SESSÃO ---

let sessionTimeout;

function startSessionTimer() {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
        alert("Sessão expirada por inatividade.");
        logout();
    }, 15 * 60 * 1000); // 15 minutos
}

function logout() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    location.reload();
}

// --- LÓGICA DA APLICAÇÃO ---

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const cpf = document.getElementById('cpf').value;
    const pass = document.getElementById('password').value;

    // Simulação de autenticação segura
    let user = null;
    if (cpf === '111.444.777-88' && pass === 'Admin@2026') {
        user = { name: 'Administrador Geral', role: 'ADMIN', cpf: cpf, email: 'admin@faculdade.local' };
    } else if (cpf === '222.555.888-11' && pass === 'Prof@2026') {
        user = { name: 'Prof. Ricardo Silva', role: 'PROFESSOR', cpf: cpf, email: 'ricardo@faculdade.local' };
    } else if (security.validateCpf(cpf) && pass === '123456') {
        user = { name: 'Aluno Padrão', role: 'ALUNO', cpf: cpf, email: 'aluno@faculdade.local' };
    }

    if (user) {
        saveStoredData(STORAGE_KEYS.SESSION, user);

        // Log de Auditoria
        const logs = getStoredData(STORAGE_KEYS.AUDIT);
        logs.push({ action: 'LOGIN', user: cpf, date: new Date().toISOString(), role: user.role });
        saveStoredData(STORAGE_KEYS.AUDIT, logs);

        initApp();
    } else {
        alert("Credenciais inválidas.");
    }
});

function initApp() {
    const session = security.decode(localStorage.getItem(STORAGE_KEYS.SESSION));
    if (!session) return;

    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('userNameDisplay').textContent = security.escapeHtml(session.name);
    document.getElementById('userRoleBadge').textContent = session.role;
    document.getElementById('userRoleBadge').className = `badge role-${session.role.toLowerCase()}`;

    if (session.role === 'ADMIN') {
        document.getElementById('adminActions').classList.remove('hidden');
    }

    renderTable();
    startSessionTimer();
}

function renderTable(filter = '') {
    const session = security.decode(localStorage.getItem(STORAGE_KEYS.SESSION));
    const data = getStoredData(STORAGE_KEYS.OCCURRENCES);
    const list = document.getElementById('occurrenceList');
    list.innerHTML = '';

    data.filter(item => {
        // RBAC: Aluno só vê o dele
        if (session.role === 'ALUNO' && item.studentCpf !== session.cpf) return false;

        const searchStr = (item.studentName + item.studentCpf).toLowerCase();
        return searchStr.includes(filter.toLowerCase());
    }).forEach(item => {
        const row = `<tr>
            <td>${security.escapeHtml(item.date)}</td>
            <td><strong>${security.escapeHtml(item.studentName)}</strong></td>
            <td>${security.escapeHtml(item.type)}</td>
            <td>${security.escapeHtml(item.description)}</td>
            <td><span class="status-pill">Ativo</span></td>
        </tr>`;
        list.insertAdjacentHTML('beforeend', row);
    });
}

// Eventos de atividade para resetar timeout
['mousedown', 'keydown', 'scroll'].forEach(evt => {
    document.addEventListener(evt, startSessionTimer);
});

document.getElementById('logoutBtn').onclick = logout;

document.getElementById('occurrenceForm').onsubmit = (e) => {
    e.preventDefault();
    const session = security.decode(localStorage.getItem(STORAGE_KEYS.SESSION));
    const newData = {
        date: new Date().toLocaleDateString(),
        studentName: document.getElementById('studentName').value,
        studentCpf: document.getElementById('studentCpf').value,
        studentEmail: document.getElementById('studentEmail').value,
        type: document.getElementById('occurrenceType').value,
        description: document.getElementById('description').value,
        createdBy: session.cpf
    };

    const current = getStoredData(STORAGE_KEYS.OCCURRENCES);
    current.push(newData);
    saveStoredData(STORAGE_KEYS.OCCURRENCES, current);

    // Log de Auditoria
    const logs = getStoredData(STORAGE_KEYS.AUDIT);
    logs.push({ action: 'CREATE', user: session.cpf, date: new Date().toISOString(), studentCpf: newData.studentCpf });
    saveStoredData(STORAGE_KEYS.AUDIT, logs);

    e.target.reset();
    renderTable();
    alert('Ocorrência registrada com sucesso!');
};

document.getElementById('searchInput').oninput = (e) => renderTable(e.target.value);

document.getElementById('exportBtn').onclick = () => {
    const session = security.decode(localStorage.getItem(STORAGE_KEYS.SESSION));
    if (session.role !== 'ADMIN') {
        alert('Acesso negado!');
        return;
    }
    const data = {
        occurrences: getStoredData(STORAGE_KEYS.OCCURRENCES),
        audit: getStoredData(STORAGE_KEYS.AUDIT),
        exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export_' + Date.now() + '.json';
    a.click();
};

document.getElementById('clearLogsBtn').onclick = () => {
    const session = security.decode(localStorage.getItem(STORAGE_KEYS.SESSION));
    if (session.role !== 'ADMIN') {
        alert('Acesso negado!');
        return;
    }
    if (confirm('Tem certeza que deseja limpar todos os logs de auditoria?')) {
        localStorage.removeItem(STORAGE_KEYS.AUDIT);
        alert('Logs apagados com sucesso!');
    }
};

// Inicialização
if (localStorage.getItem(STORAGE_KEYS.SESSION)) initApp();
