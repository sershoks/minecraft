provider "google" {
  project = "your-gcp-project"
  region  = "us-central1"
}

resource "google_compute_instance" "bungeecord" {
  name         = "bungeecord-proxy"
  machine_type = "e2-medium"
  zone         = "us-central1-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
    }
  }

  network_interface {
    network = "default"
    access_config {} # IP publique
  }

  metadata = {
    ssh-keys = "your-ssh-user:ssh-rsa AAAAB3..."
  }

  tags = ["bungeecord"]
}

output "bungeecord_ip" {
  value = google_compute_instance.bungeecord.network_interface[0].access_config[0].nat_ip
}