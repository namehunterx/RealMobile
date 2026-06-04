// ============================================
// КОНФИГУРАЦИЯ
// ============================================
var ONLINE = 0;
var ACCOUNTS = 15200;
var SLOTS = 1000;

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
    if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    if (toTop) {
        if (window.scrollY > 500) {
            toTop.classList.add('show');
        } else {
            toTop.classList.remove('show');
        }
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

// ============================================
// SCROLL TO TOP
// ============================================
function goTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// COUNTER ANIMATION
// ============================================
function animateNum(el, target, duration) {
    if (!el) return;
    var start = 0;
    var startTime = null;

    function step(ts) {
        if (!startTime) startTime = ts;
        var p = Math.min((ts - startTime) / duration, 1);
        var ease = 1 - Math.pow(1 - p, 3);
        var val = Math.floor(start + (target - start) * ease);
        el.textContent = val.toLocaleString('ru-RU');
        if (p < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
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
// SET ONLINE + FILL BAR
// ============================================
function setOnline() {
    var a = document.getElementById('cntOnline');
    var b = document.getElementById('srvOnline');
    var fill = document.getElementById('srvFill');
    var percent = document.getElementById('srvPercent');

    if (a) a.textContent = ONLINE;
    if (b) b.textContent = ONLINE;

    if (fill) {
        var pct = Math.min(Math.round((ONLINE / SLOTS) * 100), 100);
        fill.style.width = pct + '%';
        if (percent) percent.textContent = pct;
    }
}

// ============================================
// COUNTER OBSERVER
// ============================================
var countersStarted = false;

function initCounters() {
    var heroCounters = document.querySelector('.hero-counters');
    if (!heroCounters) return;

    var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting && !countersStarted) {
                countersStarted = true;
                animateNum(document.getElementById('cntOnline'), ONLINE, 2000);
                animateNum(document.getElementById('cntAccounts'), ACCOUNTS, 2500);
                animateNum(document.getElementById('srvOnline'), ONLINE, 2000);

                // Заполнение полоски с задержкой
                setTimeout(function () {
                    setOnline();
                }, 500);
            }
        });
    }, { threshold: 0.3 });

    obs.observe(heroCounters);
}

document.addEventListener('DOMContentLoaded', function () {
    initCounters();

    // Для страниц без hero
    var srvEl = document.getElementById('srvOnline');
    if (srvEl && !document.querySelector('.hero-counters')) {
        setOnline();
    }

    // Заполнение полоски на всех страницах
    setTimeout(setOnline, 800);
});
