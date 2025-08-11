<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);
$token = trim($data['token'] ?? '');
$newPassword = $data['password'] ?? '';

if (!$token || !$newPassword || strlen($newPassword) < 6) {
    echo json_encode(["message" => "Ugyldigt input."]);
    exit;
}

require 'db.php';

// Look up the token
$stmt = $pdo->prepare("SELECT user_id, expires_at FROM password_resets WHERE token = ?");
$stmt->execute([$token]);
$resetRequest = $stmt->fetch();

if (!$resetRequest || strtotime($resetRequest['expires_at']) < time()) {
    echo json_encode(["message" => "Linket er ugyldigt eller udløbet."]);
    exit;
}

// Update the user's password (hash it)
$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
$stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
$stmt->execute([$hashedPassword, $resetRequest['user_id']]);

// Invalidate the token
$stmt = $pdo->prepare("DELETE FROM password_resets WHERE token = ?");
$stmt->execute([$token]);

echo json_encode(["message" => "Succes! Adgangskoden er blevet nulstillet."]);