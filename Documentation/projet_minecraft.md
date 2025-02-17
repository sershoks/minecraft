# Projet Minecraft - Infrastructure et Gestion Automatique des Serveurs

## Résumé du Projet

Ce projet consiste à créer une infrastructure pour un jeu Minecraft avec un serveur de redirection **BungeeCord** et des serveurs **Spigot** pour chaque équipe, entièrement automatisée via Terraform et Google Cloud. L'inscription des équipes et de leurs joueurs sera effectuée via un formulaire **Google Form**, les données seront stockées dans **Google Sheets** et gérées dans **Firestore**, avec des **Cloud Functions** déclenchant la création des serveurs.

### Composants du Projet :
1. **BungeeCord** : Serveur de redirection pour l'accès aux différents serveurs Spigot.
2. **Google Forms & Sheets** : Formulaire d'inscription des équipes et stockage des données.
3. **Google Firestore** : Base de données pour gérer les équipes et les joueurs.
4. **Google Cloud Functions** : Automatisation de la création des serveurs Spigot à partir des données du formulaire.
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

## Étape 3 : Déclenchement Automatique de la Création des Serveurs Spigot

### Google Cloud Function
1. **Cloud Function** en Node.js sera utilisée pour écouter les inscriptions sur Firestore et déclencher la création des serveurs Spigot.
2. **Vérification des joueurs uniques** : 
   - La Cloud Function vérifiera si les pseudos sont déjà utilisés dans Firestore.
   - Si un pseudo est déjà enregistré, l'inscription sera rejetée avec un message d'erreur.
3. **Création du serveur Spigot** :
   - Une fois l'équipe validée, la Cloud Function exécutera Terraform pour créer un serveur Spigot.
   - Le nom du serveur sera basé sur le nom de l'équipe.

---

## Étape 4 : Provisionnement des Serveurs avec Terraform

### Configuration du Serveur BungeeCord

Le serveur de redirection **BungeeCord** sera créé à l'aide de **Terraform** sur Google Cloud.

```hcl
provider "google" {
  project = "minecraft-project"
  region  = "europe-west9"
}

resource "google_compute_instance" "bungeecord" {
  name         = "bungeecord-proxy"
  machine_type = "e2-medium"
  zone         = "europe-west9-b"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
    }
  }

  network_interface {
    network = "default"
  }

  metadata = {
    ssh-keys = "your-ssh-user:ssh-rsa AAAAB3..."
  }

  tags = ["bungeecord"]
}

output "bungeecord_ip" {
  value = google_compute_instance.bungeecord.network_interface[0].access_config[0].nat_ip
}
