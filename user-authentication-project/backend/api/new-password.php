<?php
// api/new-password.php - Change password for authenticated users
require_once(__DIR__ . '/../cors.php');
require_once(__DIR__ . '/../database.php');
session_start();

header("Content-Type: application/json");

// Handle preflight OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Check if user is authenticated
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Du skal være logget ind for at ændre din adgangskode."
    ]);
    exit;
}

// Get and validate input
$input = json_decode(file_get_contents("php://input"), true);
$currentPassword = $input['currentPassword'] ?? '';
$newPassword = $input['newPassword'] ?? '';

// Basic validation
if (empty($currentPassword) || empty($newPassword)) {
    echo json_encode([
        "success" => false,
        "message" => "Nuværende adgangskode og ny adgangskode er påkrævet."
    ]);
    exit;
}

if (strlen($newPassword) < 8) {
    echo json_encode([
        "success" => false,
        "message" => "Den nye adgangskode skal være mindst 8 tegn lang."
    ]);
    exit;
}

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    // Get current user's password hash
    $stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo json_encode([
            "success" => false,
            "message" => "Bruger ikke fundet."
        ]);
        exit;
    }
    
    // Verify current password
    if (!password_verify($currentPassword, $user['password_hash'])) {
        echo json_encode([
            "success" => false,
            "message" => "Den nuværende adgangskode er forkert."
        ]);
        exit;
    }
    
    // Check if new password is the same as current password
    if (password_verify($newPassword, $user['password_hash'])) {
        echo json_encode([
            "success" => false,
            "message" => "Den nye adgangskode skal være anderledes end den nuværende."
        ]);
        exit;
    }
    
    // Hash the new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Update user's password
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $result = $stmt->execute([$hashedPassword, $user['id']]);
    
    if ($result) {
        // Log successful password change
        error_log("Password changed successfully for user ID: {$user['id']}");
        
        echo json_encode([
            "success" => true,
            "message" => "Din adgangskode er blevet ændret succesfuldt."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Der opstod en fejl ved ændring af adgangskoden."
        ]);
    }
    
} catch(PDOException $e) {
    error_log("Database error in new-password: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "Der opstod en teknisk fejl. Prøv venligst igen."
    ]);
} catch(Exception $e) {
    error_log("General error in new-password: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "Der opstod en fejl. Prøv venligst igen."
    ]);
}
?>