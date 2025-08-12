<?php
// backend/api/login.php
require_once 'cors.php';

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
session_start();
header("Content-Type: application/json");

// Allow JSON input
$input = json_decode(file_get_contents("php://input"), true);
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "Ugyldige loginoplysninger."]);
    exit;
}

// DB connection
require 'db.php'; // Make sure this connects to your DB

// Find user by email
$stmt = $pdo->prepare("SELECT id, password FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];

    echo json_encode(["success" => true, "message" => "Login lykkedes."]);
} else {
    echo json_encode(["success" => false, "message" => "Forkert email eller adgangskode."]);
}