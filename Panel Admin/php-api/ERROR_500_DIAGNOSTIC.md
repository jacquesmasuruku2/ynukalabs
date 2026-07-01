# Diagnostic de l'Erreur HTTP 500

## Étapes pour identifier la cause

### Étape 1: Tester si PHP fonctionne

1. **Uploader** le fichier `api-test.php` sur le serveur
2. **Renommer** temporairement `api.php` en `api.php.backup`
3. **Renommer** `api-test.php` en `api.php`
4. **Tester** : https://admin.ynukalabs.com/api/api.php

**Résultat attendu :**
```json
{"status":"php_working","php_version":"8.x.x"}
```

**Si ça fonctionne :** PHP est OK, le problème est dans le code de api.php
**Si erreur 500 persiste :** Problème de configuration PHP sur le serveur

---

### Étape 2: Vérifier les logs d'erreur PHP

**Via cPanel :**
1. Ouvrir cPanel
2. Aller dans "Metrics" → "Errors"
3. Chercher les erreurs récentes pour `api.php`

**Via SSH (si disponible) :**
```bash
tail -f /home/ynukalab/public_html/error_log
# ou
tail -f /var/log/php/error.log
```

---

### Étape 3: Causes possibles de l'erreur 500

#### 1. Problème de connexion à la base de données
**Symptôme :** Erreur dans les logs liée à PDO/MySQL
**Solution :** Vérifier les identifiants DB dans api.php (lignes 33-37)

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'ynukalab_database_website');
define('DB_USER', 'ynukalab_admin-jacques');
define('DB_PASS', 'Admin-Jacques.ynuka_db');
```

#### 2. Problème de session
**Symptôme :** Erreur "headers already sent" ou session
**Solution :** Vérifier les permissions du dossier de session

#### 3. Permissions de fichier incorrectes
**Symptôme :** Erreur "Permission denied"
**Solution :**
```bash
chmod 644 api.php
chmod 755 /domains/admin.ynukalabs.com/public_html/api/
```

#### 4. Version PHP incompatible
**Symptôme :** Erreur de syntaxe PHP
**Solution :** Vérifier que PHP 7.4+ est installé sur le serveur

#### 5. Extension PHP manquante
**Symptôme :** "Call to undefined function"
**Solution :** Vérifier que PDO, JSON, mbstring sont activés

---

### Étape 4: Restaurer l'ancienne version

Si le nouveau fichier ne fonctionne pas :

1. **Renommer** `api.php` en `api.php.new`
2. **Renommer** `api.php.backup` (ancienne version) en `api.php`
3. **Tester** si l'ancienne version fonctionne

---

### Étape 5: Version simplifiée de api.php

Si nécessaire, je peux créer une version simplifiée de api.php avec seulement les fonctionnalités essentielles (newsletter + contact) sans les fonctionnalités admin complexes.

---

## Actions immédiates

1. **Uploader** `api-test.php` et tester
2. **Vérifier** les logs d'erreur dans cPanel
3. **Me communiquer** le message d'erreur exact des logs

Une fois la cause identifiée, je pourrai corriger le problème spécifique.
