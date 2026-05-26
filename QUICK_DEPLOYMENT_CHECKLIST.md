# ✅ CHECKLIST DÉPLOIEMENT FINAL - Ynuka Labs

## 🎯 Votre Mission (3 étapes simples)

```
ÉTAPE 1: Générer clé JWT sécurisée
ÉTAPE 2: Uploader api.php sur Interserver
ÉTAPE 3: Créer tables et utilisateur admin
```

---

## ⏱️ Estimation: 30-45 minutes

---

## ÉTAPE 1: Générer JWT_SECRET ⚡

### 1.1 Générer une clé
```bash
# Copiez et collez ceci dans terminal/PowerShell:
openssl rand -base64 32

# Exemple de résultat:
# a7Kf9mL2Qp8Xz5Nb3Rm6Yt4Vw9Sc1Hd+Ej=

# Ou utilisez: https://generate-random.org/api-token-generator
```

### 1.2 Mettre à jour api.php (ligne 19)
```php
# Fichier: Panel Adm/php-api/api.php

Avant:
define('JWT_SECRET', 'CHANGE_ME_TO_A_LONG_RANDOM_STRING_AT_LEAST_32_CHARS');

Après:
define('JWT_SECRET', 'a7Kf9mL2Qp8Xz5Nb3Rm6Yt4Vw9Sc1Hd+Ej');  # Collez votre clé
```

✅ **Fait**: Clé JWT générée

---

## ÉTAPE 2: Uploader api.php 📤

### Option A: Via FTP (FileZilla) - RECOMMANDÉ

```
1. Ouvrir FileZilla
   Host: 205.209.109.3
   User: ynukalab
   Pass: ZA5!s7Qf
   Protocol: SFTP Port 22 (plus sûr)

2. Naviguer à: public_html/

3. Uploader: Panel Adm/php-api/api.php

4. Permissions:
   Clic droit → Properties
   Set: 644 (rw-r--r--)

5. Vérifier dans navigateur:
   https://admin.ynukalabs.com/api.php
   (doit afficher une page blanche ou JSON)
```

### Option B: Via DirectAdmin

```
1. Accéder à: https://vda6600.is.cc:2222
   User: ynukalab
   Pass: ZA5!s7Qf

2. Cliquer: File Manager

3. Naviguer: public_html/

4. Uploader: api.php

5. Permissions: 644
```

✅ **Fait**: api.php déployé

---

## ÉTAPE 3: Créer Tables & Utilisateur 🗄️

### 3.1 Exécuter setup.sql

```
1. Aller à: DirectAdmin → PHPMyAdmin
   (ou https://vda6600.is.cc:2222 → PHPMyAdmin)

2. Sélectionner base: ynukalab_database_website

3. Cliquer: SQL (onglet en haut)

4. Copier/coller tout le contenu de:
   Panel Adm/php-api/setup.sql

5. Cliquer: GO (en bas)

✓ Tables créées:
  - admin_users
  - jwt_tokens (optionnel)
```

### 3.2 Créer Utilisateur Admin

```sql
-- EXÉCUTER dans PHPMyAdmin → SQL

INSERT INTO admin_users (email, password_hash, name, created_at) VALUES (
  'admin@ynukalabs.com',
  '$2y$10$...hash_sha256...',  -- voir instruction spéciale ci-dessous
  'Admin',
  NOW()
);
```

**OU** créer via formulaire après déploiement:

```
1. Aller à: https://admin.ynukalabs.com/
2. Cliquer: "Create Account"
3. Saisir:
   - Email: admin@ynukalabs.com
   - Mot de passe: [votre_mot_de_passe_fort]
   - Nom: Admin
4. Valider
```

✅ **Fait**: Tables & utilisateur créés

---

## 🧪 TESTS IMMÉDIATS

### Test 1: Ping
```bash
curl "https://admin.ynukalabs.com/api.php?action=ping"

# Réponse attendue:
# {"db":"ok","tables":[...],"message":"All systems nominal"}

✓ Si OK → API fonctionne
✗ Si erreur → Vérifier credentials MySQL ligne 16-18
```

