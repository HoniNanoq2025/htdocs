<?php
// api/delete-profile.php - Delete user profile
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
        "message" => "Du skal være logget ind for at slette din profil."
    ]);
    exit;
}

// Get and validate input
$input = json_decode(file_get_contents("php://input"), true);
$password = $input['password'] ?? '';
$confirmText = $input['confirmText'] ?? '';

// Basic validation
if (empty($password)) {
    echo json_encode([
        "success" => false,
        "message" => "Adgangskode er påkrævet for at slette profilen."
    ]);
    exit;
}

// Check confirmation text
if (strtolower(trim($confirmText)) !== 'slet min profil') {
    echo json_encode([
        "success" => false,
        "message" => "Du skal skrive 'slet min profil' for at bekræfte sletningen."
    ]);
    exit;
}

try {
    $database = new Database();
    $pdo = $database->getConnection();
    
    // Get current user's data including password hash
    $stmt = $pdo->prepare("SELECT id, username, email, password_hash FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo json_encode([
            "success" => false,
            "message" => "Bruger ikke fundet."
        ]);
        exit;
    }
    
    // Verify password
    if (!password_verify($password, $user['password_hash'])) {
        echo json_encode([
            "success" => false,
            "message" => "Forkert adgangskode."
        ]);
        exit;
    }
    
    // Start transaction to ensure data consistency
    $pdo->beginTransaction();
    
    try {
        // Delete associated password reset tokens first (due to foreign key)
        $stmt = $pdo->prepare("DELETE FROM password_resets WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        
        // Delete the user account
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $result = $stmt->execute([$user['id']]);
        
        if ($result) {
            $pdo->commit();
            
            // Log the account deletion
            error_log("Account deleted successfully - User ID: {$user['id']}, Username: {$user['username']}, Email: {$user['email']}");
            
            // Destroy the session
            $_SESSION = [];
            session_destroy();
            
            // Delete session cookie
            if (ini_get("session.use_cookies")) {
                $params = session_get_cookie_params();
                setcookie(
                    session_name(),
                    '',
                    time() - 42000,
                    $params["path"],
                    $params["domain"],
                    $params["secure"],
                    $params["httponly"]
                );
            }
            
            echo json_encode([
                "success" => true,
                "message" => "Din profil er blevet slettet permanent. Vi beklager at se dig forlade os."
            ]);
        } else {
            $pdo->rollBack();
            echo json_encode([
                "success" => false,
                "message" => "Der opstod en fejl ved sletning af profilen."
            ]);
        }
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
    
} catch(PDOException $e) {
    error_log("Database error in delete-profile: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "Der opstod en teknisk fejl. Prøv venligst igen."
    ]);
} catch(Exception $e) {
    error_log("General error in delete-profile: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "Der opstod en fejl. Prøv venligst igen."
    ]);
}
?>