// firebase.js - Configuration Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Configuration Firebase en utilisant les variables d'environnement
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Vérifier que les variables d'environnement sont définies
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement Firebase manquantes:', missingVars);
  console.warn('🔧 Veuillez remplir ces variables dans votre fichier .env:');
  missingVars.forEach(varName => {
    console.warn(`${varName}=votre_valeur_ici`);
  });
}

// Initialiser Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialisé avec succès');
} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation de Firebase:', error);
  console.warn('💡 Vérifiez vos variables d\'environnement Firebase dans le fichier .env');
}

// Initialiser l'authentification Firebase
export const auth = getAuth(app);

// Initialiser Firestore (optionnel, pour une future utilisation)
export const db = getFirestore(app);

// Configuration pour le développement local (optionnel)
// Décommentez ces lignes si vous utilisez l'émulateur Firebase en local
/*
if (process.env.NODE_ENV === 'development') {
  try {
    // Connecter à l'émulateur d'authentification
    connectAuthEmulator(auth, 'http://localhost:9099');
    
    // Connecter à l'émulateur Firestore
    connectFirestoreEmulator(db, 'localhost', 8080);
    
    console.log('🔧 Connecté aux émulateurs Firebase en mode développement');
  } catch (error) {
    console.warn('⚠️ Impossible de se connecter aux émulateurs Firebase:', error.message);
  }
}
*/

// Export par défaut de l'app Firebase
export default app;

// Fonction utilitaire pour vérifier si Firebase est correctement configuré
export const isFirebaseConfigured = () => {
  return missingVars.length === 0 && app;
};

// Fonction pour obtenir les informations de configuration (sans exposer les clés)
export const getFirebaseInfo = () => {
  return {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    configured: isFirebaseConfigured()
  };
};