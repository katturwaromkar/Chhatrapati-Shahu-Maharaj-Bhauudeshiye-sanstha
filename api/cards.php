<?php
/* ==========================================================================
   Chhatrapati Shahu Maharaj Bahuuddeshiya Sanstha
   Shared Family Health Cards Database API (For Hostinger / Cloud Hosting)
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
$dataFile = $dataDir . '/cards.json';

if (!file_exists($dataDir)) {
    @mkdir($dataDir, 0777, true);
}

if (!file_exists($dataFile)) {
    $initialData = [
        "CSM-2026-5559" => [
            "cardId" => "CSM-2026-5559",
            "name" => "रवींद्र पाथरे",
            "phone" => "9823456789",
            "aadhaar" => "XXXX-XXXX-4589",
            "city" => "छत्रपती संभाजीनगर",
            "issued" => "20 ऑगस्ट 2026",
            "validTill" => "31 मार्च 2027",
            "status" => "सक्रिय (ACTIVE)",
            "members" => ["सुनिता पाथरे (पत्नी)", "अमित पाथरे (मुलगा)"],
            "discount" => "२०% ओपीडी सवलत, २५% लॅब टेस्ट सवलत"
        ]
    ];
    @file_put_contents($dataFile, json_encode($initialData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $content = @file_get_contents($dataFile);
    echo $content ? $content : json_encode(new stdClass());
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputJSON = file_get_contents('php://input');
    $cardData = json_decode($inputJSON, true);

    if (!$cardData || !isset($cardData['cardId'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid card payload"]);
        exit();
    }

    $existingCards = json_decode(@file_get_contents($dataFile), true) ?: [];
    $existingCards[$cardData['cardId']] = $cardData;

    @file_put_contents($dataFile, json_encode($existingCards, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode(["success" => true, "cards" => $existingCards]);
    exit();
}
