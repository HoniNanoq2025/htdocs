<?php
// user.php - User authentication class

require_once 'cors.php'; // Include CORS configuration

require_once 'database.php';

class User {
    private $db;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }
    
    // Register a new user
    public function register($username, $email, $password) {
        try {
            // Check if user already exists
            if ($this->userExists($username, $email)) {
                return ['success' => false, 'message' => 'Username or email already exists'];
            }
            
            // Validate input
            if (strlen($password) < 6) {
                return ['success' => false, 'message' => 'Password must be at least 6 characters'];
            }
            
            // Hash the password
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            
            // Insert user into database
            $sql = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$username, $email, $passwordHash]);
            
            return [
                'success' => true, 
                'message' => 'User registered successfully',
                'user_id' => $this->db->lastInsertId()
            ];
            
        } catch(PDOException $e) {
            return ['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()];
        }
    }
    
    // Login user
    public function login($username, $password) {
        try {
            // Find user by username or email
            $sql = "SELECT id, username, email, password_hash FROM users WHERE username = ? OR email = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$username, $username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user && password_verify($password, $user['password_hash'])) {
                // Remove password hash from returned data
                unset($user['password_hash']);
                
                return [
                    'success' => true,
                    'message' => 'Login successful',
                    'user' => $user
                ];
            } else {
                return ['success' => false, 'message' => 'Invalid username or password'];
            }
            
        } catch(PDOException $e) {
            return ['success' => false, 'message' => 'Login failed: ' . $e->getMessage()];
        }
    }
    
    // Request password reset (generate token)
    public function requestPasswordReset($email) {
        try {
            // Check if user exists
            $sql = "SELECT id FROM users WHERE email = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return ['success' => false, 'message' => 'Email not found'];
            }
            
            // Generate reset token
            $resetToken = bin2hex(random_bytes(32));
            $expiry = date('Y-m-d H:i:s', strtotime('+1 hour')); // Token expires in 1 hour
            
            // Update user with reset token
            $sql = "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$resetToken, $expiry, $email]);
            
            return [
                'success' => true,
                'message' => 'Password reset token generated',
                'reset_token' => $resetToken // In real app, you'd email this token
            ];
            
        } catch(PDOException $e) {
            return ['success' => false, 'message' => 'Reset request failed: ' . $e->getMessage()];
        }
    }
    
    // Reset password with token
    public function resetPassword($token, $newPassword) {
        try {
            // Validate token and check if not expired
            $sql = "SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$token, date('Y-m-d H:i:s')]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return ['success' => false, 'message' => 'Invalid or expired reset token'];
            }
            
            // Validate new password
            if (strlen($newPassword) < 6) {
                return ['success' => false, 'message' => 'Password must be at least 6 characters'];
            }
            
            // Hash new password
            $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
            
            // Update password and clear reset token
            $sql = "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$passwordHash, $token]);
            
            return ['success' => true, 'message' => 'Password reset successfully'];
            
        } catch(PDOException $e) {
            return ['success' => false, 'message' => 'Password reset failed: ' . $e->getMessage()];
        }
    }
    
    // Check if user exists
    private function userExists($username, $email) {
        $sql = "SELECT id FROM users WHERE username = ? OR email = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$username, $email]);
        return $stmt->fetch() !== false;
    }
    
    // Get user by ID
    public function getUserById($id) {
        try {
            $sql = "SELECT id, username, email, created_at FROM users WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([$id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return false;
        }
    }
    
    // Get all users (for testing/admin purposes)
    public function getAllUsers() {
        try {
            $sql = "SELECT id, username, email, created_at FROM users";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            return [];
        }
    }
}

// Example usage:
/*
$user = new User();

// Register a new user
$result = $user->register('john_doe', 'john@example.com', 'password123');
print_r($result);

// Login
$result = $user->login('john_doe', 'password123');
print_r($result);

// Request password reset
$result = $user->requestPasswordReset('john@example.com');
print_r($result);

// Reset password (using token from above)
$result = $user->resetPassword($token, 'newpassword123');
print_r($result);
*/
?>