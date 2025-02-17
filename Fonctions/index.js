const { exec } = require("child_process");

exports.createSpigotServer = async (req, res) => {
    const teamData = req.body;
    const teamName = teamData.name.toLowerCase().replace(/\s/g, "-");
    const players = teamData.players;

    console.log(`📡 Création du serveur Minecraft pour l'équipe : ${teamName}`);

    // 🔥 Exécuter Terraform pour créer l’instance Spigot
    exec(`terraform apply -var='team_name=${teamName}' -auto-approve`, (err, stdout, stderr) => {
        if (err) {
            console.error(`❌ Erreur Terraform: ${stderr}`);
            return res.status(500).send({ error: stderr });
        }

        console.log(`✅ Serveur Spigot pour ${teamName} créé !`);
        res.status(200).send({ message: `Serveur pour ${teamName} créé !`, logs: stdout });
    });
};
