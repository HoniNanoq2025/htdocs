<?php
// index.php - Main entry point and router

// Include CORS handling first
require_once __DIR__ . '/cors.php';

// Get the request URI and remove query string
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Route API requests to api.php
if (strpos($path, '/api/') === 0) {
    // This is an API request, route to api.php
    include __DIR__ . '/api.php';
    exit;
}

// Handle direct file requests
switch ($path) {
    case '/user.php':
        include __DIR__ . '/user.php';
        break;
        
    case '/test.php':
        include __DIR__ . '/test.php';
        break;
        
    case '/setup.php':
        include __DIR__ . '/setup.php';
        break;
        
    case '/test-forgot-password.php':
        include __DIR__ . '/test-forgot-password.php';
        break;
        
    default:
        // For development, show available endpoints
        header('Content-Type: application/json');
        echo json_encode([
            'message' => 'API Server Running',
            'available_endpoints' => [
                'POST /api/register' => 'Register new user',
                'POST /api/login' => 'User login',
                'POST /api/logout' => 'User logout',
                'POST /api/forgot-password' => 'Request password reset',
                'POST /api/reset-password' => 'Reset password with token',
                'GET /api/users' => 'Get all users (testing)',
                'GET /user.php' => 'Get current user',
                'GET /test.php' => 'Run system tests',
                'GET /setup.php' => 'Initialize system'
            ],
            'request_path' => $path
        ]);
        break;
}
?>