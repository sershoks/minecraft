# Projet Minecraft - Infrastructure et Gestion Automatique des Serveurs

## Résumé du Projet

Ce projet vise à automatiser la gestion et le déploiement de serveurs Minecraft sur **Google Cloud**. Il repose sur une architecture centralisée autour d’un serveur **BungeeCord** qui redirige les joueurs vers des serveurs **Spigot** dédiés à chaque équipe.

L'inscription des équipes se fait via **Google Forms**, avec un stockage des données dans **Google Sheets**. Un serveur **API** récupère ces données et déclenche un processus d’automatisation qui utilise **Terraform** pour provisionner dynamiquement des serveurs **Spigot**.

---

## Composants du Projet

1. **BungeeCord**
2. **Google Forms & Sheets**
3. **Serveur API**
4. **Terraform**
5. **Ansible**
6. **Persistance des Données**

---

## Détails des Composants

### 1. BungeeCord

Le **BungeeCord** est un serveur proxy Minecraft qui permet de gérer plusieurs serveurs **Spigot** sous un même réseau. Il joue un rôle crucial en redirigeant les joueurs vers les serveurs Minecraft appropriés en fonction des équipes, tout en offrant une gestion centralisée des connexions des joueurs.

**Fonctionnement de BungeeCord** :
- Lorsqu'un joueur se connecte à **BungeeCord**, il est automatiquement redirigé vers le serveur **Spigot** de l'équipe à laquelle il appartient.
- **BungeeCord** permet de gérer plusieurs serveurs **Spigot** et de les relier entre eux, ce qui est essentiel pour ce projet où chaque équipe a son propre serveur Minecraft.

**Avantages** :
- Centralisation de la gestion des connexions.
- Facilité de gestion de plusieurs serveurs Minecraft sans interruption de service.

- Voici un extrait du fichier **BungeeCord - Start-all.sh** pour démarrer le Serveur **BungeeCord** :
     
```hcl
cd /root/bungeecord
screen -dmS bungee java -jar /root/bungeecord/BungeeCord.ja
```
- Voici un extrait du fichier **BungeeCord - Stop-all.sh** pour stopper le Serveur **BungeeCord** :
```hcl
/usr/bin/screen -S bungee -X stuff "end$(echo -ne '\r')"
```
---

### 2. Google Forms & Sheets

**Google Forms** est utilisé pour recueillir les informations des équipes et de leurs joueurs, notamment :
- Le nom de l'équipe.
- Les noms des joueurs.

**Google Sheets** sert de base de données primaire pour stocker ces informations. Une fois que le formulaire est rempli, les données sont automatiquement enregistrées dans une feuille **Google Sheets**. Cette feuille peut ensuite être utilisée par le serveur API pour créer les serveurs **Spigot**.

**Fonctionnement** :
- Les équipes remplissent le formulaire **Google Forms**.
- Les données sont automatiquement transférées dans **Google Sheets**.
- Ces données sont ensuite traitées par un script **API** pour créer des serveurs **Spigot** automatiquement.

---

### 3. Serveur API

Le serveur **API** est dédiée est au cœur de l'automatisation. Elle récupère les inscriptions des équipes du **Google Forms** notamment le nom de l'équipe et les joueurs, et exécute les scripts nécessaires pour créer et configurer un serveur **Spigot** sur Google Cloud.
Plusieurs **fonctions** essentielles sont également présentes sur le serveur API pour assurer son bon fonctionnement.

**Fonctionnement** :
- Une requête **POST** est envoyée à l'API avec les informations de l'équipe.
- L'API appelle un script **Terraform** pour provisionner un serveur dédié.
- Le serveur API est responsable de la gestion des erreurs et de l'envoi de réponses appropriées à l'utilisateur avec l'adresse IP du serveur créé.

**Avantages** :
- Automatisation complète du processus de création des serveurs Minecraft.
- Gestion centralisée via une API unique.

