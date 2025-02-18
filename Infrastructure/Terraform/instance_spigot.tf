provider "google" {
  project = "glowing-road-451209-k6"
  region  = "europe-west9"
}
terraform {
  backend "local" {
    path = "${var.team_name}.tfstate"
  }
}
resource "google_compute_instance" "spigot" {
  name         = "spigot-${var.team_name}"
  machine_type = "n2-standard-2"
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
    ssh-keys = "user:${file("~/.ssh/id_rsa.pub")}"
  }

  tags = ["spigot"]

metadata_startup_script = <<EOT
    #!/bin/bash
    apt update && apt install -y openjdk-17-jdk wget screen
    mkdir -p /opt/minecraft
    cd /opt/minecraft
    wget http://34.155.14.195/Spigot-1.20.1.jar -O spigot.jar
    echo "eula=true" > eula.txt
    screen -dmS minecraft java -jar spigot.jar nogui
  EOT
}

output "spigot_external_ip" {
  value = google_compute_instance.spigot.network_interface[0].access_config[0].nat_ip
}
