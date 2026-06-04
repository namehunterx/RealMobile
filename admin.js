// ============================================
// REAL MOBILE — PROFESSIONAL ADMIN PANEL CORE
// ============================================

// ГЛАВНЫЕ НАСТРОЙКИ ДОСТУПА (ВЛАДЕЛЕЦ)
const MASTER_USER = "dev";
const MASTER_PASS_HASH = "0bfcf3c69af9e53644dd8cf1d060900652246fa283285daa769feb09f4afa999"; // real2026
const MASTER_PIN = "1289";

// СЕКРЕТНАЯ КОМБИНАЦИЯ КЛАВИШ
const SECRET_TRIGGER = "rmadmin";
const SESSION_LIFETIME = 30; // минут

// СТАТУСЫ СЕРВЕРА
const SERVER_STATUS_DATA = {
    online: { label: 'ONLINE', color: '#00C853', bg: 'rgba(0, 200, 83, 0.1)' },
    tech: { label: 'ТЕХ.РАБОТЫ', color: '#FF9800', bg: 'rgba(255, 152, 0, 0.1)' },
    closed: { label: 'ЗАКРЫТ', color: '#E31C25', bg: 'rgba(227, 28, 37, 0.1)' },
    update: { label: 'ОБНОВЛЕНИЕ', color: '#2196F3', bg: 'rgba(33, 150, 243, 0.1)' },
    restart: { label: 'ПЕРЕЗАГРУЗКА', color: '#FFC107', bg: 'rgba(255, 193, 7, 0.1)' }
};

// ============================================
// СИСТЕМНЫЕ ПЕРЕМЕННЫЕ
// ============================================
let keyLog = "";
let currentAdmin = null;

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

// Хэширование SHA-256
async function sha256(str) {
    const buf = new TextEncoder().encode(str);
    const hashBuf = await crypto.subtle.digest('SHA-256', buf);
    const arr = Array.from(new Uint8Array(hashBuf));
    return arr.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Генератор случайных строк (для паролей)
function generateRandomString(length) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// ============================================
// ОБРАБОТКА ВХОДА (rmadmin)
// ============================================
document.addEventListener('keydown', (e) => {
    // Если мы уже вошли или вводим данные в форму - не реагируем
    if (sessionStorage.getItem('rm_auth_state') === 'active') return;
    if (e.target.tagName === 'INPUT') return;

    keyLog += e.key.toLowerCase();
    if (keyLog.length > 15) keyLog = keyLog.substring(1);

    if (keyLog.includes(SECRET_TRIGGER)) {
        keyLog = "";
        document.getElementById('fake404').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('loginUser').focus();
    }
});

// ============================================
// АВТОРИЗАЦИЯ
// ============================================
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const uiUser = document.getElementById('loginUser').value.trim();
    const uiPass = document.getElementById('loginPass').value.trim();
    const uiPin = document.getElementById('loginPin').value.trim();
    const errorBox = document.getElementById('loginError');

    // Хэшируем введенный пароль для сравнения
    const hashedInput = await sha256(uiPass);

    // 1. Проверка владельца (dev)
    if (uiUser === MASTER_USER && hashedInput === MASTER_PASS_HASH && uiPin === MASTER_PIN) {
        startSession(MASTER_USER, "Владелец");
        return;
    }

    // 2. Проверка команды (созданных админов)
    let team = JSON.parse(localStorage.getItem('rm_team_data') || "[]");
    let foundDev = team.find(a => a.user === uiUser && a.pass === uiPass && a.pin === uiPin);

    if (foundDev) {
        startSession(foundDev.user, foundDev.role);
        return;
    }

    // Если ничего не подошло
    errorBox.textContent = "ДОСТУП ОТКЛОНЕН: Данные не найдены в базе Core.";
    errorBox.style.display = 'block';
    document.getElementById('loginPass').value = "";
    document.getElementById('loginPin').value = "";
});

function startSession(user, role) {
    currentAdmin = { user, role, start: Date.now() };
    sessionStorage.setItem('rm_auth_state', 'active');
    sessionStorage.setItem('rm_admin_info', JSON.stringify(currentAdmin));
    
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    initPanel();
}

// ============================================
// УПРАВЛЕНИЕ ПАНЕЛЬЮ
// ============================================
function initPanel() {
    // Загрузка конфига
    let cfg = JSON.parse(localStorage.getItem('rm_config')) || window.SITE_CONFIG;

    // Заполнение полей
    document.getElementById('cfgOnline').value = cfg.online;
    document.getElementById('cfgSlots').value = cfg.slots;
    document.getElementById('cfgPing').value = cfg.ping;
    document.getElementById('cfgServerName').value = cfg.serverName;
    document.getElementById('cfgAccounts').value = cfg.accounts;
    document.getElementById('cfgCars').value = cfg.cars;
    document.getElementById('cfgHouses').value = cfg.houses;
    document.getElementById('cfgJobs').value = cfg.jobs;
    document.getElementById('cfgVersion').value = cfg.version;

    renderStatusGrid(cfg.status);
    renderTeamList();
    updateQuickView(cfg);
}

