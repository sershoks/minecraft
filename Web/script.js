// 🔥 Configurer Firebase (modifie avec tes clés)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 🔥 Fonction pour envoyer les données à Firestore
document.getElementById('teamForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const teamName = document.getElementById('teamName').value.toLowerCase().replace(/\s/g, "-");
    const players = [
        document.getElementById('player1').value,
        document.getElementById('player2').value,
        document.getElementById('player3').value,
        document.getElementById('player4').value
    ];

    // ⚠️ Vérifier que tous les pseudos sont uniques dans Firestore avant d'envoyer
    const teamsRef = db.collection('teams');
    const snapshot = await teamsRef.get();
    
    let usedPlayers = [];
    snapshot.forEach(doc => {
        usedPlayers = usedPlayers.concat(doc.data().players);
    });

    for (let player of players) {
        if (usedPlayers.includes(player)) {
            document.getElementById('message').textContent = `❌ Le pseudo ${player} est déjà utilisé !`;
            return;
        }
    }

    // ✅ Ajouter l'équipe à Firestore
    await teamsRef.doc(teamName).set({ name: teamName, players });

    // ✅ Déclencher la Cloud Function pour créer le serveur Spigot
    fetch("https://REGION-PROJECT-ID.cloudfunctions.net/createSpigotServer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: teamName, players })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('message').textContent = `✅ Serveur de ${teamName} créé !`;
    })
    .catch(error => {
        document.getElementById('message').textContent = `❌ Erreur: ${error.message}`;
    });
});
