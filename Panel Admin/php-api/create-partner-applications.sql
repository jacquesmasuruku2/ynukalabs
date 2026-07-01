-- Script SQL pour créer la table partner_applications
-- Ce script stocke les demandes de partenariat reçues via le formulaire /partners#become-partner

CREATE TABLE IF NOT EXISTS partner_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(20) UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    company_website VARCHAR(255) NOT NULL,
    industry VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    partnership_type ENUM('sponsorship', 'media', 'ecosystem', 'startup') NOT NULL DEFAULT 'sponsorship',
    status ENUM('pending', 'reviewed', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_partnership_type (partnership_type),
    INDEX idx_created_at (created_at),
    INDEX idx_reference (reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
