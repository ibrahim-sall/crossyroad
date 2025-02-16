import { loadModel } from './loader.js';



const envs = {};

async function loadEnv(modelPath, texturePath) {
    const model = await loadModel(modelPath, texturePath);
    return model;

}



let grass = 'grass';
let river = 'river';

async function initializeEnvs() {
    envs[grass] = await loadEnv('assets/models/environment/grass/model.obj', 'assets/models/environment/grass/light-grass.png');
    envs[river] = await loadEnv('assets/models/environment/river/0.obj', 'assets/models/environment/river/0.png');
}

initializeEnvs();

export async function getNext(x, y, z) {
    if (Object.keys(envs).length === 0) {
        await initializeEnvs();
    }
    const envKeys = Object.keys(envs);
    const randomKey = envKeys[Math.floor(Math.random() * envKeys.length)];
    const randomEnv = envs[randomKey].clone();
    randomEnv.position.set(x, y, z);
    randomEnv.scale.set(1, 1, 1);
    return randomEnv;
}