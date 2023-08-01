<template>
  <component :is="telaAtual" />
</template>

<script setup>
import _ from "lodash";
import { ref, computed, provide } from "vue";
import { onValue, set } from "@firebase/database";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { dbRef } from "./firebaseConfig";

import ConexaoPage from "./components/ConexaoPage.vue";
import LobbyPage from "./components/LobbyPage.vue";
import PreparacaoPage from "./components/PreparacaoPage.vue";
import DefinicoesPage from "./components/DefinicoesPage.vue";
import VotacaoPage from "./components/VotacaoPage.vue";

const idSala = 0; // TODO: habilitar N salas
provide("idSala", idSala); // TODO: usar dbRefs.value.sala ao invés e remover

const idJogadorEuProprio = ref("NONE");
provide("idJogadorEuProprio", idJogadorEuProprio);

const isMediador = computed(() => {
  return sala.value.mediador === idJogadorEuProprio.value;
});
provide("isMediador", isMediador);

const sala = ref({ jogadores: [], mediador: "", palavra: "" });
provide("sala", sala);

onValue(dbRef("salas/" + idSala), (snapshot) => {
  sala.value = { ...snapshot.val(), id: idSala };
});

function mudaEtapa(etapa) {
  if (isMediador.value) {
    set(dbRef("salas/" + idSala + "/etapa"), etapa);
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
  const contem = Object.keys(sala.value.jogadores).includes(idJogadorEuProprio.value);
  if (!contem) {
    return LobbyPage;
  }

  switch (sala.value.etapa) {
    case "lobby":
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
