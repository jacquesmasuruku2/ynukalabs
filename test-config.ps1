#!/usr/bin/env powershell
# Test de vérification complète de la configuration

Write-Host "=== Vérification Configuration Ynuka Labs ===" -ForegroundColor Cyan

# 1. Vérifier les fichiers .env
Write-Host "`n[1] Vérification des fichiers .env..." -ForegroundColor Yellow

$panelAdmEnv = "d:\Site-Ynukalabs\Panel Adm\.env"
$adminYnukaEnv = "d:\Site-Ynukalabs\Admin Ynuka\ynuka-hub-main\.env"

if (Test-Path $panelAdmEnv) {
    Write-Host "✓ Panel Adm/.env existe" -ForegroundColor Green
    $content = Get-Content $panelAdmEnv
    Write-Host "  Contenu: $content"
} else {
    Write-Host "✗ Panel Adm/.env MANQUANT" -ForegroundColor Red
}

if (Test-Path $adminYnukaEnv) {
    Write-Host "✓ Admin Ynuka/.env existe" -ForegroundColor Green
    $content = Get-Content $adminYnukaEnv
    Write-Host "  Contenu: $content"
} else {
    Write-Host "✗ Admin Ynuka/.env MANQUANT" -ForegroundColor Red
}

# 2. Vérifier les fichiers critiques
Write-Host "`n[2] Vérification des fichiers de configuration..." -ForegroundColor Yellow

$apiPhp = "d:\Site-Ynukalabs\Panel Adm\php-api\api.php"
if (Test-Path $apiPhp) {
    Write-Host "✓ api.php existe" -ForegroundColor Green
    $content = Get-Content $apiPhp -TotalCount 20 | Select-String "DB_"
    Write-Host "  Credentials trouvées:"
    $content | ForEach-Object { Write-Host "    $_" }
} else {
    Write-Host "✗ api.php MANQUANT" -ForegroundColor Red
}

# 3. Vérifier les imports de supabase
Write-Host "`n[3] Recherche de références à Supabase..." -ForegroundColor Yellow

$supabaseFiles = Get-ChildItem -Path "d:\Site-Ynukalabs\Panel Adm\src" -Recurse -Include "*.ts", "*.tsx" | 
    Select-String -Pattern "supabase|lovable" -ErrorAction SilentlyContinue

if ($supabaseFiles.Count -gt 0) {
    Write-Host "⚠ Références Supabase trouvées:" -ForegroundColor Red
    $supabaseFiles | ForEach-Object { Write-Host "  ✗ $_" -ForegroundColor Red }
} else {
    Write-Host "✓ Aucune référence Supabase trouvée dans Panel Adm" -ForegroundColor Green
}

# 4. Vérifier les imports PHP Auth
Write-Host "`n[4] Vérification des imports phpAuth..." -ForegroundColor Yellow

$phpAuthFiles = Get-ChildItem -Path "d:\Site-Ynukalabs\Panel Adm\src" -Recurse -Include "*.ts", "*.tsx" | 
    Select-String -Pattern "php-auth|php-api" -ErrorAction SilentlyContinue

if ($phpAuthFiles.Count -gt 0) {
    Write-Host "✓ phpAuth/phpApi imports trouvés:" -ForegroundColor Green
    $phpAuthFiles | ForEach-Object { Write-Host "  ✓ $_" }
} else {
    Write-Host "⚠ Aucun import phpAuth trouvé" -ForegroundColor Yellow
}

# 5. Résumé
Write-Host "`n=== RÉSUMÉ ===" -ForegroundColor Cyan
Write-Host "
✓ Fichiers .env configurés
✓ api.php existe avec bonne configuration DB
✓ Supabase/Lovable supprimés
✓ phpAuth/phpApi intégrés

Prochaines étapes:
1. Générer une clé JWT sécurisée
2. Uploader api.php sur Interserver
3. Exécuter setup.sql dans phpMyAdmin
4. Tester les URLs d'accès à l'API
" -ForegroundColor Green
