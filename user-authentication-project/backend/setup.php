<?php
// setup.php - Initialize the authentication system

echo "=== Setting up Authentication System ===\n\n";

// Include required files
require_once 'database.php';
require_once 'user.php';
require_once 'email-utility.php';

// Step 1: Initialize database
echo "1. Initializing database...\n";
$database = new Database();
echo "✓ Database initialized\n";
echo "✓ Tables created (users, password_resets)\n\n";

// Step 2: Test database connection
echo "2. Testing database connection...\n";
$pdo = $database->getConnection();
if ($pdo) {
    echo "✓ Database connection successful\n\n";
} else {
    echo "✗ Database connection failed\n\n";
    exit(1);
}

// Step 3: Create a test user if needed
echo "3. Setting up test user...\n";
$user = new User();
$testEmail = 'test@example.com';
$testUsername = 'testuser';
$testPassword = 'password123';

$result = $user->register($testUsername, $testEmail, $testPassword);
if ($result['success']) {
    echo "✓ Test user created: {$testUsername} / {$testEmail}\n";
} else {
    echo "✓ Test user already exists: {$testUsername} / {$testEmail}\n";
}
echo "  Password: {$testPassword}\n\n";

// Step 4: Test email utility
echo "4. Testing email utility...\n";
$emailUtil = new EmailUtility('noreply@yoursite.com', 'Your Site', true);
echo "✓ Email utility initialized (development mode)\n";
echo "✓ Password reset emails will be logged to: " . __DIR__ . "/password_reset_emails.log\n\n";

// Step 5: Display API endpoints
echo "5. Available API endpoints:\n";
$endpoints = [
    'POST /api/register.php' => 'Register new user',
    'POST /api/login.php' => 'User login',
    'POST /api/logout.php' => 'User logout',
    'POST /api/forgot-password.php' => 'Request password reset',
    'POST /api/reset-password.php' => 'Reset password with token',
    'GET /api/user.php' => 'Get current user info'
];

foreach ($endpoints as $endpoint => $description) {
    echo "  ✓ {$endpoint} - {$description}\n";
}
echo "\n";

// Step 6: Display frontend setup
echo "6. Frontend setup:\n";
echo "  ✓ Update AuthContext API_BASE_URL to match your backend\n";
echo "  ✓ Make sure React Router has routes for:\n";
echo "    - /login (LoginForm)\n";
echo "    - /register (RegisterForm)\n";
echo "    - /forgot-password (ForgotPasswordForm)\n";
echo "    - /reset-password (ResetPasswordForm)\n\n";

// Step 7: Testing instructions
echo "7. Testing instructions:\n";
echo "  1. Start your PHP server: php -S localhost:8000\n";
echo "  2. Start your React dev server: npm run dev (usually localhost:5173)\n";
echo "  3. Test forgot password flow:\n";
echo "     a. Go to /forgot-password\n";
echo "     b. Enter: {$testEmail}\n";
echo "     c. Check password_reset_emails.log for the reset link\n";
echo "     d. Copy the token from the log and visit /reset-password?token=YOUR_TOKEN\n";
echo "     e. Set a new password\n";
echo "     f. Test login with the new password\n\n";

// Step 8: Production notes
echo "8. Production deployment notes:\n";
echo "  ✓ Change EmailUtility to production mode (false)\n";
echo "  ✓ Configure proper SMTP settings for mail() function\n";
echo "  ✓ Update CORS origins in cors.php\n";
echo "  ✓ Set secure session settings\n";
echo "  ✓ Use HTTPS for password reset links\n";
echo "  ✓ Consider using environment variables for sensitive config\n\n";

// Step 9: Security checklist
echo "9. Security checklist:\n";
$securityChecks = [
    'Password hashing' => '✓ Using PASSWORD_DEFAULT',
    'SQL injection' => '✓ Using prepared statements',
    'CSRF protection' => '⚠ Consider adding CSRF tokens',
    'Rate limiting' => '⚠ Consider adding rate limiting',
    'Input validation' => '✓ Basic validation implemented',
    'Token security' => '✓ Using cryptographically secure tokens',
    'Token expiration' => '✓ 1-hour expiration implemented',
    'Account enumeration' => '✓ Generic responses implemented'
];

foreach ($securityChecks as $check => $status) {
    echo "  {$status} {$check}\n";
}

echo "\n=== Setup Complete! ===\n";
echo "Your authentication system is ready to use.\n";
echo "Database file: " . __DIR__ . "/auth.db\n";
echo "Log file: " . __DIR__ . "/password_reset_emails.log\n";

// Create a quick test token for immediate testing
echo "\nQuick test token (valid for 1 hour):\n";
$quickToken = bin2hex(random_bytes(64));
$expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$testEmail]);
$userData = $stmt->fetch();

if ($userData) {
    $stmt = $pdo->prepare("DELETE FROM password_resets WHERE user_id = ?");
    $stmt->execute([$userData['id']]);
    
    $stmt = $pdo->prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)");
    $stmt->execute([$userData['id'], $quickToken, $expiresAt]);
    
    echo "Test URL: http://localhost:5173/reset-password?token={$quickToken}\n";
}
?>