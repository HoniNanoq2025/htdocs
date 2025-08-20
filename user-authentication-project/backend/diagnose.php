<?php
// test-favorites-direct.php
// Place this in your backend folder to test favorites.php directly

// Start session (simulate logged in user)
session_start();
$_SESSION['user_id'] = 1; // Simulate user ID 1

// Set the request method
$_SERVER['REQUEST_METHOD'] = 'GET';

echo "Testing favorites.php directly...\n";
echo "Session user_id: " . ($_SESSION['user_id'] ?? 'NOT SET') . "\n";
echo "Request method: " . $_SERVER['REQUEST_METHOD'] . "\n";
echo "Headers that will be set:\n";

// Capture output from favorites.php
ob_start();
try {
    include __DIR__ . '/api/episodes/favorites.php';
    $output = ob_get_contents();
} catch (Exception $e) {
    $output = "ERROR: " . $e->getMessage();
} finally {
    ob_end_clean();
}

echo "Output from favorites.php:\n";
echo $output . "\n";

// Test POST request
echo "\n--- Testing POST request ---\n";
$_SERVER['REQUEST_METHOD'] = 'POST';

// Simulate POST data
$postData = json_encode(['episodeId' => 5]);
file_put_contents('php://temp', $postData);

ob_start();
try {
    // Mock the input
    function mockInput() {
        return '{"episodeId": 5}';
    }
    
    // Override file_get_contents for php://input
    if (!function_exists('file_get_contents_original')) {
        function file_get_contents_original($filename, $use_include_path = false, $context = null, $offset = 0, $maxlen = null) {
            if ($filename === 'php://input') {
                return '{"episodeId": 5}';
            }
            return file_get_contents($filename, $use_include_path, $context, $offset, $maxlen);
        }
    }
    
    include __DIR__ . '/api/episodes/favorites.php';
    $output = ob_get_contents();
} catch (Exception $e) {
    $output = "ERROR: " . $e->getMessage();
} finally {
    ob_end_clean();
}

echo "Output from POST request:\n";
echo $output . "\n";
?>