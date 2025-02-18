import { AudioListener, Audio, AudioLoader } from "three";

const listener = new AudioListener();

export function initAudio(camera) {
    camera.add(listener);
    window.addEventListener('click', () => {
        window.addEventListener('keydown', startAudioContext);
    }, { once: true });
}

function startAudioContext() {
    if (listener.context.state === 'suspended') {
        listener.context.resume().then(() => {
        });
    }
    window.removeEventListener('keydown', startAudioContext);
}


const sound = new Audio(listener);
const audioLoader = new AudioLoader();
let i = 0

export function playSound() {
    if (sound.isPlaying) {
        sound.stop();
    }
    i++;
    audioLoader.load('assets/audio/buck' + i + '.wav', function (buffer) {
        sound.setBuffer(buffer);
        sound.setVolume(0.5);
        sound.play();
    });
    if (i == 12) i = 0;
}

export function playSoundRiver() {
    if (sound.isPlaying) {
        sound.stop();
    }
    audioLoader.load('assets/audio/watersplashlow.mp3', function (buffer) {
        sound.setBuffer(buffer);
        sound.setVolume(0.7);
        sound.play();
    });
}
const soundCar = ['carhit.mp3', 'carsquish3.wav']

export function playSoundCar() {
    if (sound.isPlaying) {
        sound.stop();
    }
    const randomIndex = Math.floor(Math.random() * soundCar.length);
    const randomSound = soundCar[randomIndex];
    audioLoader.load('assets/audio/' + randomSound, function (buffer) {
        sound.setBuffer(buffer);
        sound.setVolume(0.7);
        sound.play();
    });
}


export function playHorn() {
    if (sound.isPlaying) {
        sound.stop();
    }
    audioLoader.load('assets/audio/car-horn.wav', function (buffer) {
        sound.setBuffer(buffer);
        sound.setVolume(0.7);
        sound.play();
    });
}

export function playHomer() {
    if (sound.isPlaying) {
        sound.stop();
    }
    audioLoader.load('assets/audio/homer.mp3', function (buffer) {
        sound.setBuffer(buffer);
        sound.setVolume(0.7);
        sound.play();
    });
}