### Test 2: Connexion
```bash
curl -X POST "https://admin.ynukalabs.com/api.php?action=login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ynukalabs.com","password":"votre_mot_de_passe"}'

# Réponse attendue:
# {"token":"eyJ...","user":{...}}

✓ Si OK → Auth fonctionne
✗ Si erreur → Vérifier utilisateur créé
```

### Test 3: Ouvrir Panel Adm
```
1. Aller à: https://admin.ynukalabs.com/
2. Voir: Formulaire de connexion
3. Saisir: admin@ynukalabs.com / votre_mot_de_passe
4. Attendre...

✓ Si charge le dashboard → SUCCÈS!
✗ Si error → Ouvrir Console (F12) pour détails
```

---

## 🚨 TROUBLESHOOTING RAPIDE

| Problème | Solution |
|----------|----------|
| **Erreur 404 sur /api.php** | Vérifier que api.php est bien en `public_html/api.php` |
| **Erreur "Connection refused"** | Credentials MySQL incorrects (lignes 16-18) |
| **Erreur "Table doesn't exist"** | setup.sql non exécuté → réexécuter dans PHPMyAdmin |
| **Erreur JWT invalide** | JWT_SECRET mismatch → vérifier JWT_SECRET identique sur serveur et frontend |
| **CORS error** | ALLOWED_ORIGIN pas bon → vérifier ligne 20 dans api.php |
| **Token expire immédiatement** | Vérifier date/heure serveur synchro |

---

## 📋 CHECKLIST FINAL

### Avant Déploiement
- [ ] JWT_SECRET généré (32+ caractères)
- [ ] api.php ligne 19 mise à jour
- [ ] .env files en place (Panel Adm & Panel Admin)
- [ ] Supabase/Lovable supprimés du code ✅ DÉJÀ FAIT

### Pendant Déploiement
- [ ] api.php uploadé → public_html/api.php
- [ ] Permissions: 644
- [ ] setup.sql exécuté dans phpMyAdmin
- [ ] Utilisateur admin créé

### Après Déploiement
- [ ] Test ping: https://admin.ynukalabs.com/api.php?action=ping ✓
- [ ] Test login: email + password ✓
- [ ] Panel Adm accessible: https://admin.ynukalabs.com/ ✓
- [ ] Créer article de test (vérifier dans DB) ✓
- [ ] Panel Admin déployée (optionnel)

---

## 📞 EN CAS DE PROBLÈME

### Logs d'erreur
```
Panel Adm:
→ Ouvrir F12 → Console → Network
→ Vérifier requête vers https://admin.ynukalabs.com/api.php

Serveur Interserver:
→ DirectAdmin → Error Logs
→ /var/log/php/ ou /var/log/apache2/error_log
```

### Contact Support
- **DirectAdmin**: https://vda6600.is.cc:2222
- **Documentation**: Voir DOCUMENTATION_INDEX.md

---

## 🎉 RÉSUMÉ

```
Votre configuration:
✅ Credentials MySQL: ynukalab_database_website
✅ API Backend: https://admin.ynukalabs.com/api.php  
✅ Frontend: Panel Adm + Panel Admin
✅ Base de données: Interserver (localhost MySQL)

En 3 étapes:
1. Générer JWT_SECRET
2. Uploader api.php
3. Créer tables + utilisateur

Résultat: Admin panel avec vos données dans MySQL Interserver
```

---

**Status**: ✅ Prêt pour déploiement  
**Temps estimé**: 30-45 minutes  
**Difficulté**: ⭐⭐ (Facile)

---

## 📚 Documents de Référence

Si besoin de plus détails:
- **Configuration**: DATABASE_CONFIG_VERIFICATION.md
- **Déploiement complet**: DEPLOYMENT_GUIDE_INTERSERVER.md
- **Architecture**: SUMMARY_INTERSERVER_SETUP.md
- **Flux données**: DATA_FLOW_DIAGRAM.md

