<template>
  <div>
    <h1>Rodada do Jogo</h1>
    <p>Mediador da rodada: {{ mediatorName }}</p>
    <p>Palavra: {{ word }}</p>
    <p v-if="isMediador">Definição: {{ definicao }}</p>

    <div v-if="!isMediador">
      <label for="definicaoDoJogador">Escreva sua definição:</label>
      <input type="text" id="definicaoDoJogador" v-model="definicaoDoJogador" />
      <button @click="enviarDefinicao">Enviar definição</button>
    </div>

    <div>
      <p>Tempo restante: {{ timeLeft }} segundos</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, inject } from "vue";
import { ref as dbRef, set } from "firebase/database";

const idSala = 0;

const idJogadorEuProprio = inject("idJogadorEuProprio");
const db = inject("db");

const definicaoDoJogador = ref("");
const timeLimit = 30; // Tempo limite em segundos
const timeLeft = ref(timeLimit);
let timer = null;

function enviarDefinicao() {
  const definicaoRef = dbRef(
    db,
    "salas/" + idSala + "/jogadores/" + idJogadorEuProprio.value + "/definicao"
  );
  set(definicaoRef, definicaoDoJogador.value);
}

function startTimer() {
  timer = setInterval(() => {
    timeLeft.value--;
    if (timeLeft.value <= 0) {
      clearInterval(timer);
      redirectToVotingPage();
    }
  }, 1000);
}

onMounted(startTimer);

function redirectToVotingPage() {
  const etapaRef = dbRef(db, "salas/" + idSala + "/etapa");
  set(etapaRef, "votacao");
}

// Limpa o temporizador quando o componente é destruído
watch(timeLeft, (newValue) => {
  if (newValue <= 0) {
    clearInterval(timer);
  }
});
</script>

<style>
/* Adicione estilos para a página do jogo aqui */
</style>
