// REAL MOBILE - ADMIN CORE
const MASTER = {
    user: "dev",
    hash: "0bfcf3c69af9e53644dd8cf1d060900652246fa283285daa769feb09f4afa999", // real2026
    pin: "1289"
};

const STATS_MAP = {
    online: "Онлайн",
    tech: "Тех.Работы",
    closed: "Закрыт",
    update: "Обновление",
    restart: "Рестарт"
};

// 1. Хэширование
async function calcHash(str) {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 2. Открытие по коду
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

// 3. Логика входа
document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const u = document.getElementById('loginUser').value;
    const p = document.getElementById('loginPass').value;
    const n = document.getElementById('loginPin').value;

    const h = await calcHash(p);

    if (u === MASTER.user && h === MASTER.hash && n === MASTER.pin) {
        showPanel();
    } else {
        // Проверка команды
        let team = JSON.parse(localStorage.getItem('rm_team') || "[]");
        let dev = team.find(a => a.user === u && a.pass === p && a.pin === n);
        if (dev) showPanel();
        else alert("ОШИБКА");
    }
});

function showPanel() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadAdminData();
}

// 4. Работа с данными
function loadAdminData() {
    let cfg = JSON.parse(localStorage.getItem('rm_config')) || window.SITE_CONFIG || {};
    
    document.getElementById('cfgOnline').value = cfg.online || 0;
    document.getElementById('cfgSlots').value = cfg.slots || 1000;
    document.getElementById('cfgPing').value = cfg.ping || 0;
    document.getElementById('cfgCity').value = cfg.serverName || "Moscow";
    document.getElementById('cfgAccs').value = cfg.accounts || 0;
    document.getElementById('cfgCars').value = cfg.cars || "150+";
    document.getElementById('cfgHouses').value = cfg.houses || "200+";

    const grid = document.getElementById('statusGrid');
    grid.innerHTML = "";
    Object.keys(STATS_MAP).forEach(key => {
        const btn = document.createElement('button');
        btn.className = "status-btn" + (cfg.status === key ? " active" : "");
        btn.innerText = STATS_MAP[key];
        btn.onclick = () => {
            cfg.status = key;
            localStorage.setItem('rm_config', JSON.stringify(cfg));
            loadAdminData();
            triggerSave();
        };
        grid.appendChild(btn);
    });

    renderTeam();
}

function saveAll() {
    let cfg = JSON.parse(localStorage.getItem('rm_config')) || window.SITE_CONFIG;
    cfg.online = document.getElementById('cfgOnline').value;
    cfg.slots = document.getElementById('cfgSlots').value;
    cfg.ping = document.getElementById('cfgPing').value;
    cfg.serverName = document.getElementById('cfgCity').value;
    cfg.accounts = document.getElementById('cfgAccs').value;
    cfg.cars = document.getElementById('cfgCars').value;
    cfg.houses = document.getElementById('cfgHouses').value;

    localStorage.setItem('rm_config', JSON.stringify(cfg));
    triggerSave();
}

function triggerSave() {
    const h = document.getElementById('saveHint');
    h.style.display = 'block';
    setTimeout(() => h.style.display = 'none', 2000);
}

// 5. Команда
function addDev() {
    const name = prompt("Ник разработчика:");
    if (!name) return;
    const pass = Math.random().toString(36).slice(-8);
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    
    let team = JSON.parse(localStorage.getItem('rm_team') || "[]");
    team.push({ user: name, pass: pass, pin: pin });
    localStorage.setItem('rm_team', JSON.stringify(team));
    
    alert(`СОЗДАНО!\nЛогин: ${name}\nПароль: ${pass}\nPIN: ${pin}`);
    renderTeam();
}

function renderTeam() {
    const list = document.getElementById('teamList');
    list.innerHTML = `<div class="team-item"><span>dev [Владелец]</span></div>`;
    let team = JSON.parse(localStorage.getItem('rm_team') || "[]");
    team.forEach((a, i) => {
        list.innerHTML += `<div class="team-item"><span>${a.user} [Разработчик]</span> <button onclick="delDev(${i})" style="background:red; border:none; color:#fff; border-radius:4px; cursor:pointer;">X</button></div>`;
    });
}

function delDev(i) {
    let team = JSON.parse(localStorage.getItem('rm_team') || "[]");
    team.splice(i, 1);
    localStorage.setItem('rm_team', JSON.stringify(team));
    renderTeam();
}

function switchTab(e, id) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    e.currentTarget.classList.add('active');
}
