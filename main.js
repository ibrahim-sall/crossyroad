"use strict";

// Import only what you need, to help your bundler optimize final code size using tree shaking
// see https://developer.mozilla.org/en-US/docs/Glossary/Tree_shaking)

import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  BoxGeometry,
  Mesh,
  MeshNormalMaterial,
  AmbientLight,
  AxesHelper,
  PlaneGeometry,
  ShadowMaterial,
  Color,
  Vector3,
  Clock
} from 'three';

import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';

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

import {
  GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';

import {
  ColladaLoader
} from 'three/addons/loaders/ColladaLoader.js';
import { min } from 'three/src/nodes/TSL.js';
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



camera.position.z = 5;


////////////////////////////////////LOAD MODEL////////////////////////////////////

let crossyModel = null;



async function daeLoader() {
  const loader = new ColladaLoader();
  loader.load('crossy.dae', (dae) => {
    daeReader(dae);
  });
}


function daeReader(dae) {
  crossyModel = dae.scene;

  if (crossyModel != null) {
    console.log("Model loaded:  " + crossyModel);
    crossyModel.rotation.x = -Math.PI / 2;
    scene.add(crossyModel);
    findPoulet();
    createPhysics();
  } else {
    console.log("Load FAILED.  ");
  }
}

daeLoader();

////////////////////////////////////TROUVER L'ANIMAL////////////////////////////////////

let poulet = [];

function findPoulet() {
  if (crossyModel) {
    crossyModel.traverse((child) => {
      if (child.isMesh && (child.name === "Cube" || child.name === "Cube.001" || child.name === "Cube.002")) {
        poulet.push(child);
      }
    });
  } else {
    console.log("Poulet group not found");
  }
}


////////////////////////////////////GESTION DE LA PHYSIQUE////////////////////////////////////
const world = new CANNON.World();
world.gravity.set(0, 0, -9.81);

let pouletBody = null;

function createPhysics() {
  if (poulet.length > 0) {
    const min = new Vector3(Infinity, Infinity, Infinity);
    const max = new Vector3(-Infinity, -Infinity, -Infinity);

    poulet.forEach(mesh => {
      mesh.geometry.computeBoundingBox();
      const boundingBox = mesh.geometry.boundingBox;
      min.min(boundingBox.min);
      max.max(boundingBox.max);
    });

    const size = new Vector3().subVectors(max, min);
    const center = new Vector3().addVectors(min, max).multiplyScalar(0.5);

    const boxShape = new CANNON.Box(new CANNON.Vec3(size.x * 0.5, size.y * 0.5, size.z * 0.5));
    pouletBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(center.x, center.y, center.z),
      shape: boxShape
    });

    world.addBody(pouletBody);
    createFloor();
  }
}


function jump() {
  if (pouletBody.position.y <= 1.01) {
    pouletBody.velocity.set(0, 0, 10);
  }

}

function updatePhysics() {
  world.fixedStep();
  if (poulet) {
    for (let p of poulet) {
      p.position.copy(pouletBody.position);
      p.quaternion.copy(pouletBody.quaternion);
    }
  }
}
window.addEventListener('keydown', (event) => {
  if (event.key === " ") {
    jump();
  }
});
const cannonDebugger = new CannonDebugger(scene, world, {
  color: 0x00ff00
});
////////////////////////////////////CREATION DU PLANCHER////////////////////////////////////

function createFloor() {
  if (poulet) {
    const minPouletY = Math.min(...poulet.map(p => p.position.z));

    // Three.js (visible) object
    const floor = new Mesh(
      new PlaneGeometry(1000, 1000),
      new ShadowMaterial({
        opacity: .1
      })
    );
    floor.receiveShadow = true;
    floor.position.set(0, minPouletY - 10, 0);
    floor.quaternion.setFromAxisAngle(new Vector3(-1, 0, 0), Math.PI * .5);
    scene.add(floor);

    // Cannon-es (physical) object
    const floorBody = new CANNON.Body({
      type: CANNON.Body.STATIC,
      shape: new CANNON.Plane(),
    });
    floorBody.position.copy(floor.position);
    floorBody.quaternion.copy(floor.quaternion);
    world.addBody(floorBody);
  }
}

const clock = new Clock();
scene.add(light);
scene.add(new AxesHelper(5))
scene.background = new Color(0xadd8e6);

////////////////////////////////////BOUCLE DE RENDU////////////////////////////////////
const animation = () => {

  renderer.setAnimationLoop(animation); // requestAnimationFrame() replacement, compatible with XR 

  const elapsed = clock.getElapsedTime();

  controls.update();
  if (poulet) {
    updatePhysics();
  }
  cannonDebugger.update()
  renderer.render(scene, camera);
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
