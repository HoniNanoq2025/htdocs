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
        "message" => "You have to be logged in to change your password."
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
        "message" => "Current password and new password are required."
    ]);
    exit;
}

if (strlen($newPassword) < 8) {
    echo json_encode([
        "success" => false,
        "message" => "The new password must contain at least 8 characters."
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
            "message" => "User not found."
        ]);
        exit;
    }
    
    // Verify current password
    if (!password_verify($currentPassword, $user['password_hash'])) {
        echo json_encode([
            "success" => false,
            "message" => "Current password is wrong."
        ]);
        exit;
    }
    
    // Check if new password is the same as current password
    if (password_verify($newPassword, $user['password_hash'])) {
        echo json_encode([
            "success" => false,
            "message" => "New password must be different from the current."
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
            "message" => "Your password has been succesfully changed."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "An error occured when changing the password."
        ]);
    }
    
} catch(PDOException $e) {
    error_log("Database error in new-password: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "Technical error. Please try again."
    ]);
} catch(Exception $e) {
    error_log("General error in new-password: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "An error occurred. Please try again."
    ]);
}
?>