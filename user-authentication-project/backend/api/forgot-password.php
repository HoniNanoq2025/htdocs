<?php
// forgot-password.php - API endpoint for handling forgot password requests
require_once(__DIR__ . '/../cors.php'); // Include CORS handling
session_start();

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$email = trim($data['email'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["message" => "Ugyldig email."]);
    exit;
}

// ... DB logic and email sending ...
echo json_encode(["message" => "Hvis din email findes i vores system, vil du modtage et link til at nulstille din adgangskode."]);
?>