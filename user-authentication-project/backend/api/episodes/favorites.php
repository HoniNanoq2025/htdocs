<?php
require_once '../../database.php'; // Adjust path if needed
header("Content-Type: application/json");

// Simulate user ID — in production, get this from session/token
$userId = 1;

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch favorites
    $stmt = $pdo->prepare("SELECT episode_id FROM episode_favorites WHERE user_id = ?");
    $stmt->execute([$userId]);
    $favorites = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo json_encode($favorites);

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $episodeId = $data['episodeId'] ?? null;

    if (!$episodeId) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing episodeId']);
        exit;
    }

    // Toggle favorite: check if it exists
    $check = $pdo->prepare("SELECT * FROM episode_favorites WHERE user_id = ? AND episode_id = ?");
    $check->execute([$userId, $episodeId]);

    if ($check->rowCount() > 0) {
        // Remove favorite
        $delete = $pdo->prepare("DELETE FROM episode_favorites WHERE user_id = ? AND episode_id = ?");
        $delete->execute([$userId, $episodeId]);
    } else {
        // Add favorite
        $insert = $pdo->prepare("INSERT INTO episode_favorites (user_id, episode_id) VALUES (?, ?)");
        $insert->execute([$userId, $episodeId]);
    }

    echo json_encode(['success' => true]);
}