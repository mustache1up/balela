<template>
  <component :is="telaAtual" />
</template>

<script setup>
import { ref, computed, provide, reactive } from "vue";
import { ref as dbRef, onValue, set, getDatabase } from "@firebase/database";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import firebaseApp from "./firebaseConfig";

import ConexaoPage from "./components/ConexaoPage.vue";
import LobbyPage from "./components/LobbyPage.vue";
import PreparacaoPage from "./components/PreparacaoPage.vue";
import DefinicoesPage from "./components/DefinicoesPage.vue";
import VotacaoPage from "./components/VotacaoPage.vue";

const idSala = ref(0); // TODO: habilitar N salas
provide("idSala", idSala); // TODO: usar dbRefs.sala ao invés e remover

const db = getDatabase(firebaseApp);
const dbRefs = reactive({
  paravras: dbRef(db, "palavras"),
  sala: dbRef(db, "salas/" + idSala.value),
  etapa: dbRef(db, "salas/" + idSala.value + "/etapa"),
  mediador: dbRef(db, "salas/" + idSala.value + "/mediador"),
  eu: {
    apelido: dbRef(
      db, "salas/" + idSala.value + "/jogadores/" + idJogadorEuProprio.value + "/apelido"
    ),
    definicao: dbRef(
      db, "salas/" + idSala.value + "/jogadores/" + idJogadorEuProprio.value + "/definicao"
    ),
    votouEm: dbRef(
      db, "salas/" + idSala.value + "/jogadores/" + idJogadorEuProprio.value + "/votou_em"
    )
  }
});
provide("dbRefs", dbRefs);

const idJogadorEuProprio = ref("NONE");
provide("idJogadorEuProprio", idJogadorEuProprio);

const isMediador = computed(() => {
  return sala.value.mediador === idJogadorEuProprio.value;
});
provide("isMediador", isMediador);

const sala = ref({ jogadores: [], mediador: "", palavra: "" });
provide("sala", sala);

onValue(dbRefs.sala, (snapshot) => {
  sala.value = snapshot.val();
});

function mudaEtapa(etapa) {
  if (isMediador.value) {
    set(dbRefs.etapa, etapa);
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
      return ConexaoPage;
  }
});
</script>

<style>
/* Estilos */
</style>
