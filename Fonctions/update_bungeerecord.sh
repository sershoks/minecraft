#!/bin/bash

# Vérification des arguments
if [ "$#" -ne 2 ]; then
    echo "❌ Usage: $0 <team_name> <minecraft_ip>"
    exit 1
fi

TEAM_NAME=$1
MINECRAFT_IP=$2
BUNGEE_IP="10.200.0.4"
SSH_USER="root"
SSH_KEY="~/.ssh/terraform_key"
CONFIG_PATH="/root/bungeecord/config.yml"
TEMP_FILE="/root/bungeecord/config_tmp.yml"

echo "✅ Connexion SSH à $BUNGEE_IP avec clé $SSH_KEY..."
ssh -i $SSH_KEY -T $SSH_USER@$BUNGEE_IP <<EOF

    echo "🚀 Arrêt de BungeeCord..."
    /root/stop_all.sh

    echo "🔧 Modification de $CONFIG_PATH..."

    # Insérer après la 8ème ligne du fichier
    awk 'NR==8 {print ""; print "  '"$TEAM_NAME"':"; print "    motd: \"&1Serveur de '"$TEAM_NAME"'\""; print "    add>

    # Remplacer l'ancien fichier par le nouveau
    mv $TEMP_FILE $CONFIG_PATH

    echo "✅ Redémarrage de BungeeCord..."
    /root/start_all.sh
EOF

echo "🎉 Mise à jour de BungeeCord terminée avec succès !"