<template>
  <div class="logo">
    <img src="balela-sem-fundo.png"/>
  </div>
  <div class="container" >
    <article>
      <component :is="telaAtual" />
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

const telas = {
  conexao: BlocoConexao,
  antessala: BlocoAntessala,
  preparacao: BlocoPreparacao,
  definicoes: BlocoDefinicoes,
  votacao: BlocoVotacao,
};

const estado = reactive({
  idSala: 0, // TODO: habilitar N salas
  meuIdJogador: "DESLOGADO",
  souMediador: false,
  sala: {}
});
provide("estado", estado);

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
  
  if (!estado.sala.etapa) {
    console.log("Dados de sala ainda não disponíveis, aguardando na tela 'conexao'");
    return BlocoConexao;
  }

  const caminhoDaURL = new URL(window.location).pathname.replace("/", "");
  if (caminhoDaURL && _(telas).has(caminhoDaURL)) {
    console.log(`Forçando tela definida na URL: '${caminhoDaURL}'`);
    return telas[caminhoDaURL];
  }

  const jogadorEstaNaSala = _(estado.sala.jogadores).has(estado.meuIdJogador);
  if (!jogadorEstaNaSala) {
    return BlocoAntessala;
  }

  switch (estado.sala.etapa) {
    case "preparacao":
      return BlocoPreparacao;
    case "definicoes":
      return BlocoDefinicoes;
    case "votacao":
      return BlocoVotacao;
    default:
      return BlocoConexao;
  }
});
</script>

<style>
@media screen and (prefers-color-scheme: dark) {
	.logo {  
    filter: invert(100%); 
  }
}
</style>
