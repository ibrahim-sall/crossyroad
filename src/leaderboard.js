import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const LEADERBOARD_COLLECTION = 'leaderboard';

export async function saveScore(name, score) {
    try {
        await addDoc(collection(db, LEADERBOARD_COLLECTION), {
            name: name,
            score: score
        });
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

export async function getLeaderboard() {
    const q = query(collection(db, LEADERBOARD_COLLECTION), orderBy('score', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);
    const leaderboard = [];
    querySnapshot.forEach((doc) => {
        leaderboard.push(doc.data());
    });
    return leaderboard;
}

export async function displayLeaderboard() {
    const leaderboard = await getLeaderboard();
    const leaderboardElement = document.getElementById('leaderboard');
    leaderboardElement.innerHTML = '<h2>Leaderboard</h2>';
    leaderboard.slice(0, 5).forEach((entry, index) => {
        const entryElement = document.createElement('div');
        entryElement.innerText = `${index + 1}. ${entry.name} - ${entry.score}`;
        leaderboardElement.appendChild(entryElement);
    });
}