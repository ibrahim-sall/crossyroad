import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { TextureLoader } from "three/src/loaders/TextureLoader";
import { SRGBColorSpace } from "three";

export async function loadModel(modelPath, texturePath) {
    const loader = new OBJLoader();
    const model = await loader.loadAsync(modelPath);

    const textureLoader = new TextureLoader();
    const texture = await textureLoader.loadAsync(texturePath);
    texture.colorSpace = SRGBColorSpace;

    model.traverse((child) => {
        if (child.isMesh) {
            child.material.map = texture;
        }
    });

    return model;
}

