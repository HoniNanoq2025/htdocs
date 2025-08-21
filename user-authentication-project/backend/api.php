<?php
// api.php - API router matching actual file structure

// Include CORS first
require_once 'cors.php';

// Set headers for JSON API (cors.php already sets most of these, but being explicit)
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the request details
$requestUri = $_SERVER['REQUEST_URI'];
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Remove query string and get clean path
$path = parse_url($requestUri, PHP_URL_PATH);

// Debug logging (remove in production)
error_log("API Router - Path: $path, Method: $requestMethod");

// Route the request based on your actual file structure
switch ($path) {
    // Authentication endpoints that go through dedicated files
    case '/api/register.php':
        if ($requestMethod === 'POST') {
            include __DIR__ . '/api/register.php';
            exit();
        } else {
            sendError('Method not allowed', 405);
        }
        break;
        
    case '/api/login.php':
        if ($requestMethod === 'POST') {
            include __DIR__ . '/api/login.php';
            exit();
        } else {
            sendError('Method not allowed', 405);
        }
        break;

    case '/api/logout.php':
        if ($requestMethod === 'POST') {
            include __DIR__ . '/api/logout.php';
            exit();
        } else {
            sendError('Method not allowed', 405);
        }
        break;
        
    case '/api/forgot-password.php':
        if ($requestMethod === 'POST') {
            include __DIR__ . '/api/forgot-password.php';
            exit();
        } else {
            sendError('Method not allowed', 405);
        }
        break;
        
    case '/api/reset-password.php':
        if ($requestMethod === 'POST') {
            include __DIR__ . '/api/reset-password.php';
            exit();
        } else {
            sendError('Method not allowed', 405);
        }
        break;
    
    case '/api/new-password.php':
        if ($requestMethod === 'POST') {
            include __DIR__ . '/api/new-password.php';
            exit();
        } else {
            sendError('Method not allowed', 405);
        }
        break;
        
    case '/api/delete-profile.php':
        if ($requestMethod === 'POST') { 
            include __DIR__ . '/api/delete-profile.php';
            exit();
        } else { 
            sendError('Method not allowed', 405);
        }
        break;

    case '/api/comments.php':
        if (in_array($requestMethod, ['GET', 'POST', 'PUT', 'DELETE'])) {
            include __DIR__ . '/api/comments.php';
            exit();
        } else {
            sendError('Method not allowed', 405);
        }
        break;

    // Episodes endpoints
    case '/api/episodes/favorites.php':
        if (in_array($requestMethod, ['GET', 'POST'])) {
            include __DIR__ . '/api/episodes/favorites.php';
            exit();
        } else {
            sendError('Method not allowed', 405);
        }
        break;

    case '/api/episodes/like.php':
        if (in_array($requestMethod, ['GET', 'POST'])) {
            include __DIR__ . '/api/episodes/like.php';
            exit();
        } else {
            sendError('Method not allowed', 405);
        }
        break;

    case '/api/episodes/review.php':
        if (in_array($requestMethod, ['GET', 'POST', 'PUT', 'DELETE'])) {
            include __DIR__ . '/api/episodes/review.php';
            exit();
        } else {
            sendError('Method not allowed', 405);
        }
        break;

    // User info endpoint - this uses user.php directly
    case '/api/user':
    case '/user.php':
        if ($requestMethod === 'GET') {
            // user.php already handles GET requests for current user
            include __DIR__ . '/user.php';
            exit();
        } else {
            sendError('Method not allowed', 405);
        }
        break;
        
    default:
        sendError('Endpoint not found: ' . $path, 404);
        break;
}

// Helper functions
function sendError($message, $status = 400) {
    http_response_code($status);
    echo json_encode(['success' => false, 'error' => $message, 'message' => $message]);
    exit();
}

function sendResponse($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit();
}
?>