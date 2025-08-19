<?php
// database.php - Database connection and setup

class Database {
    private $db;
    private $dbFile = __DIR__ . '/auth.db';
    
    public function __construct() {
        $this->connect();
        $this->createTables();
    }
    
    private function connect() {
        try {
            // Create SQLite database connection
            $this->db = new PDO("sqlite:" . $this->dbFile);
            
            // Set error mode to exception
            $this->db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Enable foreign key support
            $this->db->exec("PRAGMA foreign_keys = ON");
            
            /* echo "Database connected successfully!\n"; */
        } catch(PDOException $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }
    
    private function createTables() {
        // Users table
        $usersSql = "
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                reset_token TEXT NULL,
                reset_token_expires DATETIME NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ";
        
        // Password resets table for more secure token management
        $resetsSql = "
            CREATE TABLE IF NOT EXISTS password_resets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT UNIQUE NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ";

        // Comments table
        $commentSql = "
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            page_url TEXT NOT NULL DEFAULT '/',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ";

        // Likes table for episodes - Updated to support both users and guests
        $likeSql = "
        CREATE TABLE IF NOT EXISTS episode_likes ( 
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            episode_id TEXT NOT NULL, 
            user_id INTEGER NULL, 
            session_id TEXT NULL,
            ip_address TEXT NULL,
            user_agent TEXT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )";

        // Reviews table for episodes - Updated to support both users and guests
        $reviewsSql = "
        CREATE TABLE IF NOT EXISTS episode_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            episode_id TEXT NOT NULL,
            user_id INTEGER NULL,
            session_id TEXT NULL,
            ip_address TEXT NULL,
            user_agent TEXT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )";
        
        try {
            $this->db->exec($usersSql);
            $this->db->exec($resetsSql);
            $this->db->exec($commentSql);
            $this->db->exec($likeSql);
            $this->db->exec($reviewsSql);
            
            // Create indexes and constraints for episode_likes after table creation
            $this->createLikeConstraints();
            // Create indexes and constraints for episode_reviews after table creation
            $this->createReviewConstraints();
            
            /* echo "Tables created successfully!\n"; */
        } catch(PDOException $e) {
            die("Error creating tables: " . $e->getMessage());
        }
    }
    
    private function createLikeConstraints() {
        try {
            // Create unique constraints to prevent duplicate likes
            // For logged-in users: one like per episode per user
            $this->db->exec("CREATE UNIQUE INDEX IF NOT EXISTS unique_episode_user ON episode_likes(episode_id, user_id) WHERE user_id IS NOT NULL");
            
            // For guests: one like per episode per session
            $this->db->exec("CREATE UNIQUE INDEX IF NOT EXISTS unique_episode_session ON episode_likes(episode_id, session_id) WHERE session_id IS NOT NULL AND user_id IS NULL");
            
            // Create regular indexes for performance
            $this->db->exec("CREATE INDEX IF NOT EXISTS idx_episode_likes_episode_id ON episode_likes(episode_id)");
            $this->db->exec("CREATE INDEX IF NOT EXISTS idx_episode_likes_user_id ON episode_likes(user_id)");
            $this->db->exec("CREATE INDEX IF NOT EXISTS idx_episode_likes_session_id ON episode_likes(session_id)");
            
        } catch(PDOException $e) {
            // If constraints already exist or there's a conflict, just log it
            error_log("Constraint creation info: " . $e->getMessage());
        }
    }

    private function createReviewConstraints() {
        try {
            // Create unique constraints to prevent duplicate reviews
            // For logged-in users: one review per episode per user
            $this->db->exec("CREATE UNIQUE INDEX IF NOT EXISTS unique_episode_user_review ON episode_reviews(episode_id, user_id) WHERE user_id IS NOT NULL");
            
            // For guests: one review per episode per session
            $this->db->exec("CREATE UNIQUE INDEX IF NOT EXISTS unique_episode_session_review ON episode_reviews(episode_id, session_id) WHERE session_id IS NOT NULL AND user_id IS NULL");
            
            // Create regular indexes for performance
            $this->db->exec("CREATE INDEX IF NOT EXISTS idx_episode_reviews_episode_id ON episode_reviews(episode_id)");
            $this->db->exec("CREATE INDEX IF NOT EXISTS idx_episode_reviews_user_id ON episode_reviews(user_id)");
            $this->db->exec("CREATE INDEX IF NOT EXISTS idx_episode_reviews_session_id ON episode_reviews(session_id)");
            
        } catch(PDOException $e) {
            // If constraints already exist or there's a conflict, just log it
            error_log("Review constraint creation info: " . $e->getMessage());
        }
    }
    
    public function getConnection() {
        return $this->db;
    }
    
    // Helper method to check if database file exists
    public function databaseExists() {
        return file_exists($this->dbFile);
    }
    
    // Method to reset database (useful for development)
    public function resetDatabase() {
        if (file_exists($this->dbFile)) {
            unlink($this->dbFile);
        }
        $this->connect();
        $this->createTables();
        /* echo "Database reset successfully!\n"; */
    }
    
    // Clean up expired reset tokens
    public function cleanupExpiredTokens() {
        try {
            $sql = "DELETE FROM password_resets WHERE expires_at <= CURRENT_TIMESTAMP";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
        } catch(PDOException $e) {
            // Log error but don't break the application
            error_log("Error cleaning up expired tokens: " . $e->getMessage());
        }
    }
    
    // Method to migrate existing episode_likes table if needed
    public function migrateLikesTable() {
        try {
            // Check current table structure
            $result = $this->db->query("PRAGMA table_info(episode_likes)");
            $columns = $result->fetchAll(PDO::FETCH_ASSOC);
            
            $hasSessionId = false;
            $hasIpAddress = false;
            $hasUserAgent = false;
            
            foreach ($columns as $column) {
                if ($column['name'] === 'session_id') $hasSessionId = true;
                if ($column['name'] === 'ip_address') $hasIpAddress = true;
                if ($column['name'] === 'user_agent') $hasUserAgent = true;
            }
            
            // Add missing columns
            if (!$hasSessionId) {
                $this->db->exec("ALTER TABLE episode_likes ADD COLUMN session_id TEXT NULL");
            }
            if (!$hasIpAddress) {
                $this->db->exec("ALTER TABLE episode_likes ADD COLUMN ip_address TEXT NULL");
            }
            if (!$hasUserAgent) {
                $this->db->exec("ALTER TABLE episode_likes ADD COLUMN user_agent TEXT NULL");
            }
            
            // Recreate constraints if columns were added
            if (!$hasSessionId || !$hasIpAddress || !$hasUserAgent) {
                $this->createLikeConstraints();
            }
            
        } catch(PDOException $e) {
            error_log("Migration error: " . $e->getMessage());
        }
    }

    // Method to migrate/create reviews table if needed
    public function migrateReviewsTable() {
        try {
            // Check if reviews table exists
            $result = $this->db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='episode_reviews'");
            $tableExists = $result->fetch() !== false;
            
            if (!$tableExists) {
                // Create the reviews table if it doesn't exist
                $reviewsSql = "
                CREATE TABLE episode_reviews (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    episode_id TEXT NOT NULL,
                    user_id INTEGER NULL,
                    session_id TEXT NULL,
                    ip_address TEXT NULL,
                    user_agent TEXT NULL,
                    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )";
                
                $this->db->exec($reviewsSql);
                $this->createReviewConstraints();
            }
            
        } catch(PDOException $e) {
            error_log("Review migration error: " . $e->getMessage());
        }
    }
}

// Example usage:
// $database = new Database();
// $pdo = $database->getConnection();
?>