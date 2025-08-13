<?php
// api/forgot-password.php - Complete forgot password implementation
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
        $resetLink = "http://localhost:5173/reset-password?token=" . urlencode($token);
        
        // For development, we'll log the reset link instead of sending email
        // In production, you'd use a proper email service like PHPMailer, SendGrid, etc.
        error_log("Password reset link for {$email}: {$resetLink}");
        
        // Simple email sending (you should replace this with a proper email service)
        $subject = "Nulstil din adgangskode";
        $message = "
            <html>
            <head>
                <title>Nulstil din adgangskode</title>
            </head>
            <body>
                <h2>Nulstil din adgangskode</h2>
                <p>Hej {$user['username']},</p>
                <p>Du har anmodet om at nulstille din adgangskode. Klik på linket nedenfor for at nulstille den:</p>
                <p><a href='{$resetLink}'>Nulstil adgangskode</a></p>
                <p>Dette link udløber om 1 time.</p>
                <p>Hvis du ikke har anmodet om dette, kan du ignorere denne email.</p>
            </body>
            </html>
        ";
        
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: noreply@yoursite.com" . "\r\n";
        
        // Uncomment the line below to actually send emails (make sure mail() is configured)
        // mail($email, $subject, $message, $headers);
        
        // Log for development
        error_log("Password reset email would be sent to: {$email}");
        error_log("Reset token: {$token}");
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