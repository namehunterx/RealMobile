// ============================================
// REAL MOBILE - АДМИН ПАНЕЛЬ
// ============================================

// ============================================
// 🔐 НАСТРОЙКИ ДОСТУПА (МЕНЯЙ ЗДЕСЬ)
// ============================================
var ADMIN_USER = "admin";
var ADMIN_PASS = "RealMobile2026!";
var ADMIN_PIN = "247365";

var SECRET_KEYS = ['r', 'm', 'a', 'd', 'm', 'i', 'n'];
var SESSION_MINUTES = 30;
var MAX_ATTEMPTS = 3;
var BLOCK_MINUTES = 5;

// ============================================
// СЕКРЕТНАЯ КОМБИНАЦИЯ КЛАВИШ
// ============================================
var keyBuffer = [];
var keyTimer = null;

document.addEventListener('keydown', function(e) {
    if (document.getElementById('loginScreen').classList.contains('show')) return;
    if (document.getElementById('adminPanel').classList.contains('show')) return;

    var key = e.key.toLowerCase();
    keyBuffer.push(key);

    clearTimeout(keyTimer);
    keyTimer = setTimeout(function() { keyBuffer = []; }, 3000);

    if (keyBuffer.length > SECRET_KEYS.length) {
        keyBuffer = keyBuffer.slice(-SECRET_KEYS.length);
    }

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
// БЛОКИРОВКА
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

    if (!info || !btn) return;

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
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var errorEl = document.getElementById('loginError');
    errorEl.classList.remove('show');

    // Проверка блокировки
    if (getBlockInfo()) {
        errorEl.textContent = '⛔ Слишком много неудачных попыток. Подождите.';
        errorEl.classList.add('show');
        return;
    }

    var user = document.getElementById('loginUser').value.trim();
    var pass = document.getElementById('loginPass').value;
    var pin = document.getElementById('loginPin').value.trim();

    // Проверяем что поля не пустые
    if (!user || !pass || !pin) {
        errorEl.textContent = '❌ Заполните все поля';
        errorEl.classList.add('show');
        return;
    }

    var btn = document.getElementById('loginBtn');
    btn.disabled = true;
    btn.textContent = 'Проверка...';

    // Задержка против перебора
    setTimeout(function() {
        if (user === ADMIN_USER && pass === ADMIN_PASS && pin === ADMIN_PIN) {
            // ✅ Успех
            localStorage.removeItem('rm_attempts');
            createSession();
            openPanel();
        } else {
            // ❌ Неудача
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

            document.getElementById('loginPass').value = '';
            document.getElementById('loginPin').value = '';
            updateAttemptsInfo();
        }
    }, 800);
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
        var el = document.getElementById('loginTime');
        if (el) el.value = d.toLocaleString('ru-RU');
    }
}

// Проверка при загрузке страницы
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
// ЗАГРУЗКА ДАННЫХ
// ============================================
function loadAdminData() {
    var cfg = window.SITE_CONFIG;

    // Безопасная установка значений
    function setVal(id, val) {
        var el = document.getElementById(id);
        if (el) el.value = val;
    }

    setVal('cfgOnline', cfg.online);
    setVal('cfgSlots', cfg.slots);
    setVal('cfgPing', cfg.ping);
    setVal('cfgServerName', cfg.serverName);
    setVal('cfgAccounts', cfg.accounts);
    setVal('cfgCars', cfg.cars);
    setVal('cfgHouses', cfg.houses);
    setVal('cfgJobs', cfg.jobs);
    setVal('cfgSupport', cfg.support);
    setVal('cfgVersion', cfg.version);
    setVal('cfgApkSize', cfg.apkSize);

    renderStatusButtons();
    updateQuickStats();
    updatePreview();

    // Авто-сохранение при изменении
    document.querySelectorAll('.form-input').forEach(function(inp) {
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
    if (!grid) return;
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

    var dot = preview.querySelector('.dot');
    var text = preview.querySelector('.text');
    if (dot) dot.style.background = st.color;
    if (text) text.textContent = st.label;
}

// ============================================
// СОХРАНЕНИЕ
// ============================================
function saveData() {
    var cfg = window.SITE_CONFIG;

    function getVal(id, fallback, isNum) {
        var el = document.getElementById(id);
        if (!el) return fallback;
        return isNum ? (parseInt(el.value) || fallback) : (el.value || fallback);
    }

    cfg.online     = getVal('cfgOnline', 0, true);
    cfg.slots      = getVal('cfgSlots', 1000, true);
    cfg.ping       = getVal('cfgPing', 0, true);
    cfg.serverName = getVal('cfgServerName', 'Moscow', false);
    cfg.accounts   = getVal('cfgAccounts', 0, true);
    cfg.cars       = getVal('cfgCars', '0', false);
    cfg.houses     = getVal('cfgHouses', '0', false);
    cfg.jobs       = getVal('cfgJobs', '0', false);
    cfg.support    = getVal('cfgSupport', '24/7', false);
    cfg.version    = getVal('cfgVersion', '1.0.0', false);
    cfg.apkSize    = getVal('cfgApkSize', '~680 MB', false);

    localStorage.setItem('rm_config', JSON.stringify(cfg));
    updateQuickStats();
    showSaved();
}

function updateQuickStats() {
    var cfg = window.SITE_CONFIG;
    var st = window.SERVER_STATUSES[cfg.status];

    var qsOnline = document.getElementById('qsOnline');
    var qsSlots = document.getElementById('qsSlots');
    var qsStatus = document.getElementById('qsStatus');

    if (qsOnline) qsOnline.textContent = cfg.online;
    if (qsSlots) qsSlots.textContent = cfg.slots;
    if (qsStatus) qsStatus.textContent = st ? st.label : '-';
}

function showSaved() {
    var el = document.getElementById('saveStatus');
    if (!el) return;
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
            var el = document.getElementById('cfgOnline');
            if (el) el.value = 0;
            saveData();
        }
    } else if (act === 'max_online') {
        cfg.online = cfg.slots;
        var el = document.getElementById('cfgOnline');
        if (el) el.value = cfg.slots;
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
        .then(function(r) { return r.json(); })
        .then(function(d) { el.value = d.ip; })
        .catch(function() { el.value = 'Недоступно'; });
}
