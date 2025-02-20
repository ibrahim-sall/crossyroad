let scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.top = '10px';
scoreElement.style.left = '10px';
scoreElement.style.color = 'black';
scoreElement.style.fontSize = '20px';
scoreElement.style.padding = '10px';
scoreElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
scoreElement.style.border = '2px solid black';
scoreElement.style.borderRadius = '5px';
document.body.appendChild(scoreElement);


export function updateScore(poulet) {
    if (poulet != null) {
        const currentScore = Math.floor(poulet.position.z);
        const previousScore = parseInt(scoreElement.innerText.replace('Score: ', '')) || 0;
        if (currentScore >= previousScore) {
            scoreElement.innerText = `Score: ${currentScore}`;
        }
        return currentScore
    }
}
export function initializeScore() {
    scoreElement.innerText = 'Score: 0';
}