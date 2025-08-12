<?php
// backend/api/logout.php
require_once(__DIR__ . '/../cors.php'); // Include CORS handling

session_start();
header("Content-Type: application/json");

// Unset all session variables
$_SESSION = [];

// Destroy the session
session_destroy();

// Optionally, delete session cookie (for good measure)
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

// Redirect to login page or homepage
header("Location: login.php");
exit;