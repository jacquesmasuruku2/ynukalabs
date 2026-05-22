# TICKET DE SUPPORT - InterServer

## 📋 INFORMATIONS DU COMPTE

**Objet:** Urgent - LiteSpeed Web Server arrêté | Domaine ynukalabs.com

**Demandeur:** Jacques Masuruku  
**Email:** jacquesmasuruku2@gmail.com  
**Domaine:** ynukalabs.com  
**IP Serveur:** 205.209.109.3  
**Compte DirectAdmin:** ynukalab  
**Plan:** Hébergement Web avec administration directe  

---

## ⚠️ DESCRIPTION DU PROBLÈME

**Statut:** CRITIQUE - Serveur web indisponible

Le LiteSpeed Web Server s'est arrêté sur mon compte ynukalabs.com et n'écoute plus sur les ports 80/443. Le domaine affiche actuellement une erreur 404 pour tous les fichiers.

### Informations techniques collectées:
- **Service affecté:** LiteSpeed Web Server (LSWS)
- **Statut du processus:** Inactif (pkill -9 lsws a arrêté le service)
- **Port HTTP:** 80 - Pas de processus en écoute
- **Port HTTPS:** 443 - Pas de processus en écoute
- **Fichiers en ligne:** OUI - Les fichiers HTML/JS/CSS sont présents sur le serveur
- **Permissions utilisateur:** Utilisateur régulier (ynukalab) - Pas de permissions root

### Logs/Diagnostic:
```
$ netstat -tlnp 2>/dev/null | grep -E ':(80|443)'
=> Aucun résultat (aucun processus en écoute)

$ ps aux | grep -E 'lshttpd|lscgid'
=> Aucun processus en cours d'exécution

$ /usr/local/lsws/bin/lswsctrl start
=> Permission denied (utilisateur régulier)
```

---

## 🔧 ACTION REQUISE

Veuillez exécuter la commande suivante sur le serveur vda6600 (205.209.109.3) **en tant que root:**

```bash
/usr/local/lsws/bin/lswsctrl start
```

Ou via systemctl (si disponible):
```bash
systemctl start lsws
```

---

## 📊 SERVICES SUPPLÉMENTAIRES À VÉRIFIER

Lors de la réactivation de LiteSpeed, veuillez vérifier également l'état des services suivants associés au compte:

### Services actifs confirmés:
- ✅ **Redis** - Service utilisateur en cours d'exécution (/home/ynukalab/.redis/redis.sock)
- ✅ **MySQL/Bases de données** - À confirmer
- ✅ **Service e-mail** - À confirmer (comptes e-mail présents dans DirectAdmin)

### Services disponibles:
- Node.js (Setup disponible dans DirectAdmin)
- Python (Setup disponible dans DirectAdmin)
- Perl modules (Setup disponible dans DirectAdmin)
- Git (Setup disponible dans DirectAdmin)

### Recommandations:
1. Confirmer que MySQL est actif
2. Confirmer que le service e-mail fonctionne correctement
3. Vérifier que Redis continue de fonctionner après le restart
4. S'assurer que les certificats SSL sont valides (les fichiers SSL affichent des erreurs 404)

---

## 📁 FICHIERS DÉPLOYÉS

Les fichiers d'application suivants sont présents et prêts à être servis:
- `index.html` - Page d'accueil
- `/assets/main-DlLviaTm.js` - Bundle JavaScript principal (916 KB)
- `/assets/main-ByRJmIdo.css` - Feuille de styles (164 KB)
- Fonts et ressources statiques (80+ fichiers)

Une fois LiteSpeed redémarré, tous les fichiers doivent être servís correctement sur https://www.ynukalabs.com

---

## 📞 CONTACT & SUIVI

- **Préférence de communication:** Email
- **Urgence:** Critique (site non accessible)
- **Délai acceptable:** Dès que possible

Merci de confirmer une fois LiteSpeed redémarré.

---

**Note:** Ce document a été généré le 20 mai 2026 à 07:55 UTC.