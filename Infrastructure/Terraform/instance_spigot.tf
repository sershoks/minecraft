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
