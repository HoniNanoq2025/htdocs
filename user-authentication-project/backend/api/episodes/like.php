<?php
// like.php - Compatible with existing LikeCounter.jsx using your existing infrastructure


// Include your existing infrastructure files
require_once '../../cors.php';      // CORS headers and OPTIONS handling
require_once '../../database.php';  // Database connection
require_once '../../auth.php';      // Authentication helpers

session_start();
header('Content-Type: application/json');

// Initialize database connection
$database = new Database();
$pdo = $database->getConnection();

// Get client information
$ip_address = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$session_id = session_id();

// Get current user ID (null for guests)
$user_id = getCurrentUserId();

function getLikeCount($pdo, $episode_id) {
    $query = "SELECT COUNT(*) FROM episode_likes WHERE episode_id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$episode_id]);
    return (int)$stmt->fetchColumn();
}

function hasUserLiked($pdo, $episode_id, $user_id, $session_id) {
    if ($user_id) {
        // Check by user_id if logged in
        $query = "SELECT COUNT(*) FROM episode_likes WHERE episode_id = ? AND user_id = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$episode_id, $user_id]);
    } else {
        // For guests, check by session_id
        $query = "SELECT COUNT(*) FROM episode_likes WHERE episode_id = ? AND session_id = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$episode_id, $session_id]);
    }
    return $stmt->fetchColumn() > 0;
}

// Ensure table is migrated to support guests (if upgrading from old schema)
$database->migrateLikesTable();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get like count and user like status
    
    if (!isset($_GET['episode_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Episode ID is required']);
        exit;
    }
    
    $episode_id = $_GET['episode_id'];
    
    try {
        $likeCount = getLikeCount($pdo, $episode_id);
        $hasLiked = hasUserLiked($pdo, $episode_id, $user_id, $session_id);
        
        echo json_encode([
            'success' => true,
            'likeCount' => $likeCount,
            'hasLiked' => $hasLiked
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to get like data']);
    }

} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Add a like
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['episode_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Episode ID is required']);
        exit;
    }
    
    $episode_id = $input['episode_id'];
    
    try {
        $pdo->beginTransaction();
        
        // Check if user has already liked this episode
        if (hasUserLiked($pdo, $episode_id, $user_id, $session_id)) {
            $pdo->rollBack();
            echo json_encode([
                'success' => false, 
                'message' => 'You have already liked this episode',
                'likeCount' => getLikeCount($pdo, $episode_id),
                'hasLiked' => true
            ]);
            exit;
        }
        
        // Insert the like
        if ($user_id) {
            // For logged-in users
            $insertQuery = "INSERT INTO episode_likes (episode_id, user_id, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)";
            $insertStmt = $pdo->prepare($insertQuery);
            $insertStmt->execute([$episode_id, $user_id, $ip_address, $user_agent]);
        } else {
            // For guests
            $insertQuery = "INSERT INTO episode_likes (episode_id, session_id, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)";
            $insertStmt = $pdo->prepare($insertQuery);
            $insertStmt->execute([$episode_id, $session_id, $ip_address, $user_agent]);
        }
        
        $newCount = getLikeCount($pdo, $episode_id);
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Like added successfully',
            'likeCount' => $newCount,
            'hasLiked' => true
        ]);
        
    } catch (PDOException $e) {
        $pdo->rollBack();
        if (strpos($e->getMessage(), 'UNIQUE constraint failed') !== false) {
            // Handle duplicate like attempts
            echo json_encode([
                'success' => false,
                'message' => 'You have already liked this episode',
                'likeCount' => getLikeCount($pdo, $episode_id),
                'hasLiked' => true
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to add like']);
        }
    }
    
} else if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Remove a like (unlike)
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['episode_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Episode ID is required']);
        exit;
    }
    
    $episode_id = $input['episode_id'];
    
    try {
        $pdo->beginTransaction();
        
        // Check if user has liked this episode
        if (!hasUserLiked($pdo, $episode_id, $user_id, $session_id)) {
            $pdo->rollBack();
            echo json_encode([
                'success' => false, 
                'message' => 'You have not liked this episode',
                'likeCount' => getLikeCount($pdo, $episode_id),
                'hasLiked' => false
            ]);
            exit;
        }
        
        // Remove the like
        if ($user_id) {
            $deleteQuery = "DELETE FROM episode_likes WHERE episode_id = ? AND user_id = ?";
            $deleteStmt = $pdo->prepare($deleteQuery);
            $deleteStmt->execute([$episode_id, $user_id]);
        } else {
            $deleteQuery = "DELETE FROM episode_likes WHERE episode_id = ? AND session_id = ?";
            $deleteStmt = $pdo->prepare($deleteQuery);
            $deleteStmt->execute([$episode_id, $session_id]);
        }
        
        $newCount = getLikeCount($pdo, $episode_id);
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Like removed successfully',
            'likeCount' => $newCount,
            'hasLiked' => false
        ]);
        
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to remove like']);
    }
    
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>