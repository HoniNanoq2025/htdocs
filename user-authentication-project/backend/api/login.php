<?php
// user-authentication-project/backend/api/login.php
require_once(__DIR__ . '/../cors.php');
session_start();
header("Content-Type: application/json");

// Get input
$input = json_decode(file_get_contents("php://input"), true);
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (!$email || !$password) {
    echo json_encode(["success" => false, "message" => "Ugyldige loginoplysninger."]);
    exit;
}

// Use your SQLite Database class
require_once('../database.php');

$db = new Database();
$pdo = $db->getConnection();

// Prepare and execute query
$stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password_hash'])) {
    $_SESSION['user_id'] = $user['id'];
    echo json_encode(["success" => true, "message" => "Login lykkedes."]);
} else {
    echo json_encode(["success" => false, "message" => "Forkert email eller adgangskode."]);
}