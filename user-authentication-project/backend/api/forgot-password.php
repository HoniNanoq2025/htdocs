<?php
// api/forgot-password.php - Complete forgot password implementation
require_once(__DIR__ . '/../cors.php');
require_once(__DIR__ . '/../database.php');
session_start();

header("Content-Type: application/json");

// ✅ Handle preflight OPTIONS request for CORS
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

// Get and validate input
$input = json_decode(file_get_contents("php://input"), true);
$email = trim($input['email'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => true, // Always return success to prevent enumeration
        "message" => "Hvis din email findes i vores system, vil du modtage et link til at nulstille din adgangskode."
    ]);
    exit;
}

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    // Clean up any expired tokens first
    $database->cleanupExpiredTokens();
    
    // Step 1: Check if email exists in database
    $stmt = $pdo->prepare("SELECT id, username FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        // Step 2: Generate a secure token (64 random bytes = 128 hex chars)
        $token = bin2hex(random_bytes(64));
        
        // Step 3: Store token with expiration (1 hour from now)
        $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));
        
        // Remove any existing tokens for this user
        $stmt = $pdo->prepare("DELETE FROM password_resets WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        
        // Insert new token
        $stmt = $pdo->prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)");
        $stmt->execute([$user['id'], $token, $expiresAt]);
        
        // Step 4: Send email with reset link
        require_once(__DIR__ . '/../email-utility.php');
        $emailUtil = new EmailUtility('noreply@yoursite.com', 'Your Site', true); // true = development mode
        
        $emailResult = $emailUtil->sendPasswordResetEmail($email, $user['username'], $token);
        
        // Log the result
        error_log("Email send result for {$email}: " . ($emailResult['success'] ? 'SUCCESS' : 'FAILED') . " - " . $emailResult['message']);
    }
    
    // Step 5: Always return the same generic response to prevent account enumeration
    echo json_encode([
        "success" => true,
        "message" => "Hvis din email findes i vores system, vil du modtage et link til at nulstille din adgangskode."
    ]);
    
} catch(PDOException $e) {
    error_log("Database error in forgot-password: " . $e->getMessage());
    echo json_encode([
        "success" => true, // Still return success to prevent enumeration
        "message" => "Hvis din email findes i vores system, vil du modtage et link til at nulstille din adgangskode."
    ]);
} catch(Exception $e) {
    error_log("General error in forgot-password: " . $e->getMessage());
    echo json_encode([
        "success" => true,
        "message" => "Hvis din email findes i vores system, vil du modtage et link til at nulstille din adgangskode."
    ]);
}
?>