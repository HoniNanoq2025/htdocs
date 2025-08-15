<?php
// api.php - Simple API router for authentication

require_once 'user.php';

// Set headers for JSON API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173'); // React dev server
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Simple router
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove query string and get path
$path = parse_url($requestUri, PHP_URL_PATH);

// Initialize User class
$user = new User();

// Route the request
switch ($path) {
    case '/api/register':
        if ($requestMethod === 'POST') {
            handleRegister($user);
        } else {
            sendError('Method not allowed', 405);
        }
        break;
        
    case '/api/login':
        if ($requestMethod === 'POST') {
            handleLogin($user);
        } else {
            sendError('Method not allowed', 405);
        }
        break;
        
    case '/api/forgot-password':
        if ($requestMethod === 'POST') {
            // Include the dedicated forgot-password.php file
            include __DIR__ . '/api/forgot-password.php';
            exit(); // Prevent further execution
        } else {
            sendError('Method not allowed', 405);
        }
        break;
        
    case '/api/reset-password':
        if ($requestMethod === 'POST') {
            // Include the dedicated reset-password.php file
            include __DIR__ . '/api/reset-password.php';
            exit(); // Prevent further execution
        } else {
            sendError('Method not allowed', 405);
        }
        break;
    
    case '/api/new-password':
        if ($requestMethod === 'POST') {
            // Include the dedicated new-password.php file
            include __DIR__ . '/api/new-password.php';
            exit(); // Prevent further execution
        } else {
            sendError('Method not allowed', 405);
        }
        break;
        
    case '/api/users':
        if ($requestMethod === 'GET') {
            handleGetUsers($user);
        } else {
            sendError('Method not allowed', 405);
        }
        break;
        
    case '/api/delete-profile':
        if ($requestMethod === 'POST') { 
            include __DIR__ . '/api/delete-profile.php';
            exit();
        } else { 
            sendError('Method not allowed', 405);}
        break;

    
        
    default:
        sendError('Endpoint not found', 404);
        break;
}

// Handler functions
function handleRegister($user) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username']) || !isset($input['email']) || !isset($input['password'])) {
        sendError('Missing required fields');
        return;
    }
    
    $result = $user->register($input['username'], $input['email'], $input['password']);
    
    if ($result['success']) {
        sendResponse($result);
    } else {
        sendError($result['message']);
    }
}

function handleLogin($user) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['username']) || !isset($input['password'])) {
        sendError('Missing username or password');
        return;
    }
    
    $result = $user->login($input['username'], $input['password']);
    
    if ($result['success']) {
        // Start session and store user data
        session_start();
        $_SESSION['user_id'] = $result['user']['id'];
        $_SESSION['username'] = $result['user']['username'];
        
        sendResponse($result);
    } else {
        sendError($result['message']);
    }
}

function handleGetUsers($user) {
    // This is for testing purposes - in production you'd want authentication
    $users = $user->getAllUsers();
    sendResponse(['success' => true, 'users' => $users]);
}

// Helper functions
function sendResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}

function sendError($message, $status = 400) {
    http_response_code($status);
    echo json_encode(['success' => false, 'message' => $message]);
    exit();
}
?>