function renderStatusGrid(current) {
    const container = document.getElementById('statusGrid');
    container.innerHTML = "";
    
    Object.keys(SERVER_STATUS_DATA).forEach(key => {
        const data = SERVER_STATUS_DATA[key];
        const btn = document.createElement('button');
        btn.className = "status-btn" + (current === key ? " active" : "");
        btn.style.color = data.color;
        btn.innerHTML = `<span style="display:block; font-size:0.6rem; opacity:0.6;">СТАТУС</span>${data.label}`;
        
        if (current === key) {
            btn.style.borderColor = data.color;
            btn.style.backgroundColor = data.bg;
        }

        btn.onclick = () => {
            updateConfigValue('status', key);
            renderStatusGrid(key);
        };
        container.appendChild(btn);
    });
}

// Глобальное сохранение
function saveData() {
    let cfg = JSON.parse(localStorage.getItem('rm_config')) || window.SITE_CONFIG;

    cfg.online = document.getElementById('cfgOnline').value;
    cfg.slots = document.getElementById('cfgSlots').value;
    cfg.ping = document.getElementById('cfgPing').value;
    cfg.serverName = document.getElementById('cfgServerName').value;
    cfg.accounts = document.getElementById('cfgAccounts').value;
    cfg.cars = document.getElementById('cfgCars').value;
    cfg.houses = document.getElementById('cfgHouses').value;
    cfg.jobs = document.getElementById('cfgJobs').value;
    cfg.version = document.getElementById('cfgVersion').value;

    localStorage.setItem('rm_config', JSON.stringify(cfg));
    updateQuickView(cfg);
    showNotify();
}

function updateConfigValue(key, val) {
    let cfg = JSON.parse(localStorage.getItem('rm_config')) || window.SITE_CONFIG;
    cfg[key] = val;
    localStorage.setItem('rm_config', JSON.stringify(cfg));
    updateQuickView(cfg);
    showNotify();
}

function updateQuickView(cfg) {
    const s = SERVER_STATUS_DATA[cfg.status];
    if (document.getElementById('qsOnline')) document.getElementById('qsOnline').textContent = cfg.online;
    if (document.getElementById('qsStatus')) {
        document.getElementById('qsStatus').textContent = s.label;
        document.getElementById('qsStatus').style.color = s.color;
    }
}

// ============================================
// УПРАВЛЕНИЕ КОМАНДОЙ (TEAM)
// ============================================
function createDev() {
    const name = prompt("Введите никнейм нового разработчика:");
    if (!name) return;

    const newPass = generateRandomString(8);
    const newPin = Math.floor(1000 + Math.random() * 9000).toString();
    
    let team = JSON.parse(localStorage.getItem('rm_team_data') || "[]");
    team.push({
        user: name,
        pass: newPass,
        pin: newPin,
        role: "Разработчик",
        addedBy: MASTER_USER,
        date: new Date().toLocaleDateString()
    });

    localStorage.setItem('rm_team_data', JSON.stringify(team));
    
    alert(`ДОСТУП СГЕНЕРИРОВАН!\n\nЛогин: ${name}\nПароль: ${newPass}\nPIN: ${newPin}\n\nОбязательно сохраните эти данные!`);
    renderTeamList();
}

function renderTeamList() {
    const container = document.getElementById('adminList');
    if (!container) return;

    container.innerHTML = `<h3 style="margin-top:20px;">Список доступа</h3>`;
    
    // Владелец (всегда первый)
    container.innerHTML += `
        <div class="team-item">
            <div>
                <b class="role-owner">dev</b> <small style="opacity:0.5;">[Владелец]</small>
            </div>
            <span style="font-size:0.7rem; color:#00C853;">ROOT ACCESS</span>
        </div>
    `;

    // Команда
    let team = JSON.parse(localStorage.getItem('rm_team_data') || "[]");
    team.forEach((member, index) => {
        container.innerHTML += `
            <div class="team-item">
                <div>
                    <b class="role-dev">${member.user}</b> <small style="opacity:0.5;">[${member.role}]</small>
                    <div style="font-size:0.6rem; opacity:0.4;">Добавлен: ${member.date}</div>
                </div>
                <button class="btn btn-outline" style="padding:5px 10px; font-size:0.6rem;" onclick="deleteDev(${index})">УДАЛИТЬ</button>
            </div>
        `;
    });
}

function deleteDev(index) {
    if (confirm("Вы уверены, что хотите аннулировать доступ для этого разработчика?")) {
        let team = JSON.parse(localStorage.getItem('rm_team_data') || "[]");
        team.splice(index, 1);
        localStorage.setItem('rm_team_data', JSON.stringify(team));
        renderTeamList();
    }
}

// ============================================
// ИНТЕРФЕЙСНЫЕ ФУНКЦИИ
// ============================================
function openTab(evt, tabName) {
    const content = document.getElementsByClassName("tab-content");
    for (let i = 0; i < content.length; i++) content[i].style.display = "none";

    const buttons = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < buttons.length; i++) buttons[i].className = buttons[i].className.replace(" active", "");

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

function showNotify() {
    const n = document.getElementById('saveStatus');
    n.classList.add('show');
    setTimeout(() => n.classList.remove('show'), 2000);
}

function logout() {
    sessionStorage.clear();
    location.reload();
}

// Проверка сессии при загрузке
window.onload = () => {
    if (sessionStorage.getItem('rm_auth_state') === 'active') {
        const info = JSON.parse(sessionStorage.getItem('rm_admin_info'));
        startSession(info.user, info.role);
    }
};

// Авто-сохранение всех инпутов
document.addEventListener('input', (e) => {
    if (e.target.classList.contains('form-input')) saveData();
});
