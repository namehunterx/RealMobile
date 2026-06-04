// REAL MOBILE - SIMPLE ADMIN
const ADMIN_DATA = {
    user: "dev",
    pass: "dev123"
};

const STATUS_LIST = {
    online: { label: "ОНЛАЙН", color: "#00C853" },
    tech: { label: "ТЕХ.РАБОТЫ", color: "#FF9800" },
    closed: { label: "ЗАКРЫТ", color: "#E31C25" },
    update: { label: "ОБНОВЛЕНИЕ", color: "#2196F3" },
    restart: { label: "РЕСТАРТ", color: "#FFC107" }
};

// 1. Открытие по коду rmadmin
let keys = "";
document.addEventListener('keydown', e => {
    keys += e.key.toLowerCase();
    if (keys.length > 7) keys = keys.substring(1);
    if (keys === "rmadmin") {
        document.getElementById('fake404').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        keys = "";
    }
});

// 2. Вход (Простой вариант)
document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const u = document.getElementById('loginUser').value;
    const p = document.getElementById('loginPass').value;

    if (u === ADMIN_DATA.user && p === ADMIN_DATA.pass) {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        loadData();
    } else {
        alert("Неверный логин или пароль!");
    }
});

// 3. Загрузка и сохранение
function loadData() {
    let cfg = JSON.parse(localStorage.getItem('rm_config')) || window.SITE_CONFIG;

    document.getElementById('cfgOnline').value = cfg.online;
    document.getElementById('cfgSlots').value = cfg.slots;
    document.getElementById('cfgPing').value = cfg.ping;
    document.getElementById('cfgName').value = cfg.serverName;
    document.getElementById('cfgAccs').value = cfg.accounts;
    document.getElementById('cfgCars').value = cfg.cars;
    document.getElementById('cfgHouses').value = cfg.houses;
    document.getElementById('cfgVer').value = cfg.version;

    renderStatuses(cfg.status);
}

function renderStatuses(current) {
    const grid = document.getElementById('statusGrid');
    grid.innerHTML = "";
    Object.keys(STATUS_LIST).forEach(key => {
        const s = STATUS_LIST[key];
        const btn = document.createElement('button');
        btn.className = "status-btn" + (current === key ? " active" : "");
        btn.style.color = s.color;
        btn.innerText = s.label;
        btn.onclick = () => {
            let cfg = JSON.parse(localStorage.getItem('rm_config')) || window.SITE_CONFIG;
            cfg.status = key;
            localStorage.setItem('rm_config', JSON.stringify(cfg));
            renderStatuses(key);
            showHint();
        };
        grid.appendChild(btn);
    });
}

function saveAll() {
    let cfg = JSON.parse(localStorage.getItem('rm_config')) || window.SITE_CONFIG;
    
    cfg.online = document.getElementById('cfgOnline').value;
    cfg.slots = document.getElementById('cfgSlots').value;
    cfg.ping = document.getElementById('cfgPing').value;
    cfg.serverName = document.getElementById('cfgName').value;
    cfg.accounts = document.getElementById('cfgAccs').value;
    cfg.cars = document.getElementById('cfgCars').value;
    cfg.houses = document.getElementById('cfgHouses').value;
    cfg.version = document.getElementById('cfgVer').value;

    localStorage.setItem('rm_config', JSON.stringify(cfg));
    showHint();
}

function switchTab(e, id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    e.currentTarget.classList.add('active');
}

function showHint() {
    const h = document.getElementById('saveHint');
    h.style.display = 'block';
    setTimeout(() => h.style.display = 'none', 1500);
}
