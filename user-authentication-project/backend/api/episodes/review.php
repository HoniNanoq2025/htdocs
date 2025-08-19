<?php
// backend/api/episodes/review.php - Episode reviews API

require_once __DIR__ . '/../../database.php';
require_once __DIR__ . '/../../cors.php';

// Set JSON response header
header('Content-Type: application/json');

try {
    // Initialize database
    $database = new Database();
    $db = $database->getConnection();
    
    // Ensure the reviews table exists (for existing databases)
    $database->migrateReviewsTable();
    
    // Get HTTP method
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Handle preflight OPTIONS request for CORS
    if ($method === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
    
    // Parse input data
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Get episode ID from URL parameter or input
    $episodeId = $_GET['episode_id'] ?? $input['episode_id'] ?? null;
    
    if ($episodeId === null || $episodeId === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Episode ID is required']);
        exit;
    }
    
    // Get user session information
    session_start();
    $userId = $_SESSION['user_id'] ?? null;
    $sessionId = session_id();
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    
    switch ($method) {
        case 'GET':
            // Get reviews for an episode
            handleGetReviews($db, $episodeId, $userId, $sessionId);
            break;
            
        case 'POST':
            // Submit or update a review
            $rating = $input['rating'] ?? null;
            
            if (!$rating || !is_numeric($rating) || $rating < 1 || $rating > 5) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Rating must be between 1 and 5']);
                exit;
            }
            
            handleSubmitReview($db, $episodeId, $userId, $sessionId, $ipAddress, $userAgent, (int)$rating);
            break;
            
        case 'DELETE':
            // Delete a review
            handleDeleteReview($db, $episodeId, $userId, $sessionId);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
            break;
    }
    
} catch (Exception $e) {
    error_log("Review API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Internal server error']);
}

function handleGetReviews($db, $episodeId, $userId, $sessionId) {
    try {
        // Get average rating and total count
        $avgSql = "SELECT 
                    COUNT(*) as total_reviews,
                    AVG(rating) as average_rating,
                    COUNT(CASE WHEN rating = 1 THEN 1 END) as rating_1,
                    COUNT(CASE WHEN rating = 2 THEN 1 END) as rating_2,
                    COUNT(CASE WHEN rating = 3 THEN 1 END) as rating_3,
                    COUNT(CASE WHEN rating = 4 THEN 1 END) as rating_4,
                    COUNT(CASE WHEN rating = 5 THEN 1 END) as rating_5
                   FROM episode_reviews 
                   WHERE episode_id = ?";
        
        $avgStmt = $db->prepare($avgSql);
        $avgStmt->execute([$episodeId]);
        $stats = $avgStmt->fetch(PDO::FETCH_ASSOC);
        
        // Get user's current rating if exists
        $userRating = null;
        if ($userId) {
            $userSql = "SELECT rating FROM episode_reviews WHERE episode_id = ? AND user_id = ?";
            $userStmt = $db->prepare($userSql);
            $userStmt->execute([$episodeId, $userId]);
            $userReview = $userStmt->fetch(PDO::FETCH_ASSOC);
            $userRating = $userReview ? (int)$userReview['rating'] : null;
        } else {
            // For guests, check by session
            $sessionSql = "SELECT rating FROM episode_reviews WHERE episode_id = ? AND session_id = ? AND user_id IS NULL";
            $sessionStmt = $db->prepare($sessionSql);
            $sessionStmt->execute([$episodeId, $sessionId]);
            $sessionReview = $sessionStmt->fetch(PDO::FETCH_ASSOC);
            $userRating = $sessionReview ? (int)$sessionReview['rating'] : null;
        }
        
        echo json_encode([
            'success' => true,
            'data' => [
                'episode_id' => $episodeId,
                'total_reviews' => (int)$stats['total_reviews'],
                'average_rating' => $stats['total_reviews'] > 0 ? round((float)$stats['average_rating'], 1) : 0,
                'user_rating' => $userRating,
                'rating_distribution' => [
                    '1' => (int)$stats['rating_1'],
                    '2' => (int)$stats['rating_2'],
                    '3' => (int)$stats['rating_3'],
                    '4' => (int)$stats['rating_4'],
                    '5' => (int)$stats['rating_5']
                ]
            ]
        ]);
        
    } catch (PDOException $e) {
        error_log("Get reviews error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to retrieve reviews']);
    }
}

function handleSubmitReview($db, $episodeId, $userId, $sessionId, $ipAddress, $userAgent, $rating) {
    try {
        $db->beginTransaction();
        
        if ($userId) {
            // For authenticated users
            $checkSql = "SELECT id FROM episode_reviews WHERE episode_id = ? AND user_id = ?";
            $checkStmt = $db->prepare($checkSql);
            $checkStmt->execute([$episodeId, $userId]);
            $existingReview = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($existingReview) {
                // Update existing review
                $updateSql = "UPDATE episode_reviews SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
                $updateStmt = $db->prepare($updateSql);
                $updateStmt->execute([$rating, $existingReview['id']]);
                $message = 'Review updated successfully';
            } else {
                // Insert new review
                $insertSql = "INSERT INTO episode_reviews (episode_id, user_id, rating, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)";
                $insertStmt = $db->prepare($insertSql);
                $insertStmt->execute([$episodeId, $userId, $rating, $ipAddress, $userAgent]);
                $message = 'Review submitted successfully';
            }
        } else {
            // For guest users (session-based)
            $checkSql = "SELECT id FROM episode_reviews WHERE episode_id = ? AND session_id = ? AND user_id IS NULL";
            $checkStmt = $db->prepare($checkSql);
            $checkStmt->execute([$episodeId, $sessionId]);
            $existingReview = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($existingReview) {
                // Update existing review
                $updateSql = "UPDATE episode_reviews SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
                $updateStmt = $db->prepare($updateSql);
                $updateStmt->execute([$rating, $existingReview['id']]);
                $message = 'Review updated successfully';
            } else {
                // Insert new review
                $insertSql = "INSERT INTO episode_reviews (episode_id, session_id, rating, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)";
                $insertStmt = $db->prepare($insertSql);
                $insertStmt->execute([$episodeId, $sessionId, $rating, $ipAddress, $userAgent]);
                $message = 'Review submitted successfully';
            }
        }
        
        $db->commit();
        
        // Get updated stats to return
        handleGetReviews($db, $episodeId, $userId, $sessionId);
        
    } catch (PDOException $e) {
        $db->rollback();
        error_log("Submit review error: " . $e->getMessage());
        
        // Check if it's a constraint violation (duplicate review)
        if ($e->getCode() == '23000' || strpos($e->getMessage(), 'UNIQUE constraint failed') !== false) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'You have already reviewed this episode']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to submit review']);
        }
    }
}

function handleDeleteReview($db, $episodeId, $userId, $sessionId) {
    try {
        if ($userId) {
            // For authenticated users
            $deleteSql = "DELETE FROM episode_reviews WHERE episode_id = ? AND user_id = ?";
            $deleteStmt = $db->prepare($deleteSql);
            $deleteStmt->execute([$episodeId, $userId]);
        } else {
            // For guest users
            $deleteSql = "DELETE FROM episode_reviews WHERE episode_id = ? AND session_id = ? AND user_id IS NULL";
            $deleteStmt = $db->prepare($deleteSql);
            $deleteStmt->execute([$episodeId, $sessionId]);
        }
        
        if ($deleteStmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Review deleted successfully']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Review not found']);
        }
        
    } catch (PDOException $e) {
        error_log("Delete review error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to delete review']);
    }
}
?>