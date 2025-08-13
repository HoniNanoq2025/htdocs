<?php
// email-utility.php - Email handling for password resets

class EmailUtility {
    private $fromEmail;
    private $fromName;
    private $isDevelopment;
    
    public function __construct($fromEmail = 'noreply@yoursite.com', $fromName = 'Your Site', $isDevelopment = true) {
        $this->fromEmail = $fromEmail;
        $this->fromName = $fromName;
        $this->isDevelopment = $isDevelopment;
    }
    
    /**
     * Send password reset email
     */
    public function sendPasswordResetEmail($toEmail, $username, $resetToken, $baseUrl = 'http://localhost:5173') {
        $resetLink = $baseUrl . '/reset-password?token=' . urlencode($resetToken);
        
        $subject = 'Nulstil din adgangskode';
        $message = $this->getPasswordResetTemplate($username, $resetLink);
        
        if ($this->isDevelopment) {
            // In development, log the email instead of sending
            $this->logEmail($toEmail, $subject, $resetLink, $resetToken);
            return ['success' => true, 'message' => 'Email logged for development'];
        } else {
            // In production, actually send the email
            return $this->sendEmail($toEmail, $subject, $message);
        }
    }
    
    /**
     * Get HTML template for password reset email
     */
    private function getPasswordResetTemplate($username, $resetLink) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Nulstil din adgangskode</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .container {
                    background-color: #f9f9f9;
                    padding: 30px;
                    border-radius: 10px;
                    border: 1px solid #ddd;
                }
                .header {
                    text-align: center;
                    color: #2c3e50;
                    margin-bottom: 30px;
                }
                .button {
                    display: inline-block;
                    background-color: #3498db;
                    color: white !important;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                    font-weight: bold;
                }
                .button:hover {
                    background-color: #2980b9;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    font-size: 14px;
                    color: #666;
                }
                .warning {
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    padding: 15px;
                    border-radius: 5px;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class='container'>
                <h1 class='header'>Nulstil din adgangskode</h1>
                
                <p>Hej " . htmlspecialchars($username) . ",</p>
                
                <p>Du har anmodet om at nulstille din adgangskode. Klik på knappen nedenfor for at nulstille den:</p>
                
                <div style='text-align: center;'>
                    <a href='" . htmlspecialchars($resetLink) . "' class='button'>Nulstil adgangskode</a>
                </div>
                
                <p>Eller kopier og indsæt dette link i din browser:</p>
                <p style='word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 3px;'>" . htmlspecialchars($resetLink) . "</p>
                
                <div class='warning'>
                    <strong>Vigtigt:</strong> Dette link udløber om 1 time af sikkerhedshensyn.
                </div>
                
                <p>Hvis du ikke har anmodet om dette, kan du roligt ignorere denne email. Din adgangskode vil ikke blive ændret.</p>
                
                <div class='footer'>
                    <p>Med venlig hilsen,<br>Dit team</p>
                    <p><small>Denne email blev sendt automatisk. Svar ikke på denne email.</small></p>
                </div>
            </div>
        </body>
        </html>";
    }
    
    /**
     * Log email for development
     */
    private function logEmail($toEmail, $subject, $resetLink, $token) {
        $logMessage = "
=== PASSWORD RESET EMAIL ===
To: {$toEmail}
Subject: {$subject}
Reset Link: {$resetLink}
Token: {$token}
Sent at: " . date('Y-m-d H:i:s') . "
========================
";
        
        // Log to error log
        error_log($logMessage);
        
        // Also save to a file for easy access during development
        $logFile = __DIR__ . '/password_reset_emails.log';
        file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
        
        error_log("Email logged to: $logFile");
error_log("Reset link: $resetLink");
        error_log("Token: $token");
    }
    
    /**
     * Actually send email (for production)
     */
    private function sendEmail($toEmail, $subject, $message) {
        $headers = [
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=UTF-8',
            'From: ' . $this->fromName . ' <' . $this->fromEmail . '>',
            'Reply-To: ' . $this->fromEmail,
            'X-Mailer: PHP/' . phpversion()
        ];
        
        $success = mail($toEmail, $subject, $message, implode("\r\n", $headers));
        
        if ($success) {
            return ['success' => true, 'message' => 'Email sent successfully'];
        } else {
            return ['success' => false, 'message' => 'Failed to send email'];
        }
    }
    
    /**
     * Send welcome email (bonus feature)
     */
    public function sendWelcomeEmail($toEmail, $username) {
        $subject = 'Velkommen til vores platform!';
        $message = $this->getWelcomeTemplate($username);
        
        if ($this->isDevelopment) {
            error_log("Welcome email would be sent to: {$toEmail} for user: {$username}");
            return ['success' => true, 'message' => 'Welcome email logged for development'];
        } else {
            return $this->sendEmail($toEmail, $subject, $message);
        }
    }
    
    /**
     * Get welcome email template
     */
    private function getWelcomeTemplate($username) {
        return "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <title>Velkommen!</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .container { background-color: #f9f9f9; padding: 30px; border-radius: 10px; border: 1px solid #ddd; }
                .header { text-align: center; color: #27ae60; margin-bottom: 30px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <h1 class='header'>Velkommen til vores platform!</h1>
                <p>Hej " . htmlspecialchars($username) . ",</p>
                <p>Tak fordi du oprettede en konto hos os. Vi glæder os til at have dig med!</p>
                <p>Du kan nu logge ind og udforske alle vores funktioner.</p>
                <p>Med venlig hilsen,<br>Dit team</p>
            </div>
        </body>
        </html>";
    }
}

// Example usage:
/*
$emailUtil = new EmailUtility('noreply@yoursite.com', 'Your Site Name', true); // true = development mode

// Send password reset
$result = $emailUtil->sendPasswordResetEmail('user@example.com', 'username', 'reset_token_here');

// Send welcome email
$result = $emailUtil->sendWelcomeEmail('user@example.com', 'username');
*/
?>