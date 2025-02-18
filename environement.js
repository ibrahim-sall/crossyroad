import { loadModel } from './loader.js';



const envs = {};
const more = {};
const car = {};

async function loadEnv(modelPath, texturePath) {
    const model = await loadModel(modelPath, texturePath);
    return model;

}
const blockPosition = [];
const treePositions = [];
export const woods = [];
export const cars = [];

const list_vehicles = ['blue_car', 'green_car', 'taxi', 'purple_car', 'red_truck']


export function PositionOccupied(x, z, direction) {
    switch (direction) {
        case 'up':
            return treePositions.some(pos => pos.x === x && pos.z === z + 1);
        case 'down':
            return treePositions.some(pos => pos.x === x && pos.z === z - 1);
        case 'right':
            return treePositions.some(pos => pos.x === x - 1 && pos.z === z);
        case 'left':
            return treePositions.some(pos => pos.x === x + 1 && pos.z === z);
        default:
            return treePositions.some(pos => pos.x === x && pos.z === z);
    }
}
export function PositionOccupiedWood(x, z) {
    return woods.some(wood => Math.abs(wood.position.z - z) < 0.7 && Math.abs(wood.position.x - x) < wood.userData.size);
}
export function PositionOccupiedRiver(x, z) {
    return blockPosition.some(block => block.z === z && block.nature === 'river') && !PositionOccupiedWood(x, z);
}
export function isHitByCar(x, z) {
    return cars.some(voiture => Math.abs(voiture.position.z - z) < 0.5 && Math.abs(voiture.position.x - x) < 0.4);
}

async function initializeEnvs() {
    envs['grass'] = await loadEnv('assets/models/environment/grass/model.obj', 'assets/models/environment/grass/light-grass.png');
    envs['river'] = await loadEnv('assets/models/environment/river/0.obj', 'assets/models/environment/river/0.png');
    envs['road'] = await loadEnv('assets/models/environment/road/model.obj', 'assets/models/environment/road/stripes-texture.png');
}
async function initializeMore() {
    for (let i = 0; i < 3; i++) {
        more['tree' + i] = await loadEnv('assets/models/environment/tree/' + i + '/0.obj', 'assets/models/environment/tree/' + i + '/0.png');
    }
    for (let i = 0; i < 3; i++) {
        more['wood' + i] = await loadEnv('assets/models/environment/log/' + i + '/0.obj', 'assets/models/environment/log/' + i + '/0.png');
    }
}
async function initializeCar() {
    list_vehicles.forEach(async (nom) => {
        car[nom] = await loadEnv(`assets/models/vehicles/${nom}/0.obj`, `assets/models/vehicles/${nom}/0.png`);
    });
}

initializeEnvs();
initializeMore();
initializeCar();


export async function getNext(x, y, z) {
    if (Object.keys(envs).length === 0 || Object.keys(more).length === 0 || Object.keys(car).length === 0) {
        await initializeEnvs();
        await initializeMore();
        await initializeCar();
    }

    if (blockPosition.some(block => block.z === Math.floor(z))) {
        return null;
    };
    const envKeys = Object.keys(envs);
    let randomKey;
    const previousBlock = blockPosition.find(block => block.z === Math.floor(z) - 1);

    if (previousBlock && (previousBlock.nature === 'river' || previousBlock.nature === 'road')) {
        randomKey = envKeys[Math.random() < 0.6 ? 0 : 1];
    } else {
        randomKey = envKeys[Math.floor(Math.random() * envKeys.length)];
    }
    if (z == 0) {
        randomKey = 'grass';
    }
    const randomEnv = envs[randomKey].clone();
    if (randomKey === 'grass') {
        const treeCount = Math.floor(Math.random() * 8) + 1;
        for (let i = 0; i < treeCount; i++) {
            const treeKey = 'tree' + Math.floor(Math.random() * 3);
            const tree = more[treeKey].clone();
            const randomX = Math.floor(Math.random() * 16 - 8);
            if (z === 0 && randomX === 0) {
                continue;
            }
            tree.position.set(randomX, 0.4, 0);
            treePositions.push({ x: randomX, z: Math.floor(z) });
            randomEnv.add(tree);
        }
    }
    if (randomKey === 'river') {
        const woodCount = Math.floor(Math.random() * 4) + 1;
        const previousRiver = blockPosition.find(block => block.z === Math.floor(z) - 1 && block.nature === 'river');
        const previousWoods = woods.filter(wood => Math.floor(wood.position.z) === Math.floor(z) - 1);

        for (let i = 0; i < woodCount; i++) {
            const woodKey = 'wood' + Math.floor(Math.random() * 3);
            const wood = more[woodKey].clone();
            let randomX;

            if (previousRiver && previousWoods.length > 0) {
                const previousWood = previousWoods[i % previousWoods.length];
                randomX = previousWood.position.x;
            } else {
                randomX = Math.floor(Math.random() * 16 - 8);
            }

            wood.position.set(randomX, -0.5, Math.floor(z));
            wood.userData = { size: woodKey[4], position: { x: randomX, z: Math.floor(z) } };
            woods.push(wood);
            randomEnv.add(wood);
        }
    }
    if (randomKey === 'road') {
        const carCount = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < carCount; i++) {
            const carKey = list_vehicles[Math.floor(Math.random() * list_vehicles.length)];
            const voiture = car[carKey].clone();
            let randomX;
            let attempts = 0;
            do {
                randomX = Math.floor(Math.random() * 16 - 8);
                attempts++;
            } while (cars.some(car => Math.abs(car.position.x - randomX) < 2 && Math.floor(car.position.z) === Math.floor(z)) && attempts < 2);
            voiture.position.set(Math.floor(randomX), 0, Math.floor(z));
            voiture.rotation.y = Math.PI / 2;
            cars.push(voiture);
        }
    }
    randomEnv.position.set(x, y, Math.floor(z));
    randomEnv.scale.set(1, 1, 1);
    blockPosition.push({ nature: randomKey, z: Math.floor(z) });
    return randomEnv;
}



function removeOldBlocks(camera, scene) {
    const cameraZ = camera.position.z;
    for (let i = 0; i < scene.children.length; i++) {
        const obj = scene.children[i];
        if (obj.position.z > cameraZ + 10) {
            scene.remove(obj);
        }
    }
}
