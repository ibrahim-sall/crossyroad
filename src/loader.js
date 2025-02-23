import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { LoadingManager, SRGBColorSpace } from "three";

export async function loadModel(modelPath, texturePath) {
    const manager = new LoadingManager();
    const loader = new OBJLoader(manager);
    const textureLoader = new TextureLoader(manager);

    const modelPromise = loader.loadAsync(modelPath);
    const texturePromise = textureLoader.loadAsync(texturePath);

    const [model, texture] = await Promise.all([modelPromise, texturePromise]);
    texture.colorSpace = SRGBColorSpace;

    model.traverse((child) => {
        if (child.isMesh) {
            child.material.map = texture;
        }
    });

    return model;
}

