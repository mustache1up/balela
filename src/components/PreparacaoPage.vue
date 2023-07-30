<template>
  <div>
    <h1>Sala Mandra</h1>

    <h2>Jogadores na Sala:</h2>
    <ul>
      <li v-for="(jogador, idJogador) in sala.jogadores" :key="idJogador">
        {{ jogador.apelido }} ({{ jogador.pontos || 0 }} pontos)
      </li>
    </ul>

    <div v-if="isMediador">
      <button @click="iniciarPartida">Iniciar Partida</button>
    </div>
  </div>
</template>

<script setup>
import { inject } from "vue";
import { ref as dbRef, set } from "firebase/database";

const db = inject("db");
const mudaEtapa = inject("mudaEtapa");
const idSala = inject("idSala");
const isMediador = inject("isMediador");
const sala = inject("sala");
const timeLimit = 30; // Tempo limite em segundos

function iniciarPartida() {
  if (!isMediador.value) {
    return;
  }

  console.log(sala.value.jogadores);
  // TODO mudar para 3 ou 4
  if (sala.value.jogadores.length < 2) {
    alert("É necessário pelo menos dois jogadores para iniciar a partida.");
    return;
  }

  const fimTempo = Math.round(Date.now() / 1000) + timeLimit;

  // sala.value.fimTempo = fimTempo;

  const fimTempoRef = dbRef(db, "salas/" + idSala.value + "/fim_tempo");
  set(fimTempoRef, fimTempo);

  mudaEtapa("definicoes");
}
</script>

<style>
/* Estilos */
</style>
