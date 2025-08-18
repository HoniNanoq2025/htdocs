<?php
// backend/auth.php
session_start();

function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Authentication required"]);
        exit;
    }
}

function getCurrentUserId() {
    return $_SESSION['user_id'] ?? null;
}