# ✅ Checklist: Migration Supabase → MySQL

## Changements déjà faits ✅

- [x] Identifiants MySQL mis à jour dans `Panel Adm/php-api/api.php`
- [x] Services `phpAuth` créés (authentification)
- [x] Services `phpApi` créés (CRUD générique)
- [x] Fichiers React/TypeScript migrer vers la nouvelle API
- [x] Guide de migration créé

## À faire maintenant 📋

### Immédiat (cette semaine)

1. **Générer une clé JWT sécurisée**
   ```bash
   php -r 'echo base64_encode(random_bytes(32));'
   ```
   Remplacer `CHANGE_ME_TO_A_LONG_RANDOM_STRING_AT_LEAST_32_CHARS` dans `Panel Adm/php-api/api.php` ligne 19

2. **Créer au moins un utilisateur admin**
   ```sql
   -- Hash généré avec:
   -- php -r 'echo password_hash("VotreMotDePasse", PASSWORD_BCRYPT);'
   INSERT INTO admin_users (email, password_hash, name) VALUES 
   ('vous@example.com', '$2y$10$...HASH...$', 'Votre Nom');
   ```

3. **Uploader l'API PHP sur Interserver**
   - Copier `Panel Adm/php-api/api.php` → `/public_html/api.php`
   - Tester : https://admin.ynukalabs.com/api.php?action=ping
   - Doit retourner JSON avec `"db": "ok"`

4. **Variables d'environnement déjà configurées** ✅
   - `Panel Adm/.env`: `VITE_API_URL=https://admin.ynukalabs.com/api.php`
   - `Panel Admin/ynuka-hub-main/.env`: Même configuration

### Court terme (cette semaine)

- [ ] Tester le login sur le panel
- [ ] Vérifier que les opérations CRUD fonctionnent
- [ ] Configurer Google OAuth (optionnel)
- [ ] Créer les autres tables (`users`, `user_roles`) si nécessaire

### Long terme (après vérification)

- [ ] Archiver/supprimer les références Supabase
- [ ] Optionnel: Implémenter un endpoint `signup` pour l'auto-inscription
- [ ] Documenter les rôles d'utilisateur

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `Panel Adm/php-api/api.php` | API backend MySQL |
| `Panel Adm/src/lib/php-auth.ts` | Service d'authentification |
| `Panel Adm/src/lib/php-api.ts` | Client CRUD générique |
| `.env` (à créer) | Configuration URL API |

## Tests rapides

```bash
# Test de l'API
curl "https://admin.ynukalabs.com/api.php?action=ping"

# Test de login
curl -X POST "https://admin.ynukalabs.com/api.php?action=login" \
  -H "Content-Type: application/json" \
  -d '{"email":"vous@example.com","password":"VotreMotDePasse"}'

# Doit retourner un token JWT
```

## Questions fréquentes

**Q: Où mettre l'API PHP?**  
R: Sur Interserver: `/public_html/api.php` ou un sous-dossier

**Q: Comment générer un hash de mot de passe?**  
R: `php -r 'echo password_hash("test", PASSWORD_BCRYPT);'`

**Q: L'authentification est sécurisée?**  
R: Oui, JWT + HTTPS + mot de passe hashé. Configurez HTTPS sur Interserver.

**Q: Et les autres projets (Ynuka Site)?**  
R: Ils utilisent toujours Supabase pour l'instant. Vous pouvez les migrer plus tard.

---

👉 Commencez par les 4 points "Immédiat" ci-dessus pour tester rapidement!

