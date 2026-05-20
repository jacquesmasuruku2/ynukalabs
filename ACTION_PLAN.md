# 📞 GUIDE D'ACTION - Contacter InterServer Support

**Situation:** LiteSpeed Web Server est arrêté sur votre serveur  
**Urgence:** CRITIQUE - Votre site est inaccessible  
**Durée estimée:** 15-30 minutes après contact  

---

## 🚀 ÉTAPE 1: Soumettre le ticket via le portal InterServer

### Option A: Portal Web (RECOMMANDÉ - Plus rapide)

1. Allez à **https://my.interserver.net/support**
2. Connectez-vous avec:
   - **Email:** jacquesmasuruku2@gmail.com
   - **Mot de passe:** [Votre mot de passe InterServer]
3. Cliquez sur **"Create New Ticket"**

4. Remplissez le formulaire:
   ```
   Subject: [URGENT] LiteSpeed Web Server Arrêté - ynukalabs.com
   
   Category: Services > Web Server > Issue
   
   Priority: Critical / High
   
   Description: [Copiez le contenu du fichier SUPPORT_TICKET_DETAILED.txt ci-dessous]
   ```

5. Cliquez sur **Submit**

---

## 📧 ÉTAPE 2: Email direct (Alternative rapide)

**À envoyer à:** billing@interserver.net

**Subject:** [URGENT] LiteSpeed Web Server Down - ynukalabs.com

**Corps du message:** [Copiez le contenu du fichier SUPPORT_EMAIL_SIMPLE.txt]

---

## ☎️ ÉTAPE 3: Appel téléphonique (Si urgent)

**Numéro:** +1 877-566-8398  
**Heures:** 24/7 (InterServer offre support 24h)

**What to say:**
```
"Hello, my LiteSpeed Web Server is down on account ynukalabs.com (IP 205.209.109.3).
The server needs to be restarted by executing: /usr/local/lsws/bin/lswsctrl start

Account username: ynukalab
Email: jacquesmasuruku2@gmail.com

This is critical - my website is completely offline."
```

---

## 📋 CONTENU À COPIER/COLLER

### Pour le portal ou email:

**Sujet:** [URGENT] LiteSpeed Web Server Arrêté - ynukalabs.com (205.209.109.3)

**Corps:**
```
Bonjour,

Je signale un problème CRITIQUE sur mon compte d'hébergement.

INFORMATIONS DU COMPTE:
- Domaine: ynukalabs.com
- IP Serveur: 205.209.109.3
- Utilisateur DirectAdmin: ynukalab
- Email: jacquesmasuruku2@gmail.com

PROBLÈME:
LiteSpeed Web Server s'est arrêté et n'écoute plus sur les ports 80/443. 
Le domaine affiche actuellement une erreur 404 pour tous les fichiers.

VÉRIFICATIONS EFFECTUÉES:
✓ Les fichiers d'application SONT présents sur le serveur
✓ Les permissions des fichiers sont correctes (644)
✗ Aucun processus lshttpd en cours d'exécution
✗ Les ports 80 et 443 n'ont aucun service en écoute

ACTION REQUISE:
Veuillez exécuter la commande suivante (en tant que root):

    /usr/local/lsws/bin/lswsctrl start

SERVICES À VÉRIFIER:
Lors du redémarrage, veuillez également vérifier:
1. MySQL/MariaDB (bases de données)
2. Service E-mail (comptes e-mail configurés)
3. Redis (actuellement actif pour utilisateur ynukalab)
4. Certificats SSL/TLS

URGENCE: CRITIQUE
- Site complètement indisponible
- Tous les utilisateurs ne peuvent pas accéder à https://www.ynukalabs.com
- Attente rapide requise

Veuillez confirmer une fois le service redémarré.

Merci,
Jacques Masuruku
jacquesmasuruku2@gmail.com
```

---

## ✅ APRÈS REDÉMARRAGE

Une fois qu'InterServer a redémarré LiteSpeed:

1. **Testez le site:**
   ```
   Allez à: https://www.ynukalabs.com/
   ```

2. **Vérifiez les logs:** 
   ```
   ssh ynukalab@205.209.109.3
   ps aux | grep -E 'lshttpd|lscgid'
   # Devrait afficher les processus en cours d'exécution
   ```

3. **Ouvrez une console du navigateur:** 
   ```
   F12 > Console
   Vérifiez qu'il n'y a plus d'erreurs 404 sur main-DlLviaTm.js
   ```

4. **Confirmez la résolution:**
   ```
   Répondez au ticket avec confirmation
   "LiteSpeed a été redémarré avec succès - site est en ligne"
   ```

---

## 📞 CONTACTS DIRECTS

| Service | Contact | Heures |
|---------|---------|--------|
| **Support Urgent** | +1 877-566-8398 | 24/7 |
| **Support Email** | billing@interserver.net | 24h |
| **Portal Web** | https://my.interserver.net | 24/7 |
| **Facturation** | https://my.interserver.net/billing | 24/7 |

---

## 🔄 ESCALADE (Si pas de réponse après 30 min)

Si le support InterServer ne répond pas rapidement:

1. **Email de suivi:** Envoyez un deuxième email avec "URGENT - FOLLOW UP"
2. **Chat support:** Cherchez l'option de chat sur le portal
3. **Appel téléphonique:** Appelez directement si possible

---

## 📌 NOTES IMPORTANTES

- ✅ **Vos fichiers sont SAUFS** - Rien n'a été perdu
- ✅ **Le problème n'est PAS dans votre code** - C'est un problème de serveur
- ✅ **La solution est simple** - Juste un restart du serveur Web
- ✅ **Tout est documenté** - InterServer a tous les détails

---

## 🔐 Informations à avoir prêtes

Gardez ces informations à portée de main lors du contact:

```
Domaine: ynukalabs.com
IP: 205.209.109.3
Utilisateur: ynukalab
Email: jacquesmasuruku2@gmail.com
Problème: LiteSpeed down
Commande: /usr/local/lsws/bin/lswsctrl start
```

---

**Temps requis pour contacter:** 2 minutes  
**Temps requis pour le support de redémarrer:** 5-15 minutes  
**Temps total avant site online:** 10-30 minutes  

**Le moment d'agir: MAINTENANT! 🚀**