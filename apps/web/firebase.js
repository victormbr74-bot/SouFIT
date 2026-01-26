import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js';
import { getAuth, setPersistence, browserLocalPersistence } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js';
import { getFirestore, enableIndexedDbPersistence } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js';

const firebaseConfig = {
  apiKey: 'AIzaSyD2t6RjJS5ZcvByn81bf8Qtu6_fvnJteD4',
  authDomain: 'fit20-a3a32.firebaseapp.com',
  projectId: 'fit20-a3a32',
  storageBucket: 'fit20-a3a32.appspot.com',
  messagingSenderId: '834013704933',
  appId: '1:834013704933:web:94c5bdd834dfba12951a0c'
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
