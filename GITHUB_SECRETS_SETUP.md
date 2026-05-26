# GitHub Actions Secrets Setup

Pour que les workflows de déploiement SSH fonctionnent, vous devez configurer les secrets GitHub. Allez à:

```
https://github.com/jacquesmasuruku2/ynukalabs/settings/secrets/actions
```

## Secrets à configurer

### 1. SERVER_HOST
**Valeur:** `205.209.109.3` (ou votre domaine Interserver)

Cliquer sur "New repository secret" → 
- Name: `SERVER_HOST`
- Value: `205.209.109.3`

### 2. SERVER_USER
**Valeur:** `ynukalab`

- Name: `SERVER_USER`
- Value: `ynukalab`

### 3. SSH_PRIVATE_KEY
**Valeur:** Votre clé privée SSH

**Comment générer/obtenir la clé:**

**Option 1: Clé existante sur le serveur**
```bash
# Sur votre machine locale, SSH dans le serveur
ssh -i /path/to/key ynukalab@205.209.109.3

# Voir la clé publique existante
cat ~/.ssh/id_rsa
```

**Option 2: Générer une nouvelle clé**
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/ynukalab_rsa -N ""
```

**Copier la clé privée complète:**
```bash
cat ~/.ssh/ynukalab_rsa
```

Copier le contenu COMPLET (-----BEGIN RSA PRIVATE KEY----- à -----END RSA PRIVATE KEY-----)

- Name: `SSH_PRIVATE_KEY`
- Value: `[PASTE ENTIRE PRIVATE KEY]`

## Vérification

Après avoir configuré les secrets, le prochain `git push` vers `main` va automatiquement:

1. ✅ Build le site public (Ynuka Site) et l'admin panel
2. ✅ Copier les fichiers `dist/` via SCP
3. ✅ Copier les fichiers PHP (`api.php`, `config.php`)
4. ✅ Vérifier la déploiement avec SSH

## Voir les logs de déploiement

Allez à:
```
https://github.com/jacquesmasuruku2/ynukalabs/actions
```

Cliquer sur le workflow qui s'est exécuté pour voir les détails du déploiement.

## Troubleshooting

### "SSH Connection failed"
- Vérifier SERVER_HOST est correct
- Vérifier SERVER_USER est correct
- Vérifier SSH_PRIVATE_KEY est complète (BEGIN et END inclus)

### "Permission denied"
- La clé SSH n'a pas la bonne permission sur le serveur
- Essayer: `ssh-keyscan -H 205.209.109.3 >> ~/.ssh/known_hosts`

### "File not found on target"
- Vérifier le chemin de destination existe (`/home/ynukalab/public_html/`)
- Les permissions permettent d'écrire

## Workflows

### Deploy Ynuka Site (Public)
Déclenche quand vous modifiez quelque chose dans `Ynuka Site/`
- Build le site
- Copie `dist/` vers `/home/ynukalab/public_html/`
- Copie les fichiers PHP API

### Deploy Admin Panel
Déclenche quand vous modifiez quelque chose dans `Panel Admin/`
- Build le panel admin
- Copie `dist/` vers `/home/ynukalab/admin.ynukalabs.com/`
- Copie les fichiers PHP API

### Deploy Root Config
Déclenche quand vous modifiez les fichiers de config à la racine
- Copie `vercel.json`, documentation, etc.

## Processus de déploiement automatique

```
Vous faites:
   git push origin main
        ↓
GitHub Actions déclenche:
   1. Checkout du code
   2. npm install dans Ynuka Site/
   3. npm run build
   4. SCP upload des fichiers vers Interserver
   5. Vérification avec SSH
        ↓
   Ynuka Site mis à jour automatiquement ! 🚀
```

Une fois les secrets configurés, vous n'avez plus besoin de déployer manuellement. Chaque push fait le déploiement automatiquement.

