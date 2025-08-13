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
        
        try {
            $this->db->exec($usersSql);
            $this->db->exec($resetsSql);
            /* echo "Tables created successfully!\n"; */
        } catch(PDOException $e) {
            die("Error creating tables: " . $e->getMessage());
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
}

// Example usage:
// $database = new Database();
// $pdo = $database->getConnection();
?>