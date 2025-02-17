resource "google_compute_instance" "spigot" {
  name         = "spigot-${var.team_name}"
  machine_type = "e2-micro"
  zone         = "europe-west1-b"  # Zone Paris

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

  tags = ["spigot"]

  metadata_startup_script = <<EOT
    #!/bin/bash
    apt update && apt install -y openjdk-17-jdk wget screen
    mkdir -p /opt/minecraft
    cd /opt/minecraft
    wget https://download.getbukkit.org/spigot/spigot-1.20.1.jar -O spigot.jar
    echo "eula=true" > eula.txt
    screen -dmS minecraft java -Xmx512M -jar spigot.jar nogui
  EOT
}

output "spigot_internal_ip" {
  value = google_compute_instance.spigot.network_interface[0].network_ip
}
