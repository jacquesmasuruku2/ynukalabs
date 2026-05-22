<?php
/**
 * Generate a bcrypt password hash for admin setup
 * Usage: php generate-admin.php
 * Then copy the hash to setup.sql
 */

$password = $argv[1] ?? 'admin123';
$hash = password_hash($password, PASSWORD_BCRYPT);

echo "Password: $password\n";
echo "Hash: $hash\n";
echo "\nSQL to insert into database:\n";
echo "INSERT INTO admin_users (email, password_hash, name) VALUES ('admin@ynukalabs.com', '$hash', 'Admin');\n";
