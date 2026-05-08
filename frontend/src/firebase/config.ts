import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'; 

const firebaseConfig = {
  apiKey: "AIzaSyDvcxcv8N9T1ST4QENIrKTBioOkDqn2n_s",
  authDomain: "educash-web.firebaseapp.com",
  databaseURL: "https://educash-web-default-rtdb.firebaseio.com",
  projectId: "educash-web",
  storageBucket: "educash-web.firebasestorage.app",
  messagingSenderId: "80602608205",
  appId: "1:80602608205:web:3a61f7679101c7a4f2e204"
};

const app = initializeApp(firebaseConfig);

// exportamos ambos para que el hook los encuentre
export const auth = getAuth(app);
export const db = getFirestore(app);

// esto es para que el emuilador de firebase se pueda todo local, lo saque de la docuemntacion de firebase
if (window.location.hostname === 'localhost') {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}