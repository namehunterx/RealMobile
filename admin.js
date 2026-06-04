// ============================================
// REAL MOBILE - АДМИН ПАНЕЛЬ
// ============================================

// ============================================
// 🔐 НАСТРОЙКИ ДОСТУПА (МЕНЯЙ ЗДЕСЬ)
// ============================================
// Логин
var ADMIN_USER = "admin";

// Пароль (в SHA-256). По умолчанию: RealMobile2026!
// Чтобы изменить — открой https://emn178.github.io/online-tools/sha256.html
// введи свой пароль и вставь хэш сюда
var ADMIN_PASS_HASH = "04dd1d9b22eadcaba7e8b89b29c26f618a78bbfdc5295d63e610dc26d5f0df0f";

// PIN (6 цифр). По умолчанию: 247365
var ADMIN_PIN = "247365";

// Секретная комбинация клавиш для появления формы входа
// По умолчанию: R M A D M I N (быстро)
var SECRET_KEYS = ['r', 'm', 'a', 'd', 'm', 'i', 'n'];

// Время сессии в минутах
var SESSION_MINUTES = 30;

// Макс. попыток входа
var MAX_ATTEMPTS = 999;
// Время блокировки в минутах
var BLOCK_MINUTES = 0;

// ============================================
// ⚠️ ВАЖНО: По умолчанию доступы такие
// Логин: admin
// Пароль: RealMobile2026!
// PIN: 247365
// ============================================

// ============================================
// SHA-256 функция
// ============================================
async function sha256(str) {
    var buf = new TextEncoder().encode(str);
    var hashBuf = await crypto.subtle.digest('SHA-256', buf);
    var arr = Array.from(new Uint8Array(hashBuf));
    return arr.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================
// СЕКРЕТНАЯ КОМБИНАЦИЯ КЛАВИШ
// ============================================
var keyBuffer = [];
var keyTimer = null;

document.addEventListener('keydown', function(e) {
    // Игнорируем если уже видна форма входа или панель
    if (document.getElementById('loginScreen').classList.contains('show')) return;
    if (document.getElementById('adminPanel').classList.contains('show')) return;

    var key = e.key.toLowerCase();
    keyBuffer.push(key);

    // Сбрасываем буфер через 3 секунды
    clearTimeout(keyTimer);
    keyTimer = setTimeout(function() { keyBuffer = []; }, 3000);

    // Ограничиваем размер буфера
    if (keyBuffer.length > SECRET_KEYS.length) {
        keyBuffer = keyBuffer.slice(-SECRET_KEYS.length);
    }

    // Проверяем совпадение
    if (keyBuffer.length === SECRET_KEYS.length) {
        var match = true;
        for (var i = 0; i < SECRET_KEYS.length; i++) {
            if (keyBuffer[i] !== SECRET_KEYS[i]) { match = false; break; }
        }
        if (match) {
            showLogin();
            keyBuffer = [];
        }
    }
});

function showLogin() {
    document.getElementById('fake404').style.display = 'none';
    document.getElementById('loginScreen').classList.add('show');
    setTimeout(function() {
        document.getElementById('loginUser').focus();
    }, 300);
}

// ============================================
// ПРОВЕРКА БЛОКИРОВКИ
// ============================================
function getBlockInfo() {
    var data = localStorage.getItem('rm_block');
    if (!data) return null;
    try {
        var parsed = JSON.parse(data);
        if (Date.now() > parsed.until) {
            localStorage.removeItem('rm_block');
            return null;
        }
        return parsed;
    } catch(e) { return null; }
}

function getAttempts() {
    var n = parseInt(localStorage.getItem('rm_attempts') || '0');
    return isNaN(n) ? 0 : n;
}

function updateAttemptsInfo() {
    var block = getBlockInfo();
    var info = document.getElementById('attemptsInfo');
    var btn = document.getElementById('loginBtn');

    if (block) {
        var left = Math.ceil((block.until - Date.now()) / 1000);
        var min = Math.floor(left / 60);
        var sec = left % 60;
        info.textContent = '⛔ Блокировка: ' + min + ':' + (sec < 10 ? '0' + sec : sec);
        info.style.color = 'var(--primary)';
        btn.disabled = true;
        btn.textContent = 'Заблокировано';
    } else {
        var attempts = getAttempts();
        if (attempts > 0) {
            info.textContent = 'Осталось попыток: ' + (MAX_ATTEMPTS - attempts);
        } else {
            info.textContent = '';
        }
        btn.disabled = false;
        btn.textContent = 'Войти в систему';
    }
}

setInterval(updateAttemptsInfo, 1000);
updateAttemptsInfo();

// ============================================
// ФОРМА ВХОДА
// ============================================
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    var errorEl = document.getElementById('loginError');
    errorEl.classList.remove('show');

    // Проверка блокировки
    if (getBlockInfo()) {
        errorEl.textContent = '⛔ Слишком много неудачных попыток. Подождите.';
        errorEl.classList.add('show');
        return;
    }

    // Honeypot - если бот заполнил
    if (this.querySelector('[name="username_check"]').value) {
        errorEl.textContent = '❌ Ошибка валидации';
        errorEl.classList.add('show');
        return;
    }

    var user = document.getElementById('loginUser').value.trim();
    var pass = document.getElementById('loginPass').value;
    var pin = document.getElementById('loginPin').value.trim();

    var btn = document.getElementById('loginBtn');
    btn.disabled = true;
    btn.textContent = 'Проверка...';

    // Хэшируем введенный пароль
    var passHash = await sha256(pass);

    // Задержка для защиты от перебора
    await new Promise(r => setTimeout(r, 800));

    if (user === ADMIN_USER && passHash === ADMIN_PASS_HASH && pin === ADMIN_PIN) {
        // Успешно
        localStorage.removeItem('rm_attempts');
        createSession();
        openPanel();
    } else {
        // Неудача
        var attempts = getAttempts() + 1;
        localStorage.setItem('rm_attempts', attempts);

        if (attempts >= MAX_ATTEMPTS) {
            localStorage.setItem('rm_block', JSON.stringify({
                until: Date.now() + BLOCK_MINUTES * 60 * 1000
            }));
            localStorage.removeItem('rm_attempts');
            errorEl.textContent = '⛔ Превышено количество попыток. Блокировка на ' + BLOCK_MINUTES + ' мин.';
        } else {
            errorEl.textContent = '❌ Неверные данные. Попыток осталось: ' + (MAX_ATTEMPTS - attempts);
        }
        errorEl.classList.add('show');
        btn.disabled = false;
        btn.textContent = 'Войти в систему';

        // Очищаем поля
        document.getElementById('loginPass').value = '';
        document.getElementById('loginPin').value = '';
        updateAttemptsInfo();
    }
});

