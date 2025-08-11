<?php
// If the requested file exists, serve it directly
$path = __DIR__ . parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
if (file_exists($path) && !is_dir($path)) {
    return false; // Let the built-in server serve it
}

// Otherwise, route everything to index.php or manually include
// For this simple case, just manually route:
$request = $_SERVER['REQUEST_URI'];

if ($request === '/api/register') {
    require __DIR__ . '/api/register.php';
} else {
    http_response_code(404);
    echo "404 Not Found";
}