#!/bin/bash

# Vérifiez que le nom de l'équipe est passé en argument
if [ -z "$1" ]; then
  echo "Usage: $0 <team_name>"
  exit 1
fi

TEAM_NAME=$1
BACKEND_CONFIG="path=terraform/${TEAM_NAME}.tfstate"

# Initialiser Terraform avec le backend configuré et utiliser -reconfigure
terraform init -reconfigure -backend-config=${BACKEND_CONFIG}

# Appliquer la configuration Terraform
terraform apply -var="team_name=${TEAM_NAME}" -auto-approve