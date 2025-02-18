app.use(express.json());

app.post('/create-spigot-server', (req, res) => {
  const { team_name } = req.body;
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

    res.send({ message: 'Serveur créé !', logs: stdout, external_ip: externalIp });
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