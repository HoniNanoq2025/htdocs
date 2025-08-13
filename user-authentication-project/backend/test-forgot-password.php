<?php
// test-forgot-password.php - Test the complete forgot password flow

require_once 'user.php';
require_once 'database.php';

echo "=== Testing Forgot Password Flow ===\n\n";

// Initialize
$user = new User();
$database = new Database();
$pdo = $database->getConnection();

// Step 1: Create a test user if doesn't exist
echo "1. Setting up test user...\n";
$testEmail = 'test@example.com';
$testUsername = 'testuser';
$testPassword = 'password123';

$result = $user->register($testUsername, $testEmail, $testPassword);
echo "Registration result: " . ($result['success'] ? 'SUCCESS' : 'ALREADY EXISTS') . "\n";
echo "Message: " . $result['message'] . "\n\n";

// Step 2: Test forgot password request
echo "2. Testing forgot password request...\n";
$forgotResult = $user->requestPasswordReset($testEmail);
echo "Forgot password result: " . ($forgotResult['success'] ? 'SUCCESS' : 'FAILED') . "\n";
echo "Message: " . $forgotResult['message'] . "\n";

if ($forgotResult['success'] && isset($forgotResult['reset_token'])) {
    $oldToken = $forgotResult['reset_token'];
    echo "Old method token: " . $oldToken . "\n";
}

// Step 3: Test new password_resets table approach
echo "\n3. Testing new token system...\n";

// Simulate the new forgot password API
$newToken = bin2hex(random_bytes(64));
$expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

// Get user ID
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$testEmail]);
$userData = $stmt->fetch();

if ($userData) {
    // Insert new token
    $stmt = $pdo->prepare("DELETE FROM password_resets WHERE user_id = ?");
    $stmt->execute([$userData['id']]);
    
    $stmt = $pdo->prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)");
    $stmt->execute([$userData['id'], $newToken, $expiresAt]);
    
    echo "New token created: " . $newToken . "\n";
    echo "Expires at: " . $expiresAt . "\n";
    echo "Reset URL would be: http://localhost:5173/reset-password?token=" . urlencode($newToken) . "\n";
} else {
    echo "User not found!\n";
}

// Step 4: Test token validation
echo "\n4. Testing token validation...\n";
$stmt = $pdo->prepare("
    SELECT pr.user_id, u.email, u.username 
    FROM password_resets pr 
    JOIN users u ON pr.user_id = u.id 
    WHERE pr.token = ? AND pr.expires_at > CURRENT_TIMESTAMP
");
$stmt->execute([$newToken]);
$resetData = $stmt->fetch(PDO::FETCH_ASSOC);

if ($resetData) {
    echo "Token validation: SUCCESS\n";
    echo "User ID: " . $resetData['user_id'] . "\n";
    echo "Email: " . $resetData['email'] . "\n";
    echo "Username: " . $resetData['username'] . "\n";
} else {
    echo "Token validation: FAILED\n";
}

// Step 5: Test password reset
echo "\n5. Testing password reset with token...\n";
$newPassword = 'newpassword123';
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

if ($resetData) {
    $pdo->beginTransaction();
    
    try {
        // Update password
        $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        $stmt->execute([$hashedPassword, $resetData['user_id']]);
        
        // Remove token
        $stmt = $pdo->prepare("DELETE FROM password_resets WHERE user_id = ?");
        $stmt->execute([$resetData['user_id']]);
        
        $pdo->commit();
        echo "Password reset: SUCCESS\n";
        
        // Test login with new password
        echo "\n6. Testing login with new password...\n";
        $loginResult = $user->login($testUsername, $newPassword);
        echo "Login result: " . ($loginResult['success'] ? 'SUCCESS' : 'FAILED') . "\n";
        echo "Message: " . $loginResult['message'] . "\n";
        
    } catch (Exception $e) {
        $pdo->rollBack();
        echo "Password reset: FAILED - " . $e->getMessage() . "\n";
    }
}

// Step 6: Test expired token
echo "\n7. Testing expired token...\n";
$expiredToken = bin2hex(random_bytes(64));
$expiredTime = date('Y-m-d H:i:s', strtotime('-1 hour')); // 1 hour ago

$stmt = $pdo->prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)");
$stmt->execute([$userData['id'], $expiredToken, $expiredTime]);

$stmt = $pdo->prepare("
    SELECT pr.user_id 
    FROM password_resets pr 
    WHERE pr.token = ? AND pr.expires_at > CURRENT_TIMESTAMP
");
$stmt->execute([$expiredToken]);
$expiredResult = $stmt->fetch();

echo "Expired token validation: " . ($expiredResult ? 'FAILED (should be expired)' : 'SUCCESS (correctly expired)') . "\n";

// Step 7: Test cleanup
echo "\n8. Testing token cleanup...\n";
$database->cleanupExpiredTokens();

$stmt = $pdo->prepare("SELECT COUNT(*) as count FROM password_resets WHERE expires_at <= CURRENT_TIMESTAMP");
$stmt->execute();
$result = $stmt->fetch();

echo "Expired tokens remaining after cleanup: " . $result['count'] . "\n";

// Step 8: Show current state
echo "\n9. Current database state:\n";

// Users
$stmt = $pdo->prepare("SELECT id, username, email, created_at FROM users");
$stmt->execute();
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Users:\n";
foreach ($users as $u) {
    echo "  - ID: {$u['id']}, Username: {$u['username']}, Email: {$u['email']}\n";
}

// Password resets
$stmt = $pdo->prepare("SELECT pr.id, pr.user_id, u.email, pr.expires_at, pr.created_at FROM password_resets pr JOIN users u ON pr.user_id = u.id");
$stmt->execute();
$resets = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "\nActive password resets:\n";
if (empty($resets)) {
    echo "  - None\n";
} else {
    foreach ($resets as $r) {
        $status = strtotime($r['expires_at']) > time() ? 'Valid' : 'Expired';
        echo "  - ID: {$r['id']}, User: {$r['email']}, Status: {$status}, Expires: {$r['expires_at']}\n";
    }
}

echo "\n=== Test completed! ===\n";
echo "You can now test the frontend with the token: " . $newToken . "\n";
echo "Or use this URL: http://localhost:5173/reset-password?token=" . urlencode($newToken) . "\n";
?>