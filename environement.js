import { loadModel } from './loader.js';



const envs = {};
const more = {};

async function loadEnv(modelPath, texturePath) {
    const model = await loadModel(modelPath, texturePath);
    return model;

}
const blockPosition = [];
const treePositions = [];
const woods = [];


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
export function PositionOccupiedWood(x, z, direction) {
    switch (direction) {
        case 'up':
            return woodPositions.some(pos => pos.x === x && pos.z === z + 1);
        case 'down':
            return woodPositions.some(pos => pos.x === x && pos.z === z - 1);
        case 'right':
            return woodPositions.some(pos => pos.x === x - 1 && pos.z === z);
        case 'left':
            return woodPositions.some(pos => pos.x === x + 1 && pos.z === z);
        default:
            return woodPositions.some(pos => pos.x === x && pos.z === z);
    }
}

async function initializeEnvs() {
    envs['grass'] = await loadEnv('assets/models/environment/grass/model.obj', 'assets/models/environment/grass/light-grass.png');
    envs['river'] = await loadEnv('assets/models/environment/river/0.obj', 'assets/models/environment/river/0.png');
}
async function initializeMore() {
    for (let i = 0; i < 3; i++) {
        more['tree' + i] = await loadEnv('assets/models/environment/tree/' + i + '/0.obj', 'assets/models/environment/tree/' + i + '/0.png');
    }
    for (let i = 0; i < 3; i++) {
        more['wood' + i] = await loadEnv('assets/models/environment/log/' + i + '/0.obj', 'assets/models/environment/log/' + i + '/0.png');
    }
}

initializeEnvs();
initializeMore();


export async function getNext(x, y, z) {
    if (Object.keys(envs).length === 0 || Object.keys(more).length === 0) {
        await initializeEnvs();
        await initializeMore();
    }

    if (blockPosition.some(block => block.z === Math.floor(z))) {
        return null;
    };
    const envKeys = Object.keys(envs);
    const randomKey = envKeys[Math.floor(Math.random() * 2)];
    const randomEnv = envs[randomKey].clone();
    if (randomKey === 'grass') {
        const treeKey = 'tree' + Math.floor(Math.random() * 3);
        const tree = more[treeKey].clone();
        const randomX = Math.floor(Math.random() * 16 - 8);
        tree.position.set(randomX, 0.4, 0);
        treePositions.push({ x: randomX, z: Math.floor(z) });
        randomEnv.add(tree);
    }
    if (randomKey === 'river') {
        const woodKey = 'wood' + Math.floor(Math.random() * 3);
        const wood = more[woodKey].clone();
        const randomX = Math.floor(Math.random() * 16 - 8);
        wood.position.set(randomX, -0.5, Math.floor(z));
        woods.push(wood);
    }
    randomEnv.position.set(x, y, Math.floor(z));
    randomEnv.scale.set(1, 1, 1);
    blockPosition.push({ nature: randomKey, z: Math.floor(z) });
    return randomEnv;
}


export function getWoods() {
    return woods;
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
