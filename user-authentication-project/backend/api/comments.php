<?php
// backend/api/comments.php
require_once(__DIR__ . '/../cors.php');
require_once(__DIR__ . '/../database.php');

session_start();
header("Content-Type: application/json");

// Check if user is authenticated
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Authentication required"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$database = new Database();
$db = $database->getConnection();

switch ($method) {
    case 'GET':
        handleGetComments($db);
        break;
    case 'POST':
        handleAddComment($db);
        break;
    case 'PUT':
        handleUpdateComment($db);
        break;
    case 'DELETE':
        handleDeleteComment($db);
        break;
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method not allowed"]);
        break;
}

function handleGetComments($db) {
    $page_url = $_GET['page'] ?? '/';
    
    try {
        $sql = "
            SELECT 
                c.id,
                c.content,
                c.page_url,
                c.created_at,
                c.updated_at,
                u.username,
                c.user_id = ? as is_owner
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.page_url = ?
            ORDER BY c.created_at DESC
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$_SESSION['user_id'], $page_url]);
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            "success" => true,
            "comments" => $comments
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to fetch comments: " . $e->getMessage()
        ]);
    }
}

function handleAddComment($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['content']) || trim($input['content']) === '') {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Comment content is required"
        ]);
        return;
    }
    
    $content = trim($input['content']);
    $page_url = $input['page_url'] ?? '/';
    
    if (strlen($content) > 1000) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Comment too long (max 1000 characters)"
        ]);
        return;
    }
    
    try {
        $sql = "INSERT INTO comments (user_id, content, page_url) VALUES (?, ?, ?)";
        $stmt = $db->prepare($sql);
        $stmt->execute([$_SESSION['user_id'], $content, $page_url]);
        
        // Get the created comment with user info
        $commentId = $db->lastInsertId();
        $sql = "
            SELECT 
                c.id,
                c.content,
                c.page_url,
                c.created_at,
                c.updated_at,
                u.username,
                true as is_owner
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = ?
        ";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$commentId]);
        $comment = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            "success" => true,
            "message" => "Comment added successfully",
            "comment" => $comment
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to add comment: " . $e->getMessage()
        ]);
    }
}

function handleUpdateComment($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['id']) || !isset($input['content'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Comment ID and content are required"
        ]);
        return;
    }
    
    $commentId = $input['id'];
    $content = trim($input['content']);
    
    if (strlen($content) > 1000) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Comment too long (max 1000 characters)"
        ]);
        return;
    }
    
    try {
        // Check if user owns this comment
        $sql = "SELECT user_id FROM comments WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$commentId]);
        $comment = $stmt->fetch();
        
        if (!$comment) {
            http_response_code(404);
            echo json_encode([
                "success" => false,
                "message" => "Comment not found"
            ]);
            return;
        }
        
        if ($comment['user_id'] != $_SESSION['user_id']) {
            http_response_code(403);
            echo json_encode([
                "success" => false,
                "message" => "You can only edit your own comments"
            ]);
            return;
        }
        
        // Update the comment
        $sql = "UPDATE comments SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$content, $commentId]);
        
        echo json_encode([
            "success" => true,
            "message" => "Comment updated successfully"
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to update comment: " . $e->getMessage()
        ]);
    }
}

function handleDeleteComment($db) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['id'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Comment ID is required"
        ]);
        return;
    }
    
    $commentId = $input['id'];
    
    try {
        // Check if user owns this comment
        $sql = "SELECT user_id FROM comments WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$commentId]);
        $comment = $stmt->fetch();
        
        if (!$comment) {
            http_response_code(404);
            echo json_encode([
                "success" => false,
                "message" => "Comment not found"
            ]);
            return;
        }
        
        if ($comment['user_id'] != $_SESSION['user_id']) {
            http_response_code(403);
            echo json_encode([
                "success" => false,
                "message" => "You can only delete your own comments"
            ]);
            return;
        }
        
        // Delete the comment
        $sql = "DELETE FROM comments WHERE id = ?";
        $stmt = $db->prepare($sql);
        $stmt->execute([$commentId]);
        
        echo json_encode([
            "success" => true,
            "message" => "Comment deleted successfully"
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to delete comment: " . $e->getMessage()
        ]);
    }
}
?>