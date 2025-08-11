<?php
// database.php - Database connection and setup

class Database {
    private $db;
    private $dbFile = 'auth.db';
    
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
            
            echo "Database connected successfully!\n";
        } catch(PDOException $e) {
            die("Connection failed: " . $e->getMessage());
        }
    }
    
    private function createTables() {
        $sql = "
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
        
        try {
            $this->db->exec($sql);
            echo "Users table created successfully!\n";
        } catch(PDOException $e) {
            die("Error creating table: " . $e->getMessage());
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
        echo "Database reset successfully!\n";
    }
}

// Example usage:
// $database = new Database();
// $pdo = $database->getConnection();
?>