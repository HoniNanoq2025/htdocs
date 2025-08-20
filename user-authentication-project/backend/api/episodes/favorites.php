<?php
// user-authentication-project/backend/api/episodes/favorites.php
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../../database.php';
require_once __DIR__ . '/../../auth.php';

header("Content-Type: application/json");

try {
    // Initialize DB connection
    $database = new Database();
    $pdo = $database->getConnection();

    // Get authenticated user ID - use auth helper
    $userId = getCurrentUserId();
    
    if (!$userId) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        // Fetch favorites
        $stmt = $pdo->prepare("SELECT episode_id FROM episode_favorites WHERE user_id = ?");
        $stmt->execute([$userId]);
        $favorites = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        // Convert to integers to match frontend expectations
        $favorites = array_map('intval', $favorites);
        
        echo json_encode($favorites);

    } elseif ($method === 'POST') {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid JSON input']);
            exit;
        }
        
        $episodeId = $data['episodeId'] ?? null;

        if (!$episodeId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing episodeId']);
            exit;
        }

        // Convert episodeId to integer for consistency
        $episodeId = (int)$episodeId;

        // Toggle favorite: check if it exists
        $check = $pdo->prepare("SELECT id FROM episode_favorites WHERE user_id = ? AND episode_id = ?");
        $check->execute([$userId, $episodeId]);

        if ($check->rowCount() > 0) {
            // Remove favorite
            $delete = $pdo->prepare("DELETE FROM episode_favorites WHERE user_id = ? AND episode_id = ?");
            $delete->execute([$userId, $episodeId]);
            
            echo json_encode(['success' => true, 'action' => 'removed', 'episodeId' => $episodeId]);
        } else {
            // Add favorite
            $insert = $pdo->prepare("INSERT INTO episode_favorites (user_id, episode_id) VALUES (?, ?)");
            $insert->execute([$userId, $episodeId]);
            
            echo json_encode(['success' => true, 'action' => 'added', 'episodeId' => $episodeId]);
        }
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }

} catch (PDOException $e) {
    error_log("Database error in favorites.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred']);
} catch (Exception $e) {
    error_log("General error in favorites.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred']);
}