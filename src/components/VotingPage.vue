<template>
  <div>
    <h1>Página de Votação</h1>

    <p v-if="isMediador">Você é o mediador da rodada!</p>
    <p v-if="!isMediador">
      Mediador da rodada:
      {{ sala.jogadores[sala.mediador].apelido || "MEDIADOR AQUI" }}
    </p>

    <p>Palavra: {{ sala.palavra || "PALAVRA AQUI" }}</p>

    <div v-for="(jogador, idJogador) in sala.jogadores" :key="idJogador">
      <button v-if="!isMediador" @click="votar(idJogador)">
        Definição {{ idJogador }}: {{ votos[idJogador] || 0 }} votos
        {{ idJogador === meuVoto ? "*votado*" : "" }}
      </button>
      <p v-if="isMediador">
        Definição {{ idJogador }}: {{ jogador.definicao }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from "vue";
import { ref as dbRef, set } from "firebase/database";

const idSala = 0;
const sala = inject("sala");
const idJogadorEuProprio = inject("idJogadorEuProprio");
const db = inject("db");
const isMediador = inject("isMediador");

const meuVoto = computed(() => {
  return sala.value.jogadores[idJogadorEuProprio]?.votou_em || -1;
});

const votos = computed(() => {
  const votosArray = [];

  for (const [idJogador, jogadorDaSala] of Object.entries(
    sala.value.jogadores
  )) {
    idJogador; // TODO linter
    votosArray[jogadorDaSala.votou_em] =
      (votosArray[jogadorDaSala.votou_em] || 0) + 1;
  }

  return votosArray;
});

function votar(idJogadorNoQualVotar) {
  if (!isMediador.value) {
    const votouEmRef = dbRef(
      db,
      "salas/" + idSala + "/jogadores/" + idJogadorEuProprio.value + "/votou_em"
    );
    // set(votouEmRef, increment(1));
    set(votouEmRef, idJogadorNoQualVotar);
  }
}
</script>

<style>
/* Estilos */
</style>
