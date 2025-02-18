#!/bin/bash

# Récupérer l'IP depuis Terraform
MINECRAFT_IP=$(terraform output -raw minecraft_ip)

# Générer un fichier d'inventaire Ansible
cat <<EOF > inventory.ini
[minecraft]
$MINECRAFT_IP ansible_user=user ansible_ssh_private_key_file=~/.ssh/id_rsa
EOF

echo "✅ Inventaire Ansible mis à jour avec IP : $MINECRAFT_IP"