<?php
/* ==========================================================================
   Chhatrapati Shahu Maharaj Bahuuddeshiya Sanstha
   Cross-Device Shared Patient Database API (For Hostinger / Cloud Hosting)
   ========================================================================== */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dataDir = __DIR__ . '/data';
$dataFile = $dataDir . '/patients.json';

// Ensure data directory exists
if (!file_exists($dataDir)) {
    mkdir($dataDir, 0777, true);
}

// Initial sample data if file does not exist
if (!file_exists($dataFile)) {
    $initialData = [
        [
            "regId" => "REG-PAT-2026-1001",
            "name" => "रामेश्वर तुकाराम शिंदे (Rameshwar T. Shinde)",
            "gender" => "पुरुष",
            "age" => "42",
            "phone" => "9823456789",
            "emergencyPhone" => "9823456790",
            "bloodGroup" => "O+",
            "aadhaar" => "XXXX-XXXX-4589",
            "pan" => "ABCDE1234F",
            "address" => "प्लॉट नं. 45, नक्षत्रवाडी, छत्रपती संभाजीनगर",
            "city" => "छत्रपती संभाजीनगर",
            "pincode" => "431002",
            "notes" => "ओपीडी सवलतीसाठी रुग्ण नोंदणी, नियमित बीपी तपासणी",
            "regDate" => "2026-08-20",
            "status" => "सक्रिय (ACTIVE)",
            "aadhaarPhoto" => null,
            "panPhoto" => null
        ],
        [
            "regId" => "REG-PAT-2026-1002",
            "name" => "सुनीता विष्णू कांबळे (Sunita V. Kamble)",
            "gender" => "स्त्री",
            "age" => "36",
            "phone" => "9021123456",
            "emergencyPhone" => "9021123457",
            "bloodGroup" => "B+",
            "aadhaar" => "XXXX-XXXX-7812",
            "pan" => "XYZPD9876K",
            "address" => "शिवजी नगर, जळगाव रोड, छत्रपती संभाजीनगर",
            "city" => "छत्रपती संभाजीनगर",
            "pincode" => "431003",
            "notes" => "नेत्र चिकित्सा शिबीर नोंदणी",
            "regDate" => "2026-08-21",
            "status" => "सक्रिय (ACTIVE)",
            "aadhaarPhoto" => null,
            "panPhoto" => null
        ]
    ];
    file_put_contents($dataFile, json_encode($initialData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// GET Request: Return all registered patients across all devices
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $content = file_get_contents($dataFile);
    echo $content ? $content : json_encode([]);
    exit();
}

// POST Request: Save new patient or update existing patient from any device
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $inputJSON = file_get_contents('php://input');
    $inputData = json_decode($inputJSON, true);

    if (!$inputData || !isset($inputData['regId'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid patient data"]);
        exit();
    }

    $existingPatients = json_decode(file_get_contents($dataFile), true) ?: [];

    // Check if updating an existing patient or creating a new patient
    $existingIndex = -1;
    foreach ($existingPatients as $index => $p) {
        if ($p['regId'] === $inputData['regId']) {
            $existingIndex = $index;
            break;
        }
    }

    if ($existingIndex >= 0) {
        // Update existing record
        $existingPatients[$existingIndex] = array_merge($existingPatients[$existingIndex], $inputData);
    } else {
        // Add new patient to top
        array_unshift($existingPatients, $inputData);
    }

    // Save updated shared database
    file_put_contents($dataFile, json_encode($existingPatients, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    echo json_encode([
        "success" => true,
        "message" => "Patient record saved to shared database",
        "patients" => $existingPatients
    ]);
    exit();
}

// DELETE Request: Remove patient record from shared cloud database
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' || (isset($_GET['action']) && $_GET['action'] === 'delete')) {
    $regId = $_GET['regId'] ?? null;
    if (!$regId) {
        $inputJSON = file_get_contents('php://input');
        $inputData = json_decode($inputJSON, true);
        $regId = $inputData['regId'] ?? null;
    }

    if ($regId) {
        $existingPatients = json_decode(file_get_contents($dataFile), true) ?: [];
        $filtered = array_values(array_filter($existingPatients, function($p) use ($regId) {
            return $p['regId'] !== $regId;
        }));
        file_put_contents($dataFile, json_encode($filtered, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode(["success" => true, "message" => "Patient record deleted successfully"]);
        exit();
    }
}

