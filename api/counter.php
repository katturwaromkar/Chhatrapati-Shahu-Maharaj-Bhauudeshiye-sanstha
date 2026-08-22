<?php
/* ==========================================================================
   Chhatrapati Shahu Maharaj Bahuuddeshiya Sanstha
   Real-Time Global Visitor Counter API (For Hostinger / Cloud Server)
   ========================================================================== */

// Unrestricted CORS headers for multi-device & mobile access
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["status" => "CORS_OK"]);
    exit();
}

$dataDir = __DIR__ . '/data';
$counterFile = $dataDir . '/counter.json';

if (!file_exists($dataDir)) {
    @mkdir($dataDir, 0777, true);
}

// Initial count starting at realistic base (5,420 visits)
$initialCount = 5420;

if (!file_exists($counterFile)) {
    @file_put_contents($counterFile, json_encode(["count" => $initialCount]));
}

$data = json_decode(@file_get_contents($counterFile), true) ?: ["count" => $initialCount];

// Increment counter on POST or GET query parameter action=hit
$isHit = isset($_GET['action']) && $_GET['action'] === 'hit';

if ($_SERVER['REQUEST_METHOD'] === 'POST' || $isHit) {
    $data['count'] = intval($data['count']) + 1;
    @file_put_contents($counterFile, json_encode($data, JSON_PRETTY_PRINT));
}

echo json_encode([
    "success" => true,
    "count" => intval($data['count']),
    "formatted" => number_format(intval($data['count']))
]);
exit();

