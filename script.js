// ============================================
// ЗАГРУЗКА КОНФИГА
// ============================================
var CFG = window.SITE_CONFIG || {
    online: 0, slots: 1000, ping: 0, accounts: 15200,
    status: 'tech', serverName: 'Moscow'
};
var STATUSES = window.SERVER_STATUSES || {};

// ============================================
// PRELOADER
// ============================================
window.addEventListener('load', function () {
    setTimeout(function () {
        var pre = document.getElementById('preloader');
        if (pre) pre.classList.add('hide');
    }, 1500);
});

// ============================================
// NAVBAR SCROLL
// ============================================
var navbar = document.getElementById('navbar');
var toTop = document.getElementById('toTop');

window.addEventListener('scroll', function () {
    if (!navbar) return;
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    if (toTop) {
        if (window.scrollY > 500) toTop.classList.add('show');
        else toTop.classList.remove('show');
    }
});

// ============================================
// HAMBURGER MENU
// ============================================
function toggleMobile() {
    var h = document.getElementById('hamburger');
    var m = document.getElementById('mobileNav');
    if (!h || !m) return;
    h.classList.toggle('open');
    m.classList.toggle('open');
    document.body.style.overflow = m.classList.contains('open') ? 'hidden' : '';
}

function closeMobile() {
    var h = document.getElementById('hamburger');
    var m = document.getElementById('mobileNav');
    if (!h || !m) return;
    h.classList.remove('open');
    m.classList.remove('open');
    document.body.style.overflow = '';
}

function goTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// REVEAL ON SCROLL
// ============================================
var revealEls = document.querySelectorAll('.reveal');

function checkReveal() {
    revealEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 80) {
            el.classList.add('visible');
        }
    });
}

window.addEventListener('scroll', checkReveal);
window.addEventListener('load', checkReveal);

// ============================================
// ПРИМЕНЕНИЕ КОНФИГА К САЙТУ
// ============================================
function applyConfig() {
    // Онлайн
    var onlineEls = [
        document.getElementById('cntOnline'),
        document.getElementById('srvOnline')
    ];
    onlineEls.forEach(function(el) {
        if (el) el.textContent = CFG.online;
    });

    // Слоты
    var slotsEls = document.querySelectorAll('[data-slots]');
    slotsEls.forEach(function(el) { el.textContent = CFG.slots; });

    // Пинг
    var pingEls = document.querySelectorAll('[data-ping]');
    pingEls.forEach(function(el) { el.textContent = CFG.ping + 'ms'; });

    // Полоска заполнения
    var fill = document.getElementById('srvFill');
    var percent = document.getElementById('srvPercent');
    if (fill) {
        var pct = Math.min(Math.round((CFG.online / CFG.slots) * 100), 100);
        fill.style.width = pct + '%';
        if (percent) percent.textContent = pct;
    }

    // Статус сервера
    applyStatus();

    // Доп данные
    var nameEl = document.querySelectorAll('[data-server-name]');
    nameEl.forEach(function(el) { el.textContent = CFG.serverName; });
}

function applyStatus() {
    var status = STATUSES[CFG.status] || STATUSES.online;
    if (!status) return;

    // Hero tag
    var heroTag = document.querySelector('.hero-tag');
    if (heroTag) {
        var pulse = heroTag.querySelector('.pulse');
        heroTag.style.background = status.bgColor;
        heroTag.style.borderColor = status.borderColor;
        heroTag.style.color = status.color;
        if (pulse) pulse.style.background = status.color;

        // Обновить текст после .pulse
        var textNode = heroTag.childNodes[heroTag.childNodes.length - 1];
        if (textNode && textNode.nodeType === 3) {
            textNode.textContent = ' ' + status.label;
        } else {
            heroTag.innerHTML = '<span class="pulse" style="background:' + status.color + '"></span> ' + status.label;
        }
    }

    // Server badge
    var srvBadge = document.querySelector('.server-badge');
    if (srvBadge) {
        var dot = srvBadge.querySelector('.dot');
        srvBadge.style.background = status.bgColor;
        srvBadge.style.borderColor = status.borderColor;
        srvBadge.style.color = status.color;
        if (dot) dot.style.background = status.color;

        var textNode = srvBadge.childNodes[srvBadge.childNodes.length - 1];
        if (textNode && textNode.nodeType === 3) {
            textNode.textContent = ' ' + status.label;
        } else {
            srvBadge.innerHTML = '<span class="dot" style="background:' + status.color + '"></span> ' + status.label;
        }
    }

    // Скрыть/показать полоску заполнения
    var fillBar = document.querySelector('.server-fill-bar');
    if (fillBar) {
        fillBar.style.display = status.showFillBar ? 'block' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    applyConfig();
    setTimeout(applyConfig, 100); // Повторное применение после загрузки DOM
});

// ============================================
// АВТО-ОБНОВЛЕНИЕ КОНФИГА
// Если в админке поменяли - сайт сразу обновится
// ============================================
window.addEventListener('storage', function(e) {
    if (e.key === 'rm_config') {
        try {
            CFG = JSON.parse(e.newValue);
            window.SITE_CONFIG = CFG;
            applyConfig();
        } catch(err) {}
    }
});

// Каждые 3 секунды проверяем обновления (для той же вкладки)
setInterval(function() {
    var saved = localStorage.getItem('rm_config');
    if (saved) {
        try {
            var newCfg = JSON.parse(saved);
            if (JSON.stringify(newCfg) !== JSON.stringify(CFG)) {
                CFG = newCfg;
                window.SITE_CONFIG = CFG;
                applyConfig();
            }
        } catch(err) {}
    }
}, 3000);
