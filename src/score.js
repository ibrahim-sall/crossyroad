let scoreElement = document.createElement('div');
scoreElement.id = 'scoreElement';
document.body.appendChild(scoreElement);

export function updateScore(poulet) {
    if (poulet != null) {
        const currentScore = Math.floor(poulet.position.z);
        const previousScore = parseInt(scoreElement.innerText.replace('Score: ', '')) || 0;
        if (currentScore >= previousScore) {
            scoreElement.innerText = `Score: ${currentScore}`;
        }
        return currentScore;
    }
}

export function initializeScore() {
    scoreElement.innerText = 'Score: 0';
}