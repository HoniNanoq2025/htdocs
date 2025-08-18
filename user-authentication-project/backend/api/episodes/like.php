<?php
// backend/api/episodes/like.php
require_once(__DIR__ . '/../../cors.php');
require_once(__DIR__ . '/../../database.php');
require_once(__DIR__ . '/../../auth.php');

header("Content-Type: application/json");

requireAuth();
$userId = getCurrentUserId();

$method = $_SERVER['REQUEST_METHOD'];
$database = new Database();
$db = $database->getConnection();

if ($method === 'GET') {
    if (!isset($_GET['episode_id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "No episode ID provided"]);
        exit;
    }

    $episodeId = intval($_GET['episode_id']);

    try {
        // Count likes
        $stmt = $db->prepare("SELECT COUNT(*) FROM episode_likes WHERE episode_id = ?");
        $stmt->execute([$episodeId]);
        $likeCount = $stmt->fetchColumn();

        // Check if this user already liked
        $stmt = $db->prepare("SELECT 1 FROM episode_likes WHERE episode_id = ? AND user_id = ?");
        $stmt->execute([$episodeId, $userId]);
        $hasLiked = $stmt->fetch() ? true : false;

        echo json_encode([
            "success" => true,
            "likeCount" => (int)$likeCount,
            "hasLiked" => $hasLiked
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);
    if (!isset($input['episode_id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "No episode ID provided"]);
        exit;
    }

    $episodeId = intval($input['episode_id']);

    try {
        // Prevent duplicate likes
        $stmt = $db->prepare("SELECT 1 FROM episode_likes WHERE episode_id = ? AND user_id = ?");
        $stmt->execute([$episodeId, $userId]);

        if ($stmt->fetch()) {
            echo json_encode(["success" => false, "message" => "Already liked"]);
            exit;
        }

        // Insert like
        $stmt = $db->prepare("INSERT INTO episode_likes (episode_id, user_id) VALUES (?, ?)");
        $stmt->execute([$episodeId, $userId]);

        // Updated count
        $stmt = $db->prepare("SELECT COUNT(*) FROM episode_likes WHERE episode_id = ?");
        $stmt->execute([$episodeId]);
        $likeCount = $stmt->fetchColumn();

        echo json_encode(["success" => true, "likeCount" => (int)$likeCount, "hasLiked" => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

if ($method === 'DELETE') {
    // Parse request body (needed for DELETE)
    $input = json_decode(file_get_contents("php://input"), true);
    if (!isset($input['episode_id'])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "No episode ID provided"]);
        exit;
    }

    $episodeId = intval($input['episode_id']);

    try {
        // Remove like if exists
        $stmt = $db->prepare("DELETE FROM episode_likes WHERE episode_id = ? AND user_id = ?");
        $stmt->execute([$episodeId, $userId]);

        // Updated count
        $stmt = $db->prepare("SELECT COUNT(*) FROM episode_likes WHERE episode_id = ?");
        $stmt->execute([$episodeId]);
        $likeCount = $stmt->fetchColumn();

        echo json_encode(["success" => true, "likeCount" => (int)$likeCount, "hasLiked" => false]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed"]);
