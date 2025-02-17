# Utilisez une data source pour récupérer les credentials depuis Secret Manager
data "google_secret_manager_secret_version" "credentials" {
  name = "projects/649751663521/secrets/ServiceAccountJSON/versions/1"
}

# Configurez le provider Google en utilisant les credentials récupérés
provider "google" {
  credentials = base64decode(data.google_secret_manager_secret_version.credentials.secret_data)
  project = "glowing-road-451209-k6"
  region  = "europe-west9"  # Région Paris
}

resource "google_compute_instance" "bungeecord" {
  name         = "bungeecord-${var.team_name}"
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
    ssh-keys = "your-ssh-user:ssh-rsa AAAAB3..."
  }

  tags = ["bungeecord"]

  metadata_startup_script = <<EOT
    #!/bin/bash
    apt update && apt install -y openjdk-17-jdk wget screen
    mkdir -p /opt/minecraft
    cd /opt/minecraft
    wget https://download.getbukkit.org/spigot/spigot-1.20.1.jar -O bungeecord.jar
    echo "eula=true" > eula.txt
    screen -dmS bungeecord java -Xmx512M -jar bungeecord.jar nogui
  EOT
}

output "bungeecord_internal_ip" {
  value = google_compute_instance.bungeecord.network_interface[0].network_ip
}