- Voici le **Code de l'API** :
```hcl
const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/create-spigot-server', (req, res) => {
  const { team_name, player_names } = req.body;
  console.log(`Received request to create server for team: ${team_name}`);

  // Appeler le script shell pour gérer l'interaction avec Terraform
  const terraformProcess = exec(`./setup-terraform.sh ${team_name}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Terraform error: ${stderr}`);
      return res.status(500).send({ error: stderr });
    }
    console.log(`Terraform output: ${stdout}`);

    // Extraire l'adresse IP externe de la sortie
    const ipMatch = stdout.match(/spigot_external_ip\s*=\s*(\S+)/);
    const externalIp = ipMatch ? ipMatch[1] : 'IP non trouvée';

    // Appeler le script pour ajouter les joueurs à la whitelist
    const playerNamesString = player_names.join(' '); // Convertir la liste des noms en une chaîne
    exec(`./ajout-user-wl.sh ${playerNamesString}`, (playerErr, playerStdout, playerStderr) => {
      if (playerErr) {
        console.error(`Error adding players to whitelist: ${playerStderr}`);
        return res.status(500).send({ error: playerStderr });
      }
      console.log(`Players added to whitelist: ${playerStdout}`);

      // Appeler le script pour mettre à jour BungeeCord
      exec(`./update_bungeecord.sh "$(terraform output -raw team_name)" "$(terraform output -raw minecraft_ip)"`, (bungeeErr, bungeeStdout, bungeeStderr) => {
        if (bungeeErr) {
          console.error(`Error updating BungeeCord: ${bungeeStderr}`);
          return res.status(500).send({ error: bungeeStderr });
        }
        console.log(`BungeeCord updated: ${bungeeStdout}`);
        res.send({ message: 'Serveur créé, joueurs ajoutés à la whitelist, et BungeeCord mis à jour !', logs: stdout, external_ip: externalIp });
      });
    });
  });

  // Afficher les logs en temps réel
  terraformProcess.stdout.on('data', (data) => {
    console.log(`Terraform stdout: ${data}`);
  });

  terraformProcess.stderr.on('data', (data) => {
    console.error(`Terraform stderr: ${data}`);
  });
});

app.listen(port, () => {
  console.log(`API en écoute sur le port ${port}`);
});

```
**Fonctions du Serveur API** :
- add_whitelist.yml
- ajout-user-wl.sh
- app.js
- generate_inventory.sh
- output.tf
- setup-terraform.sh
- update_bungeerecord.sh
---

### 4. Terraform

**Terraform** est un outil d'infrastructure en tant que code (IaC) qui permet de provisionner des ressources sur **Google Cloud**. Dans ce projet, il est utilisé pour créer des instances **Spigot** pour chaque équipe.

**Fonctionnement** :
- Lorsqu'une équipe s'inscrit, la **Google Cloud Function** déclenche un script Terraform qui :
  - Crée une instance **Google Compute Engine** pour le serveur Minecraft.
  - Installe **Spigot** sur cette instance.
  - Configure les règles de pare-feu pour autoriser les connexions aux ports nécessaires (par exemple, 25565 pour Minecraft).
- Terraform garantit que la création du serveur est reproductible et cohérente à chaque fois.

**Avantages** :
- Provisionnement automatisé de l'infrastructure sur **Google Cloud**.
- Reproductibilité et gestion de l'infrastructure en versionnant le code **Terraform**.
  
   - Voici un extrait du fichier **Terraform - instance_spigot.tf** pour la création d'un serveur **Spigot** :

```hcl
provider "google" {
  project = "glowing-road-451209-k6"
  region  = "europe-west9"

resource "google_compute_instance" "spigot" {
  name         = "spigot-${replace(lower(var.teamname), "", "-")}"  # Remplacer _ par -
  machine_type = "e2-micro"
  zone         = "europe-west9-c"  # Zone Paris

  network_interface {
    network    = "default"
    subnetwork = "default"
    access_config {}
  }

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
    }
  }

  metadata = {
    ssh-keys = "your-ssh-user:ssh-rsa AAAAB3..."  # Remplace "your-ssh-user" et la clé SSH par la tienne
  }

  tags = ["spigot"]

  metadata_startup_script = <<EOT
    #!/bin/bash
    apt update && apt install -y openjdk-17-jdk wget screen
    mkdir -p /opt/minecraft
    cd /opt/minecraft
    wget http://34.155.14.195/Spigot-1.20.1.jar -O spigot.jar
    echo "eula=true" > eula.txt
    screen -dmS minecraft java -Xmx512M -jar spigot.jar nogui
  EOT
}

output "spigot_internal_ip" {
  value = google_compute_instance.spigot.network_interface[0].network_ip
}


resource "google_compute_firewall" "allow_minecraft" {
  name    = "allow-minecraft-ports"
  network = "default"
  priority = 1000
  direction = "INGRESS"
  target_tags = ["spigot"]

  allow {
    protocol = "tcp"
    ports    = ["25565", "25567", "22"]
  }

  source_ranges = ["0.0.0.0/0"]
}

```

 - Voici un extrait du fichier **Terraform - variables.tf** pour la création d'un serveur **Spigot** :

