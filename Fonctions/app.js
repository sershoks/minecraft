const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/create-spigot-server', (req, res) => {
  const { team_name, player_names } = req.body;
  console.log(`Received request to create server for team: ${team_name}`);

  // Appeler le script shell pour gérer l'interaction avec Terraform
  const terraformProcess = exec(`./setup-terraform.sh ${team_name}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Terraform error: ${stderr}`);
      return res.status(500).send({ error: stderr });
    }
    console.log(`Terraform output: ${stdout}`);

    // Extraire l'adresse IP externe de la sortie
    const ipMatch = stdout.match(/spigot_external_ip\s*=\s*(\S+)/);
    const externalIp = ipMatch ? ipMatch[1] : 'IP non trouvée';

    // Appeler le script pour ajouter les joueurs à la whitelist
    const playerNamesString = player_names.join(' '); // Convertir la liste des noms en une chaîne
    exec(`./ajout-user-wl.sh ${playerNamesString}`, (playerErr, playerStdout, playerStderr) => {
      if (playerErr) {
        console.error(`Error adding players to whitelist: ${playerStderr}`);
        return res.status(500).send({ error: playerStderr });
      }
      console.log(`Players added to whitelist: ${playerStdout}`);

      // Appeler le script pour mettre à jour BungeeCord
      exec(`./update_bungeecord.sh "$(terraform output -raw team_name)" "$(terraform output -raw minecraft_ip)"`, (bungeeErr, bungeeStdout, bungeeStderr) => {
        if (bungeeErr) {
          console.error(`Error updating BungeeCord: ${bungeeStderr}`);
          return res.status(500).send({ error: bungeeStderr });
        }
        console.log(`BungeeCord updated: ${bungeeStdout}`);
        res.send({ message: 'Serveur créé, joueurs ajoutés à la whitelist, et BungeeCord mis à jour !', logs: stdout, external_ip: externalIp });
      });
    });
  });

  // Afficher les logs en temps réel
  terraformProcess.stdout.on('data', (data) => {
    console.log(`Terraform stdout: ${data}`);
  });

  terraformProcess.stderr.on('data', (data) => {
    console.error(`Terraform stderr: ${data}`);
  });
});

app.listen(port, () => {
  console.log(`API en écoute sur le port ${port}`);
});
