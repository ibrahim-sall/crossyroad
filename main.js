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

import { movePoulet } from './move.js';
import { loadModel } from './loader.js';
import { getNext, getWoods } from './environement.js';
import { initializeScore, updateScore } from './score.js';
import { initAudio, playSound } from './sound.js';
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
import { add } from 'three/tsl';

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

////////////////////////////////////CAMERA////////////////////////////////////
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

function resetCameraPosition() {
  camera.position.set(-2.3, 4.1, -3.8);
  camera.rotation.set(-2.3, -0.4, -2.7);
  saveCameraPosition();
}

window.addEventListener('beforeunload', saveCameraPosition);
window.addEventListener('load', loadCameraPosition);

const resetButton = document.createElement('button');
resetButton.innerText = 'Reset Camera';
resetButton.style.position = 'absolute';
resetButton.style.top = '10px';
resetButton.style.right = '10px';
resetButton.addEventListener('click', resetCameraPosition);
document.body.appendChild(resetButton);

////////////////////////////////////START POPUP////////////////////////////////////
const startPopup = document.createElement('div');
startPopup.style.position = 'fixed';
startPopup.style.top = '0';
startPopup.style.left = '0';
startPopup.style.width = '100%';
startPopup.style.height = '100%';
startPopup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
startPopup.style.display = 'flex';
startPopup.style.justifyContent = 'center';
startPopup.style.alignItems = 'center';
startPopup.style.zIndex = '1000';

const startButton = document.createElement('button');
startButton.innerText = 'Start';
startButton.style.padding = '20px';
startButton.style.fontSize = '20px';
startButton.style.cursor = 'pointer';

startPopup.appendChild(startButton);
document.body.appendChild(startPopup);

startButton.addEventListener('click', () => {
  startPopup.style.display = 'none';
  initAudio(camera); // Démarrer l'audio après l'interaction utilisateur
  animation(); // Démarrer l'animation après l'interaction utilisateur
});

////////////////////////////////////LOAD MODEL////////////////////////////////////

let poulet = null;
let pouletBox = null;

export async function addModel(modelPath, texturePath) {
  const model = await loadModel(modelPath, texturePath);

  model.position.set(0, 0, 0);
  model.scale.set(1, 1, 1);
  scene.add(model);

  poulet = model;
  pouletBox = new Box3().setFromObject(poulet);
}



poulet = addModel('assets/models/characters/chicken/0.obj', 'assets/models/characters/chicken/0.png');



const clock = new Clock();
scene.add(light);
scene.add(new AxesHelper(5))
scene.background = new Color(0xadd8e6);

////////////////////////////////////ENVIRONEMENT////////////////////////////////////
async function addEnvironmentBlock(i) {
  const block = await getNext(0, -0.4, i);
  if (block != null) {
    scene.add(block);
  }
}

//initialize
function initEnvironmentBlocks() {
  for (let i = 0; i < 20; i++) {
    addEnvironmentBlock(i);
  }
}
initEnvironmentBlocks();

////////////////////////////////////AUDIO////////////////////////////////////
initAudio(camera);

////////////////////////////////////SCORE////////////////////////////////////
initializeScore();
let currentScore = 0;

////////////////////////////////////BOUCLE DE RENDU////////////////////////////////////
const animation = () => {


  renderer.setAnimationLoop(animation);

  currentScore = updateScore(poulet);

  const elapsed = clock.getElapsedTime();
  updateEnvironment();
  //moveCamera(poulet, camera);

  controls.update();
  renderer.render(scene, camera);


  if (elapsed > 30) {
    renderer.setAnimationLoop(null);
    return;
  }
};

poulet.then(() => {
  animation();
});

////////////////////////////////////EVENT LISTENER////////////////////////////////////

window.addEventListener('resize', onWindowResize, false);

window.addEventListener('keydown', (event) => {
  playSound();
  if (poulet) {
    switch (event.key) {
      case 'ArrowUp':
        addEnvironmentBlock(currentScore + 20);
        movePoulet(poulet, 'up');
        break;
      case 'ArrowDown':
        movePoulet(poulet, 'down');
        break;
      case 'ArrowLeft':
        movePoulet(poulet, 'left');
        break;
      case 'ArrowRight':
        movePoulet(poulet, 'right');
        break;
      case ' ':
        movePoulet(poulet, 'jump');
        break;
    }
  }
});

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

////////////////////////////////////UPDATE ENVIRONNEMENT////////////////////////////////////
let woods = getWoods();

function moveWoodLogs() {
  woods = getWoods();
  woods.forEach(wood => {
    wood.position.x += 0.05;
    if (wood.position.x > 10) {
      wood.position.x = -10;
    }
    if (!scene.children.includes(wood)) {
      scene.add(wood);
    }
  });
}

function updateEnvironment() {
  moveWoodLogs();
}