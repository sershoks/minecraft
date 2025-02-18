# Projet Minecraft - Infrastructure et Gestion Automatique des Serveurs

## Résumé du Projet

Ce projet consiste à créer une infrastructure pour un jeu Minecraft avec un serveur de redirection **BungeeCord** et des serveurs **Spigot** pour chaque équipe, entièrement automatisée via Terraform et Google Cloud. L'inscription des équipes et de leurs joueurs sera effectuée via un formulaire **Google Form**, les données seront stockées dans **Google Sheets** et gérées dans **Firestore**, avec des **Cloud Functions** déclenchant la création des serveurs.

### Composants du Projet :
1. **BungeeCord** : Serveur de redirection pour l'accès aux différents serveurs Spigot.
2. **Google Forms & Sheets** : Formulaire d'inscription des équipes et stockage des données.
4. **Serveur API** : Automatisation de la création des serveurs Spigot à partir des données du formulaire.
5. **Terraform** : Provisionnement de l'infrastructure des serveurs Spigot.
6. **Persistance des données** : Sauvegarde des mondes Minecraft pour éviter la perte de données.

---

## Étape 1 : Création du Formulaire Google

1. **Créer un formulaire Google** pour permettre aux joueurs de s'inscrire.
   - **Champs nécessaires** :
     - Nom de l'équipe.
     - Pseudos des 4 joueurs de l'équipe.
   - Ce formulaire sera connecté à un **Google Sheet** pour collecter les réponses.

2. **Google Sheet** : 
   - Lien entre le formulaire et la feuille de calcul.
   - Les colonnes suivantes seront créées :
     - `Nom de l'équipe`
     - `Pseudo 1`
     - `Pseudo 2`
     - `Pseudo 3`
     - `Pseudo 4`

3. **Vérification des pseudos** : 
   - Lors de l'inscription via le formulaire, les pseudos des joueurs seront vérifiés pour s'assurer qu'un joueur ne s'inscrit pas deux fois.

---

## Étape 2 : Stockage des Données dans Google Firestore

Les données collectées depuis Google Sheets seront transférées vers **Google Firestore** pour une gestion centralisée et un accès facile par la suite.

1. **Structure de la base Firestore** :
   - Collection `teams` avec des documents représentant chaque équipe, contenant :
     - `team_name` : le nom de l'équipe.
     - `players` : tableau contenant les pseudos des joueurs.
   
---

## Étape 4 : Serveur API

### Configuration du Serveur API

Le serveur API à pour but de récupérer les données du formulaire et de récuperé les variables pour générer les VM
output "bungeecord_ip" {
  value = google_compute_instance.bungeecord.network_interface[0].access_config[0].nat_ip
}
