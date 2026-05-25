const firebaseConfig = {
  apiKey: "AIzaSyAyiMq9WLipBPvX3pvqg_6X5l0iU-Xfnqc",
  authDomain: "stop-game-paula-camilo.firebaseapp.com",
  databaseURL: "https://stop-game-paula-camilo-default-rtdb.firebaseio.com",
  projectId: "stop-game-paula-camilo",
  storageBucket: "stop-game-paula-camilo.firebasestorage.app",
  messagingSenderId: "102567110915",
  appId: "1:102567110915:web:c5ceee423d4b336041fa45"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();