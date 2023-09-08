<template>
  <div class="container" >
    <article>
      <component :is="telaAtual" :estado="estado" />
    </article>
  </div>
</template>

<script setup>
import _ from "lodash";
import { ref, computed, reactive, provide } from "vue";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { db } from "./firebaseConfig";

import BlocoConexao from "./components/BlocoConexao.vue";
import BlocoAntessala from "./components/BlocoAntessala.vue";
import BlocoPreparacao from "./components/BlocoPreparacao.vue";
import BlocoDefinicoes from "./components/BlocoDefinicoes.vue";
import BlocoVotacao from "./components/BlocoVotacao.vue";

const estado = reactive({
  idSala: 0, // TODO: habilitar N salas
  meuIdJogador: "DESLOGADO",
  souMediador: false,
  sala: {}
});
provide("estado", estado);

const sala = ref();

db.onValue(`salas/${estado.idSala}`, (snapshot) => {
  estado.sala = { ...snapshot.val(), id: estado.idSala };
  estado.souMediador = estado.sala.mediador === estado.meuIdJogador;
});

onAuthStateChanged(getAuth(), (user) => {
  if (user) {
    estado.meuIdJogador = user.uid;
    console.log(`Usuário logado com ID ${user.uid}`);
  } else {
    console.log("Usuário deslogado");
  }
});

const telaAtual = computed(() => {

  return BlocoDefinicoes; // TODO: mudar aqui para testar as telas

  // if (!estado.sala.etapa) {
  //   return BlocoConexao;
  // }

  // const jogadorEstaNaSala = Object.keys(estado.sala.jogadores).includes(estado.meuIdJogador);
  // if (!jogadorEstaNaSala) {
  //   return BlocoAntessala;
  // }

  // switch (estado.sala.etapa) {
  //   case "preparacao":
  //     return BlocoPreparacao;
  //   case "definicoes":
  //     return BlocoDefinicoes;
  //   case "votacao":
  //     return BlocoVotacao;
  //   default:
  //     return BlocoConexao;
  // }
});
</script>

<style>
/* Estilos */
</style>
