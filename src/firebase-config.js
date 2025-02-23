import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDKVjltiLKffTVCUYzAxizHFzOSJON5m2M",
    authDomain: "crossyroad-b20ec.firebaseapp.com",
    projectId: "crossyroad-b20ec",
    storageBucket: "crossyroad-b20ec.appspot.com",
    messagingSenderId: "575044172662",
    appId: "1:575044172662:web:a3ed484c2b5f18ef881857",
    measurementId: "G-C6GW960JKH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };