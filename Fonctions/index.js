const { exec } = require("child_process");

exports.createSpigotServer = async (req, res) => {
    const teamData = req.body;
    console.log(teamData);
    const teamName = teamData.name.toLowerCase().replace(/\s/g, "-");
    const players = teamData.players;

    console.log(`📡 Création du serveur Minecraft pour l'équipe : ${teamName}`);

<<<<<<< HEAD
    if (!teamName || !players || players.length !== 4) {
        console.error(`❌ Erreur : Données invalides`);
        return res.status(400).send({ error: "Données invalides" });
    }

    // ✅ Déclencher Cloud Build en passant les variables Terraform
    const buildRequest = {
        projectId: "glowing-road-451209-k6",
        build: {
            steps: [
                {
                    name: "hashicorp/terraform:latest",
                    args: ["init"]
                },
                {
                    name: "hashicorp/terraform:latest",
                    args: [
                        "apply",
                        "-auto-approve",
                        `-var=team_name=${teamName}`,
                        `-var=player1=${players[0]}`,
                        `-var=player2=${players[1]}`,
                        `-var=player3=${players[2]}`,
                        `-var=player4=${players[3]}`
                    ]
                }
            ]
=======
    // 🔥 Exécuter Terraform pour créer l’instance Spigot
    exec(`terraform apply -var='team_name=${teamName}' -auto-approve`, (err, stdout, stderr) => {
        if (err) {
            console.error(`❌ Erreur Terraform: ${stderr}`);
            return res.status(500).send({ error: stderr });
>>>>>>> 241047b (ct mieu avant)
        }

        console.log(`✅ Serveur Spigot pour ${teamName} créé !`);
        res.status(200).send({ message: `Serveur pour ${teamName} créé !`, logs: stdout });
    });
};