// ============================================
// СЕССИЯ
// ============================================
function createSession() {
    var session = {
        user: ADMIN_USER,
        loginTime: Date.now(),
        expires: Date.now() + SESSION_MINUTES * 60 * 1000
    };
    sessionStorage.setItem('rm_session', JSON.stringify(session));
}

function checkSession() {
    var data = sessionStorage.getItem('rm_session');
    if (!data) return false;
    try {
        var s = JSON.parse(data);
        if (Date.now() > s.expires) {
            sessionStorage.removeItem('rm_session');
            return false;
        }
        return s;
    } catch(e) { return false; }
}

function logout() {
    sessionStorage.removeItem('rm_session');
    location.reload();
}

function clearAllSessions() {
    if (confirm('Удалить все сессии и попытки входа?')) {
        sessionStorage.clear();
        localStorage.removeItem('rm_block');
        localStorage.removeItem('rm_attempts');
        alert('✅ Очищено');
        location.reload();
    }
}

// ============================================
// ОТКРЫТИЕ ПАНЕЛИ
// ============================================
function openPanel() {
    document.getElementById('fake404').style.display = 'none';
    document.getElementById('loginScreen').classList.remove('show');
    document.getElementById('adminPanel').classList.add('show');

    loadAdminData();
    startSessionTimer();
    fetchIP();

    var session = checkSession();
    if (session) {
        var d = new Date(session.loginTime);
        document.getElementById('loginTime').value = d.toLocaleString('ru-RU');
    }
}

// Проверка при загрузке - если сессия активна, сразу открываем
window.addEventListener('load', function() {
    if (checkSession()) {
        openPanel();
    }
});

