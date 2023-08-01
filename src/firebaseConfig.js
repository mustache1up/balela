import { initializeApp } from "@firebase/app";
import { getAuth, signInAnonymously } from "@firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAuNj8REHIb-xH5-wR6HdMoRYST3Cz-HLs",
  authDomain: "balela-game.firebaseapp.com",
  databaseURL: "https://balela-game-default-rtdb.firebaseio.com",
  projectId: "balela-game",
  storageBucket: "balela-game.appspot.com",
  messagingSenderId: "466039078209",
  appId: "1:466039078209:web:eca2bdab36d68cd9bc75c0",
  measurementId: "G-VNZ716DZ08"
};

const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);

signInAnonymously(auth)
  .then(() => {
    console.log("User logged in anonymously");
  })
  .catch((error) => {
    console.log(error.code);
    console.log(error.message);
  });

export default firebaseApp;
