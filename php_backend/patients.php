<?php
/* ==========================================================================
   Chhatrapati Shahu Maharaj Bahuuddeshiya Sanstha
   Cross-Device Shared Patient Database API (For Hostinger / Cloud Hosting)
   ========================================================================== */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(["status" => "CORS_OK"]);
    exit();
}

$dataDir = __DIR__ . '/data';
$dataFile = $dataDir . '/patients.json';

if (!file_exists($dataDir)) {
    @mkdir($dataDir, 0777, true);
}

if (!file_exists($dataFile)) {
    $initialData = [];
    @file_put_contents($dataFile, json_encode($initialData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $content = @file_get_contents($dataFile);
    echo $content ? $content : json_encode([]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputJSON = file_get_contents('php://input');
    $inputData = json_decode($inputJSON, true);

    if (!$inputData || !isset($inputData['regId'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid patient data payload"]);
        exit();
    }

    $existingPatients = json_decode(@file_get_contents($dataFile), true) ?: [];
    $existingIndex = -1;
    foreach ($existingPatients as $index => $p) {
        if (isset($p['regId']) && $p['regId'] === $inputData['regId']) {
            $existingIndex = $index;
            break;
        }
    }

    if ($existingIndex >= 0) {
        $existingPatients[$existingIndex] = array_merge($existingPatients[$existingIndex], $inputData);
    } else {
        array_unshift($existingPatients, $inputData);
    }

    $saved = @file_put_contents($dataFile, json_encode($existingPatients, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode([
        "success" => ($saved !== false),
        "message" => ($saved !== false) ? "Patient record saved to live cloud database" : "Failed to write data file",
        "patients" => $existingPatients
    ]);
    exit();
}
