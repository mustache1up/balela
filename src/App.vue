<template>
  <component :is="telaAtual" />
</template>

<script setup>
import { ref, computed, provide } from "vue";
import { ref as dbRef, onValue, getDatabase } from "firebase/database";
import firebaseApp from "./firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import LoginComponent from "./components/LoginComponent.vue";
import RoomPage from "./components/RoomPage.vue";
import GamePage from "./components/GamePage.vue";
import VotingPage from "./components/VotingPage.vue";

const idSala = 0;

const db = getDatabase(firebaseApp);
provide("db", db);

const idJogadorEuProprio = ref("NONE");
provide("idJogadorEuProprio", idJogadorEuProprio);

const isMediador = computed(() => {
  return sala.value.mediador === idJogadorEuProprio.value;
});
provide("isMediador", isMediador);

const sala = ref({ mediador: -1, jogadores: [], palavra: "NENHUMA" });
provide("sala", sala);

onAuthStateChanged(getAuth(), (user) => {
  if (user) {
    idJogadorEuProprio.value = user.uid;
    console.log("USER " + user.uid + " SIGNED");
  } else {
    console.log("USER NOT SIGNED");
  }
});

const salaRef = dbRef(db, "salas/" + idSala);

onValue(salaRef, (snapshot) => {
  sala.value = snapshot.val();
});

const telaAtual = computed(() => {
  switch (sala.value.etapa) {
    case "lobby":
      return RoomPage;
    case "definicoes":
      return GamePage;
    case "votacao":
      return VotingPage;
    default:
      return LoginComponent;
  }
});
</script>