// ============================================
// ТАЙМЕР СЕССИИ
// ============================================
function startSessionTimer() {
    setInterval(function() {
        var session = checkSession();
        if (!session) {
            alert('⏱️ Сессия истекла. Войдите снова.');
            location.reload();
            return;
        }
        var left = Math.floor((session.expires - Date.now()) / 1000);
        var min = Math.floor(left / 60);
        var sec = left % 60;
        var el = document.getElementById('sessionTime');
        if (el) {
            el.textContent = (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
        }
    }, 1000);
}

// ============================================
// ЗАГРУЗКА ДАННЫХ В ФОРМЫ
// ============================================
function loadAdminData() {
    var cfg = window.SITE_CONFIG;

    document.getElementById('cfgOnline').value = cfg.online;
    document.getElementById('cfgSlots').value = cfg.slots;
    document.getElementById('cfgPing').value = cfg.ping;
    document.getElementById('cfgServerName').value = cfg.serverName;
    document.getElementById('cfgAccounts').value = cfg.accounts;
    document.getElementById('cfgCars').value = cfg.cars;
    document.getElementById('cfgHouses').value = cfg.houses;
    document.getElementById('cfgJobs').value = cfg.jobs;
    document.getElementById('cfgSupport').value = cfg.support;
    document.getElementById('cfgVersion').value = cfg.version;
    document.getElementById('cfgApkSize').value = cfg.apkSize;

    renderStatusButtons();
    updateQuickStats();
    updatePreview();

    // Auto-save при изменении
    var inputs = document.querySelectorAll('.form-input');
    inputs.forEach(function(inp) {
        inp.addEventListener('input', function() {
            saveData();
        });
    });
}

// ============================================
// КНОПКИ СТАТУСА
// ============================================
function renderStatusButtons() {
    var grid = document.getElementById('statusGrid');
    var cfg = window.SITE_CONFIG;
    grid.innerHTML = '';

    Object.keys(window.SERVER_STATUSES).forEach(function(key) {
        var st = window.SERVER_STATUSES[key];
        var btn = document.createElement('button');
        btn.className = 'status-btn' + (cfg.status === key ? ' active' : '');
        btn.innerHTML = '<span class="dot-mini" style="background:' + st.color + '"></span> ' + st.label;
        if (cfg.status === key) {
            btn.style.background = st.bgColor;
            btn.style.borderColor = st.borderColor;
            btn.style.color = st.color;
        }
        btn.onclick = function() {
            cfg.status = key;
            saveData();
            renderStatusButtons();
            updatePreview();
        };
        grid.appendChild(btn);
    });
}

function updatePreview() {
    var cfg = window.SITE_CONFIG;
    var st = window.SERVER_STATUSES[cfg.status];
    var preview = document.getElementById('statusPreview');
    if (!st || !preview) return;

    preview.style.background = st.bgColor;
    preview.style.borderColor = st.borderColor;
    preview.style.border = '1px solid ' + st.borderColor;
    preview.style.color = st.color;
    preview.querySelector('.dot').style.background = st.color;
    preview.querySelector('.text').textContent = st.label;
}

// ============================================
// СОХРАНЕНИЕ
// ============================================
function saveData() {
    var cfg = window.SITE_CONFIG;

    cfg.online = parseInt(document.getElementById('cfgOnline').value) || 0;
    cfg.slots = parseInt(document.getElementById('cfgSlots').value) || 1000;
    cfg.ping = parseInt(document.getElementById('cfgPing').value) || 0;
    cfg.serverName = document.getElementById('cfgServerName').value || 'Moscow';
    cfg.accounts = parseInt(document.getElementById('cfgAccounts').value) || 0;
    cfg.cars = document.getElementById('cfgCars').value || '0';
    cfg.houses = document.getElementById('cfgHouses').value || '0';
    cfg.jobs = document.getElementById('cfgJobs').value || '0';
    cfg.support = document.getElementById('cfgSupport').value || '24/7';
    cfg.version = document.getElementById('cfgVersion').value || '1.0.0';
    cfg.apkSize = document.getElementById('cfgApkSize').value || '~680 MB';

    localStorage.setItem('rm_config', JSON.stringify(cfg));
    updateQuickStats();
    showSaved();
}

function updateQuickStats() {
    var cfg = window.SITE_CONFIG;
    document.getElementById('qsOnline').textContent = cfg.online;
    document.getElementById('qsSlots').textContent = cfg.slots;
    var st = window.SERVER_STATUSES[cfg.status];
    document.getElementById('qsStatus').textContent = st ? st.label : '-';
}

function showSaved() {
    var el = document.getElementById('saveStatus');
    el.classList.add('show');
    clearTimeout(window._saveTimer);
    window._saveTimer = setTimeout(function() {
        el.classList.remove('show');
    }, 1500);
}

// ============================================
// ВКЛАДКИ
// ============================================
function switchTab(name) {
    document.querySelectorAll('.admin-tab').forEach(function(t) {
        t.classList.toggle('active', t.dataset.tab === name);
    });
    document.querySelectorAll('.tab-content').forEach(function(t) {
        t.classList.toggle('active', t.id === 'tab-' + name);
    });
}

// ============================================
// БЫСТРЫЕ ДЕЙСТВИЯ
// ============================================
function quickAction(act) {
    var cfg = window.SITE_CONFIG;

    if (act === 'reset_online') {
        if (confirm('Сбросить онлайн до 0?')) {
            cfg.online = 0;
            document.getElementById('cfgOnline').value = 0;
            saveData();
        }
    } else if (act === 'max_online') {
        cfg.online = cfg.slots;
        document.getElementById('cfgOnline').value = cfg.slots;
        saveData();
    } else if (act === 'reset_all') {
        if (confirm('⚠️ Сбросить ВСЕ настройки сайта?')) {
            localStorage.removeItem('rm_config');
            alert('✅ Сброшено. Перезагрузка...');
            location.reload();
        }
    }
}

// ============================================
// IP
// ============================================
function fetchIP() {
    var el = document.getElementById('userIP');
    if (!el) return;
    fetch('https://api.ipify.org?format=json')
        .then(r => r.json())
        .then(d => { el.value = d.ip; })
        .catch(() => { el.value = 'Недоступно'; });
}
