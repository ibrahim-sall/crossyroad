export function movePoulet(poulet, direction) {
    const distance = 1;
    const duration = 500;
    const startTime = performance.now();
    const startPosition = { x: poulet.position.x, z: poulet.position.z };

    function animate() {
        const currentTime = performance.now();
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        switch (direction) {
            case 'down':
                poulet.position.z = startPosition.z - distance * progress;
                poulet.position.y = Math.sin(progress * Math.PI) * 0.5;
                poulet.rotation.y = Math.PI;
                break;
            case 'up':
                poulet.position.z = startPosition.z + distance * progress;
                poulet.position.y = Math.sin(progress * Math.PI) * 0.5;
                poulet.rotation.y = 0;
                break;
            case 'right':
                poulet.position.x = startPosition.x - distance * progress;
                poulet.position.y = Math.sin(progress * Math.PI) * 0.5;
                poulet.rotation.y = -Math.PI / 2;
                break;
            case 'left':
                poulet.position.x = startPosition.x + distance * progress;
                poulet.position.y = Math.sin(progress * Math.PI) * 0.5;
                poulet.rotation.y = Math.PI / 2;
                break;
            case 'up':
                poulet.position.y = Math.sin(progress * Math.PI) * 0.5;
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}
