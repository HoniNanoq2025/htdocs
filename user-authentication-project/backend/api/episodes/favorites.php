<?php
// user-authentication-project/backend/api/episodes/favorites.php
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../../database.php';
require_once __DIR__ . '/../../auth.php';

header("Content-Type: application/json");

try {
    $database = new Database();
    $pdo = $database->getConnection();

    $userId = getCurrentUserId();
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Authentication required']);
        exit;
    }

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $stmt = $pdo->prepare("SELECT episode_id FROM episode_favorites WHERE user_id = ?");
        $stmt->execute([$userId]);
        $favorites = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $favorites = array_map('intval', $favorites);
        echo json_encode($favorites);

    } elseif ($method === 'POST') {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Invalid JSON input']);
            exit;
        }

        $episodeId = isset($data['episodeId']) ? (int)$data['episodeId'] : null;
        if (!$episodeId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing episodeId']);
            exit;
        }

        $pdo->beginTransaction();
        try {
            // Check existence safely
            $check = $pdo->prepare("SELECT 1 FROM episode_favorites WHERE user_id = ? AND episode_id = ? LIMIT 1");
            $check->execute([$userId, $episodeId]);
            $exists = $check->fetchColumn();

            if ($exists) {
                // Remove favorite
                $delete = $pdo->prepare("DELETE FROM episode_favorites WHERE user_id = ? AND episode_id = ?");
                $delete->execute([$userId, $episodeId]);
                $pdo->commit();

                echo json_encode([
                    'success' => true,
                    'action' => 'removed',
                    'episodeId' => $episodeId,
                    'message' => 'Favorite removed successfully'
                ]);
            } else {
                // Add favorite
                $insert = $pdo->prepare("INSERT OR IGNORE INTO episode_favorites (user_id, episode_id) VALUES (?, ?)");
                $insert->execute([$userId, $episodeId]);
                $pdo->commit();

                echo json_encode([
                    'success' => true,
                    'action' => 'added',
                    'episodeId' => $episodeId,
                    'message' => 'Favorite added successfully'
                ]);
            }
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }

    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }

} catch (PDOException $e) {
    error_log("Database error in favorites.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error occurred']);
} catch (Exception $e) {
    error_log("General error in favorites.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'An error occurred']);
}
