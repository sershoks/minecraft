const { CloudBuildClient } = require('@google-cloud/cloudbuild');

const client = new CloudBuildClient();

exports.createSpigotServer = async (req, res) => {
    const teamData = req.body;
    console.log(teamData);
    const teamName = teamData.name.toLowerCase().replace(/\s/g, "-");
    const players = teamData.players;

    console.log(`📡 Déclenchement du Cloud Build pour ${teamName}`);
    console.log(`👥 Joueurs : ${players.join(", ")}`);

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
        }
    };

    try {
        const [operation] = await client.createBuild(buildRequest);
        console.log(`✅ Cloud Build lancé pour ${teamName}`);
        res.status(200).send({ message: `Terraform lancé via Cloud Build pour ${teamName}` });
    } catch (error) {
        console.error(`❌ Erreur Cloud Build: ${error}`);
        res.status(500).send({ error: error.message });
    }
};
