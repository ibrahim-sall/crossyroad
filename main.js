"use strict";

// Import only what you need, to help your bundler optimize final code size using tree shaking
// see https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking)

import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  Mesh,
  Box3,
  AmbientLight,
  AxesHelper,
  TextureLoader,
  PlaneGeometry,
  ShadowMaterial,
  LoadingManager,
  Color,
  SRGBColorSpace,
  Vector3,
  Clock,
  DefaultLoadingManager,
} from 'three';


import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
// If you prefer to import the whole library, with the THREE prefix, use the following line instead:
// import * as THREE from 'three'

// NOTE: three/addons alias is supported by Rollup: you can use it interchangeably with three/examples/jsm/  

// Importing Ammo can be tricky.
// Vite supports webassembly: https://vitejs.dev/guide/features.html#webassembly
// so in theory this should work:
//
// import ammoinit from 'three/addons/libs/ammo.wasm.js?init';
// ammoinit().then((AmmoLib) => {
//  Ammo = AmmoLib.exports.Ammo()
// })
//
// But the Ammo lib bundled with the THREE js examples does not seem to export modules properly.
// A solution is to treat this library as a standalone file and copy it using 'vite-plugin-static-copy'.
// See vite.config.js
// 
// Consider using alternatives like Oimo or cannon-es
import {
  OrbitControls
} from 'three/addons/controls/OrbitControls.js';

// Example of hard link to official repo for data, if needed
// const MODEL_PATH = 'https://raw.githubusercontent.com/mrdoob/three.js/r173/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb';


// INSERT CODE HERE

const scene = new Scene();
const aspect = window.innerWidth / window.innerHeight;
const camera = new PerspectiveCamera(75, aspect, 0.1, 1000);

const light = new AmbientLight(0xffffff, 2.0); // sxoft white light

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

controls.listenToKeyEvents(window); // optional

function saveCameraPosition() {
  const cameraPosition = {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
    rotation: {
      x: camera.rotation.x,
      y: camera.rotation.y,
      z: camera.rotation.z
    }
  };
  localStorage.setItem('cameraPosition', JSON.stringify(cameraPosition));
}

function loadCameraPosition() {
  const cameraPosition = JSON.parse(localStorage.getItem('cameraPosition'));
  if (cameraPosition) {
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    camera.rotation.set(cameraPosition.rotation.x, cameraPosition.rotation.y, cameraPosition.rotation.z);
  }
}

window.addEventListener('beforeunload', saveCameraPosition);
window.addEventListener('load', loadCameraPosition);



////////////////////////////////////LOAD MODEL////////////////////////////////////

let poulet = null;

async function loadModel(modelPath, texturePath) {
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

async function addModel(modelPath, texturePath) {
  const model = await loadModel(modelPath, texturePath);

  model.position.set(0, 0, 0);
  model.scale.set(1, 1, 1);
  scene.add(model);

  poulet = model;
}

addModel('assets/models/characters/chicken/0.obj', 'assets/models/characters/chicken/0.png');



const clock = new Clock();
scene.add(light);
scene.add(new AxesHelper(5))
scene.background = new Color(0xadd8e6);

////////////////////////////////////BOUCLE DE RENDU////////////////////////////////////
const animation = () => {

  renderer.setAnimationLoop(animation);

  const elapsed = clock.getElapsedTime();

  controls.update();
  renderer.render(scene, camera);

  if (poulet) {
    poulet.position.y = Math.sin(elapsed) * 0.5;
    poulet.rotation.y += 0.01;
  }

  if (elapsed > 30) {
    renderer.setAnimationLoop(null);
    return;
  }
};

animation();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}
