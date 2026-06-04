// ============================================
// КОНФИГУРАЦИЯ САЙТА
// Эти данные меняются через админ-панель
// ============================================

// Если в localStorage есть сохраненная конфигурация - берем оттуда
function loadConfig() {
    var saved = localStorage.getItem('rm_config');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch (e) {}
    }
    // Дефолтные значения
    return {
        online: 0,
        slots: 1000,
        ping: 0,
        accounts: 15200,
        status: 'tech',  // online | tech | closed | update | maintenance
        serverName: 'Moscow',
        version: '1.0.0',
        apkSize: '~680 MB',
        // Доп статистика
        cars: '150+',
        houses: '200+',
        jobs: '50+',
        support: '24/7'
    };
}

window.SITE_CONFIG = loadConfig();

// ============================================
// СТАТУСЫ СЕРВЕРА
// ============================================
window.SERVER_STATUSES = {
    online: {
        label: 'Online',
        color: '#00C853',
        bgColor: 'rgba(0, 200, 83, 0.1)',
        borderColor: 'rgba(0, 200, 83, 0.3)',
        showFillBar: true
    },
    tech: {
        label: 'Тех.Работы',
        color: '#FF9800',
        bgColor: 'rgba(255, 152, 0, 0.1)',
        borderColor: 'rgba(255, 152, 0, 0.3)',
        showFillBar: false
    },
    closed: {
        label: 'Закрыт',
        color: '#E31C25',
        bgColor: 'rgba(227, 28, 37, 0.1)',
        borderColor: 'rgba(227, 28, 37, 0.3)',
        showFillBar: false
    },
    update: {
        label: 'Загрузка обновления',
        color: '#2196F3',
        bgColor: 'rgba(33, 150, 243, 0.1)',
        borderColor: 'rgba(33, 150, 243, 0.3)',
        showFillBar: false
    },
    maintenance: {
        label: 'Обслуживание',
        color: '#9C27B0',
        bgColor: 'rgba(156, 39, 176, 0.1)',
        borderColor: 'rgba(156, 39, 176, 0.3)',
        showFillBar: false
    },
    restart: {
        label: 'Перезагрузка',
        color: '#FFC107',
        bgColor: 'rgba(255, 193, 7, 0.1)',
        borderColor: 'rgba(255, 193, 7, 0.3)',
        showFillBar: false
    }
};
