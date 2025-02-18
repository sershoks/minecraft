output "minecraft_ip" {
  value = google_compute_instance.spigot.network_interface[0].access_config[0].nat_ip
}