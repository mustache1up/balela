<template>
  <component :is="telaAtual" />
</template>

<script setup>
import { ref, computed, provide } from "vue";
import { ref as dbRef, onValue, set, getDatabase } from "firebase/database";
import firebaseApp from "./firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import LobbyPage from "./components/LobbyPage.vue";
import PreparacaoPage from "./components/PreparacaoPage.vue";
import DefinicoesPage from "./components/DefinicoesPage.vue";
import VotacaoPage from "./components/VotacaoPage.vue";

const db = getDatabase(firebaseApp);
provide("db", db);

const idSala = ref(0);
provide("idSala", idSala);

const idJogadorEuProprio = ref("NONE");
provide("idJogadorEuProprio", idJogadorEuProprio);

const isMediador = computed(() => {
  return sala.value.mediador === idJogadorEuProprio.value;
});
provide("isMediador", isMediador);

const sala = ref({ jogadores: [], mediador: "", palavra: "" });
provide("sala", sala);

const salaRef = dbRef(db, "salas/" + idSala.value);
onValue(salaRef, (snapshot) => {
  sala.value = snapshot.val();
});

function mudaEtapa(etapa) {
  if (isMediador.value) {
    const etapaRef = dbRef(db, "salas/" + idSala.value + "/etapa");
    set(etapaRef, etapa);
  }
}
provide("mudaEtapa", mudaEtapa);

onAuthStateChanged(getAuth(), (user) => {
  if (user) {
    idJogadorEuProprio.value = user.uid;
    console.log("USER " + user.uid + " SIGNED");
  } else {
    console.log("USER NOT SIGNED");
  }
});

const telaAtual = computed(() => {
  switch (sala.value.etapa) {
    case "lobby":
      return LobbyPage;
    case "preparacao":
      return PreparacaoPage;
    case "definicoes":
      return DefinicoesPage;
    case "votacao":
      return VotacaoPage;
    default:
      return LobbyPage;
  }
});
</script>
