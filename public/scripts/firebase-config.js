

const firebaseConfig = {
  apiKey: "AIzaSyDYq5cjVkUjF3AYA2pQRMi4uZEFcXyY4oc",
  authDomain: "student-mas.firebaseapp.com",
  projectId: "student-mas",
  storageBucket: "student-mas.firebasestorage.app",
  messagingSenderId: "7276415965",
  appId: "1:7276415965:web:39c82e54363771982b8434"
};

if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    
    
    window.auth = firebase.auth();
    window.db = firebase.firestore();
    
    console.log("Firebase initialized successfully.");
} else {
    console.error("Firebase SDK not found. Make sure script tags are in your HTML.");
}