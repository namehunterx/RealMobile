<?php
// Секретный файл данных проекта Real Mobile
$storageFile = 'site_data.json';

// Если файла нет, создаем его с начальными данными
if (!file_get_rows($storageFile)) {
    $initialData = [
        "config" => [
            "online" => 0,
            "slots" => 1000,
            "ping" => 0,
            "serverName" => "Moscow",
            "status" => "tech",
            "accounts" => 15200,
            "cars" => "150+",
            "houses" => "200+",
            "jobs" => "50+",
            "support" => "24/7",
            "version" => "1.0.0",
            "apkSize" => "~680 MB"
        ],
        "admins" => [
            [
                "user" => "dev",
                "pass" => "real2026",
                "pin" => "1289",
                "role" => "Владелец"
            ],
            [
                "user" => "admin",
                "pass" => "RealMobile2026!",
                "pin" => "247365",
                "role" => "Администратор"
            ]
        ]
    ];
    file_put_contents($storageFile, json_encode($initialData, JSON_UNESCAPED_UNICODE));
}

$data = json_decode(file_get_contents($storageFile), true);
$action = $_GET['action'] ?? '';

// API для получения данных игроками (публично)
if ($action == 'get_config') {
    header('Content-Type: application/json');
    echo json_encode($data['config']);
    exit;
}

// API для входа в админку
if ($action == 'login') {
    $post = json_decode(file_get_contents('php://input'), true);
    foreach ($data['admins'] as $admin) {
        if ($admin['user'] === $post['user'] && $admin['pass'] === $post['pass'] && $admin['pin'] === $post['pin']) {
            session_start();
            $_SESSION['admin_user'] = $admin['user'];
            echo json_encode(["success" => true, "user" => $admin]);
            exit;
        }
    }
    echo json_encode(["success" => false]);
    exit;
}

// API для сохранения конфига (только для авторизованных)
if ($action == 'save_config') {
    session_start();
    if (!isset($_SESSION['admin_user'])) exit;
    $newConfig = json_decode(file_get_contents('php://input'), true);
    $data['config'] = $newConfig;
    file_put_contents($storageFile, json_encode($data, JSON_UNESCAPED_UNICODE));
    echo json_encode(["success" => true]);
    exit;
}

// API для добавления админа
if ($action == 'add_admin') {
    session_start();
    if (!isset($_SESSION['admin_user'])) exit;
    $newAdmin = json_decode(file_get_contents('php://input'), true);
    $data['admins'][] = $newAdmin;
    file_put_contents($storageFile, json_encode($data, JSON_UNESCAPED_UNICODE));
    echo json_encode(["success" => true]);
    exit;
}

function file_get_rows($f) { return file_exists($f) && filesize($f) > 0; }
?>
