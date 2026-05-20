# Configuration du déploiement automatique GitHub Actions

Le fichier `.githubworkflows/config.yml` est configuré pour déployer automatiquement votre projet sur votre serveur InterServer via FTP à chaque push sur la branche `main`.

## 🔧 Configuration des Secrets GitHub

Pour que le déploiement fonctionne, vous devez configurer les secrets suivants dans votre repository GitHub :

1. Allez sur votre repository GitHub
2. Cliquez sur **Settings** > **Secrets and variables** > **Actions**
3. Cliquez sur **New repository secret**
4. Ajoutez les secrets suivants :

### Secrets à configurer

| Nom du secret | Valeur |
|---------------|--------|
| `FTP_SERVER` | 205.209.109.3 |
| `FTP_USERNAME` | ynukalab |
| `FTP_PASSWORD` | ZA5!s7Qf |

## 🚀 Fonctionnement du déploiement

À chaque push sur la branche `main`, le workflow GitHub Actions :

1. **Checkout** : Récupère le code du repository
2. **Setup Node.js** : Installe Node.js version 18
3. **Install dependencies** : Exécute `npm install`
4. **Build project** : Exécute `npm run build`
5. **Copy PHP folder** : Copie le dossier `php` dans `dist/`
6. **Deploy via FTP** : Envoie le contenu de `dist/` vers `/public_html/` sur votre serveur

## 📁 Ce qui est déployé

Le dossier `dist/` contient :
- Votre application React buildée
- Le dossier `php/` avec l'API MySQL
- Tous les assets statiques (images, CSS, JS)

## 🔍 Vérifier le déploiement

Après un push sur `main`, vous pouvez :
1. Aller dans l'onglet **Actions** de votre repository GitHub
2. Cliquer sur le workflow en cours
3. Voir les logs de déploiement en temps réel

## ⚠️ Sécurité

- Les identifiants FTP sont stockés dans les secrets GitHub (jamais dans le code)
- Le déploiement ne se fait que sur la branche `main`
- Les logs GitHub Actions ne montrent pas les valeurs des secrets

## 🛠️ Déploiement manuel

Si vous voulez déployer sans faire un push :
1. Allez dans l'onglet **Actions**
2. Sélectionnez le workflow "Deploy Ynukalabs to InterServer"
3. Cliquez sur **Run workflow**
4. Sélectionnez la branche `main`
5. Cliquez sur **Run workflow**
