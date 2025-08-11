<?php
// test.php - Test the authentication system

require_once 'user.php';

echo "=== SQLite Authentication System Test ===\n\n";

// Initialize user system
$user = new User();

// Test 1: Register a new user
echo "1. Testing user registration...\n";
$result = $user->register('testuser', 'test@example.com', 'password123');
echo "Result: " . ($result['success'] ? 'SUCCESS' : 'FAILED') . "\n";
echo "Message: " . $result['message'] . "\n\n";

// Test 2: Try to register same user again (should fail)
echo "2. Testing duplicate registration (should fail)...\n";
$result = $user->register('testuser', 'test@example.com', 'password123');
echo "Result: " . ($result['success'] ? 'SUCCESS' : 'FAILED') . "\n";
echo "Message: " . $result['message'] . "\n\n";

// Test 3: Login with correct credentials
echo "3. Testing login with correct credentials...\n";
$result = $user->login('testuser', 'password123');
echo "Result: " . ($result['success'] ? 'SUCCESS' : 'FAILED') . "\n";
echo "Message: " . $result['message'] . "\n";
if ($result['success']) {
    echo "User data: " . json_encode($result['user']) . "\n";
}
echo "\n";

// Test 4: Login with wrong password
echo "4. Testing login with wrong password (should fail)...\n";
$result = $user->login('testuser', 'wrongpassword');
echo "Result: " . ($result['success'] ? 'SUCCESS' : 'FAILED') . "\n";
echo "Message: " . $result['message'] . "\n\n";

// Test 5: Request password reset
echo "5. Testing password reset request...\n";
$result = $user->requestPasswordReset('test@example.com');
echo "Result: " . ($result['success'] ? 'SUCCESS' : 'FAILED') . "\n";
echo "Message: " . $result['message'] . "\n";
$resetToken = null;
if ($result['success']) {
    $resetToken = $result['reset_token'];
    echo "Reset token: " . $resetToken . "\n";
}
echo "\n";

// Test 6: Reset password using token
if ($resetToken) {
    echo "6. Testing password reset with token...\n";
    $result = $user->resetPassword($resetToken, 'newpassword123');
    echo "Result: " . ($result['success'] ? 'SUCCESS' : 'FAILED') . "\n";
    echo "Message: " . $result['message'] . "\n\n";
    
    // Test 7: Login with new password
    echo "7. Testing login with new password...\n";
    $result = $user->login('testuser', 'newpassword123');
    echo "Result: " . ($result['success'] ? 'SUCCESS' : 'FAILED') . "\n";
    echo "Message: " . $result['message'] . "\n\n";
}

// Test 8: Show all users in database
echo "8. All users in database:\n";
$users = $user->getAllUsers();
foreach ($users as $userData) {
    echo "- ID: {$userData['id']}, Username: {$userData['username']}, Email: {$userData['email']}, Created: {$userData['created_at']}\n";
}
echo "\n";

// Test 9: Test with invalid token
echo "9. Testing password reset with invalid token (should fail)...\n";
$result = $user->resetPassword('invalid_token_123', 'somepassword');
echo "Result: " . ($result['success'] ? 'SUCCESS' : 'FAILED') . "\n";
echo "Message: " . $result['message'] . "\n\n";

echo "=== Test completed! ===\n";
echo "Database file created: auth.db\n";
echo "You can inspect it with SQLite browser tools.\n";
?>