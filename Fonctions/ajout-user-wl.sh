#!/bin/bash

# Vérifier que 4 arguments sont fournis
if [ "$#" -ne 4 ]; then
    echo "❌ Usage: ./script.sh pseudo1 pseudo2 pseudo3 pseudo4"
    exit 1
fi

PSEUDO1=$1
PSEUDO2=$2
PSEUDO3=$3
PSEUDO4=$4

# 1️⃣ Récupérer l'IP depuis Terraform
MINECRAFT_IP=$(terraform output -raw minecraft_ip)

# 2️⃣ Générer un fichier d'inventaire Ansible
cat <<EOF > inventory.ini
[minecraft]
$MINECRAFT_IP ansible_user=user ansible_ssh_private_key_file=~/.ssh/id_rsa
EOF

echo "✅ Inventaire Ansible mis à jour avec IP : $MINECRAFT_IP"

# 3️⃣ Exécuter Ansible avec les pseudos en paramètres
ansible-playbook -i inventory.ini add_whitelist.yml --extra-vars "player1=$PSEUDO1 player2=$PSEUDO2 player3=$PSEUDO3 p>

# 4️⃣ Purger l'inventaire après exécution
rm -f inventory.ini
echo "✅ Inventaire purgé"