<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok'=>false,'error'=>'Method not allowed']); exit;
}
require __DIR__ . '/config.php';

// Honeypot to block bots
if (!empty($_POST['hp'] ?? '')) { echo json_encode(['ok'=>true]); exit; }

$email = trim(strtolower($_POST['email'] ?? ''));
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
  echo json_encode(['ok'=>false,'error':'Invalid email']); exit;
}

try {
  $pdo = new PDO(
    'mysql:host='.DB_HOST.';dbname='.DB_NAME.';charset=utf8mb4',
    DB_USER,
    DB_PASSWORD,
    [ PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC ]
  );

  // Ensure table exists (id, email) with unique email
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS `".DB_TABLE."` (
      `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
      `email` VARCHAR(255) NOT NULL,
      PRIMARY KEY (`id`),
      UNIQUE KEY `uniq_email` (`email`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  ");

  // Insert or ignore duplicates
  $stmt = $pdo->prepare("INSERT INTO `".DB_TABLE."` (`email`) VALUES (:email)");
  $stmt->execute([':email' => $email]);

  echo json_encode(['ok'=>true,'message'=>'Subscribed']);
} catch (PDOException $e) {
  // Duplicate email
  if ($e->getCode() === '23000') {
    echo json_encode(['ok'=>true,'message'=>'Already subscribed']); exit;
  }
  http_response_code(500);
  echo json_encode(['ok'=>false,'error'=>'Database error']); // keep generic
}
