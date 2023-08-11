<template>
  <div>
    <h1>Valendo!</h1>

    <p>Palavra: {{ sala.palavra || 'PALAVRA AQUI' }}</p>

    <p v-if="isMediador">Você é o mediador da rodada!</p>
    <p v-if="!isMediador">
      Mediador da rodada:
      {{ sala.jogadores[sala.mediador].apelido || 'MEDIADOR AQUI' }}
    </p>

    <p v-if="isMediador">Os jogadores estão escrevendo suas definições!</p>
    <div v-if="!isMediador">
      <label for="definicaoDoJogador">Escreva sua definição:</label>
      <input type="text" id="definicaoDoJogador" v-model="definicaoDoJogador" />
      <button @click="enviarDefinicao">Enviar definição</button>
    </div>

    <div>
      <p>Tempo restante: {{ tempoRestante }} segundos</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import { db } from "../firebaseConfig";

const sala = inject("sala");
const idJogadorEuProprio = inject("idJogadorEuProprio");
const isMediador = inject("isMediador");
const mudaEtapa = inject("mudaEtapa");

const definicaoDoJogador = ref("");
const tempoRestante = ref(0);

function enviarDefinicao() {
  db.set("salas/" + sala.value.id + "/jogadores/" + idJogadorEuProprio.value + "/definicao", definicaoDoJogador.value);
}

function calculaTempoRestante() {
  if (sala.value.fim_tempo === undefined) {
    return 0;
  }
  return sala.value.fim_tempo - Math.round(Date.now() / 1000);
}

async function iniciaContagem() {
  while (tempoRestante.value >= 0) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    tempoRestante.value = calculaTempoRestante();
  }
  tempoRestante.value = 0;
  mudaEtapa("votacao");
}

onMounted(iniciaContagem);
</script>

<style>
/* Estilos */
</style>
