<?php
// api/reset-password.php - Token-based password reset
require_once(__DIR__ . '/../cors.php');
require_once(__DIR__ . '/../database.php');
session_start();

header("Content-Type: application/json");

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
    exit;
}

// Get and validate input
$input = json_decode(file_get_contents("php://input"), true);
$token = trim($input['token'] ?? '');
$newPassword = $input['password'] ?? '';

// Basic validation
if (empty($token) || empty($newPassword)) {
    echo json_encode([
        "success" => false,
        "message" => "Token og adgangskode er påkrævet."
    ]);
    exit;
}

if (strlen($newPassword) < 6) {
    echo json_encode([
        "success" => false,
        "message" => "Adgangskoden skal være mindst 6 tegn lang."
    ]);
    exit;
}

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    // Clean up expired tokens
    $database->cleanupExpiredTokens();
    
    // Verify token and check if it's not expired
    $stmt = $pdo->prepare("
        SELECT pr.user_id, u.email, u.username 
        FROM password_resets pr 
        JOIN users u ON pr.user_id = u.id 
        WHERE pr.token = ? AND pr.expires_at > CURRENT_TIMESTAMP
    ");
    $stmt->execute([$token]);
    $resetData = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$resetData) {
        echo json_encode([
            "success" => false,
            "message" => "Linket er ugyldigt eller udløbet. Anmod venligst om et nyt link."
        ]);
        exit;
    }
    
    // Hash the new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Start transaction to ensure data consistency
    $pdo->beginTransaction();
    
    try {
        // Update user's password
        $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        $stmt->execute([$hashedPassword, $resetData['user_id']]);
        
        // Remove the used token and any other tokens for this user
        $stmt = $pdo->prepare("DELETE FROM password_resets WHERE user_id = ?");
        $stmt->execute([$resetData['user_id']]);
        
        // Also clear any old reset tokens from the users table (for backwards compatibility)
        $stmt = $pdo->prepare("UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?");
        $stmt->execute([$resetData['user_id']]);
        
        $pdo->commit();
        
        // Log successful password reset
        error_log("Password reset successful for user ID: {$resetData['user_id']}, email: {$resetData['email']}");
        
        echo json_encode([
            "success" => true,
            "message" => "Succes! Din adgangskode er blevet nulstillet. Du kan nu logge ind med din nye adgangskode."
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
    
} catch(PDOException $e) {
    error_log("Database error in reset-password: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "Der opstod en teknisk fejl. Prøv venligst igen."
    ]);
} catch(Exception $e) {
    error_log("General error in reset-password: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "Der opstod en fejl. Prøv venligst igen."
    ]);
}
?>