```hcl
variable "team_name" {
  description = "The name of the team"
  type        = string
}

variable "player1" {
  description = "The name of player 1"
  type        = string
}

variable "player2" {
  description = "The name of player 2"
  type        = string
}

variable "player3" {
  description = "The name of player 3"
  type        = string
}

variable "player4" {
  description = "The name of player 4"
  type        = string
}

```
---

### 5. Ansible

## Pourquoi Ansible a été intégré ?

Le projet repose déjà sur **Terraform** pour provisionner et gérer les ressources dans **Google Cloud**. Cependant, **Terraform** est principalement axé sur la gestion des infrastructures, c’est-à-dire la création des ressources (serveurs, réseaux, etc.), et il manque une couche pour gérer la configuration des serveurs après leur création. C'est là qu'**Ansible** entre en jeu, pour la gestion des configurations des serveurs Minecraft et des tâches récurrentes, telles que l'installation et la configuration de logiciels, la mise en place de règles spécifiques, ou encore la gestion des utilisateurs sur les serveurs.

### Les rôles complémentaires de Terraform et Ansible

- **Terraform** : Permet de déployer et configurer l'infrastructure cloud (serveurs, réseaux, etc.).
- **Ansible** : Gère la configuration des serveurs une fois qu'ils sont provisionnés par Terraform, en automatisant des tâches comme :
  - Installation de logiciels nécessaires (par exemple, Spigot, Java).
  - Configuration de paramètres système spécifiques.
  - Automatisation des tâches récurrentes de maintenance ou d'administration (comme la mise à jour des plugins, la gestion des utilisateurs ou l’ajout à des listes blanches).
  

   - Voici un extrait du fichier **Ansible - add_whitelist.yml** :

```hcl
- name: Ajouter des joueurs à la whitelist Minecraft
  hosts: minecraft
  become: yes
  tasks:
    - name: Ajouter {{ player1 }} à la whitelist
      shell: "mcrcon -H 127.0.0.1 -P 25575 -p 'damada' 'whitelist add {{ player1 }}'"

    - name: Ajouter {{ player2 }} à la whitelist
      shell: "mcrcon -H 127.0.0.1 -P 25575 -p 'damada' 'whitelist add {{ player2 }}'"

    - name: Ajouter {{ player3 }} à la whitelist
      shell: "mcrcon -H 127.0.0.1 -P 25575 -p 'damada' 'whitelist add {{ player3 }}'"

    - name: Ajouter {{ player4 }} à la whitelist
      shell: "mcrcon -H 127.0.0.1 -P 25575 -p 'damada' 'whitelist add {{ player4 }}'"

    - name: Sauvegarder la whitelist
      shell: "mcrcon -H 127.0.0.1 -P 25575 -p 'damada' 'whitelist reload'"
```
### 6. Persistance des Données

La persistance des données est essentielle pour garantir que les mondes Minecraft des joueurs ne soient pas perdus. Les mondes Minecraft (les fichiers de sauvegarde des serveurs) sont sauvegardés dans **Google Cloud Storage**, ce qui permet de les récupérer en cas de réinitialisation du serveur ou de suppression accidentelle.

**Fonctionnement** :
- Chaque serveur **Spigot** effectue régulièrement des sauvegardes de ses mondes Minecraft.
- Ces sauvegardes sont stockées dans **Google Cloud Storage**, où elles sont accessibles à tout moment.
- Le processus de sauvegarde est automatisé grâce à des scripts qui s'exécutent sur les serveurs.

**Avantages** :
- Sécurisation des données des joueurs.
- Sauvegarde régulière des mondes pour éviter la perte de données.

---

## Conclusion

Ce projet offre une solution complète et automatisée pour la gestion de serveurs Minecraft. Grâce à des outils comme **BungeeCord**, **Google Forms**, **Terraform**, et **Google Cloud**, nous avons créé une infrastructure robuste pour gérer des équipes et leurs serveurs Minecraft de manière efficace et sécurisée. La persistance des données garantit la sécurité des mondes Minecraft, et l'automatisation via **API** et **Terraform** assure une gestion simple et sans erreur des ressources.

Ce système est entièrement scalable et peut être adapté pour des compétitions ou des événements plus grands à l'avenir.
