import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { getFirestore, enableIndexedDbPersistence } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID'
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {
  console.warn('Não foi possível manter a persistência local do Firebase Auth.');
});

const db = getFirestore(app);
enableIndexedDbPersistence(db).catch((error) => {
  if (error?.code === 'failed-precondition') {
    console.warn('Múltiplas abas abertas. Offline persistence só funciona em uma aba por vez.');
  } else if (error?.code === 'unimplemented') {
    console.warn('Offline persistence não é suportada neste navegador.');
  } else {
    console.warn('Erro ao habilitar persistência do Firestore:', error);
  }
});

const storage = getStorage(app);

export { firebaseConfig, app, auth, db, storage };
