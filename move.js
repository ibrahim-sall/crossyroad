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
                if (startPosition.z > 1) {
                    poulet.position.z = startPosition.z - distance * progress;
                    poulet.position.y = Math.sin(progress * Math.PI) * 0.5;
                    poulet.rotation.y = Math.PI;
                    if (progress === 1) {
                        poulet.position.z = Math.round(poulet.position.z);
                    };
                    break;
                }
                break;
            case 'up':
                poulet.position.z = startPosition.z + distance * progress;
                poulet.position.y = Math.sin(progress * Math.PI) * 0.5;
                poulet.rotation.y = 0;
                if (progress === 1) {
                    poulet.position.z = Math.round(poulet.position.z);
                };
                break;

            case 'right':
                if (startPosition.x > -4) {
                    poulet.position.x = startPosition.x - distance * progress;
                    poulet.position.y = Math.sin(progress * Math.PI) * 0.5;
                    poulet.rotation.y = -Math.PI / 2;
                    if (progress === 1) poulet.position.x = Math.round(poulet.position.x);
                }
                break;
            case 'left':
                if (startPosition.x < 4) {
                    poulet.position.x = startPosition.x + distance * progress;
                    poulet.position.y = Math.sin(progress * Math.PI) * 0.5;
                    poulet.rotation.y = Math.PI / 2;
                    if (progress === 1) poulet.position.x = Math.round(poulet.position.x);
                    break;
                }
                break;
            case 'space':
                poulet.position.y = Math.sin(progress * Math.PI) * 0.5;
                break;
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

export function moveCamera(poulet, camera) {
    if (!poulet || !camera) {
        console.error('Poulet or camera is not defined');
        return;
    }

    const duration = 500;
    const startTime = performance.now();
    const startPosition = { z: camera.position.z };

    function animate() {
        const currentTime = performance.now();
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        //camera.position.z = startPosition.z + (poulet.position.z - startPosition.z) * progress;

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}   