<template>
  <div>
    <h1>Rodada do Jogo</h1>
    <p>Mediador da rodada: {{ mediatorName }}</p>
    <p>Palavra: {{ word }}</p>
    <p v-if="isMediator">Definição: {{ definition }}</p>

    <div v-if="!isMediator">
      <label for="playerDefinition">Sua definição:</label>
      <input type="text" id="playerDefinition" v-model="playerDefinition" />
      <button @click="submitDefinition">Enviar Definição</button>
    </div>

    <!-- Mostrar a contagem regressiva -->
    <div v-if="!isMediator && timeLeft > 0">
      <p>Tempo restante: {{ timeLeft }} segundos</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from "vue";
import router from "../router"; // Certifique-se de corrigir o caminho para o arquivo router.js, se necessário

export default {
  props: {
    mediatorName: String,
    word: String,
    definition: String,
    currentPlayer: String,
  },
  setup(props) {
    const playerDefinition = ref("");
    const timeLimit = 30; // Tempo limite em segundos
    const timeLeft = ref(timeLimit);

    function submitDefinition() {
      // Lógica para enviar a definição do jogador...
    }

    const isMediator = computed(() => {
      return props.mediatorName === props.currentPlayer;
    });

    // Inicia a contagem regressiva quando o componente for criado
    const timer = setInterval(() => {
      timeLeft.value--;
      if (timeLeft.value <= 0) {
        clearInterval(timer);
        // Redireciona para a VotingPage quando o tempo acabar
        redirectToVotingPage();
      }
    }, 1000);

    // Redireciona para a VotingPage
    function redirectToVotingPage() {
      router.push("/voting");
    }

    // Quando o componente for destruído, limpa o temporizador
    watch(
      () => timeLeft.value,
      (newValue) => {
        if (newValue <= 0) {
          clearInterval(timer);
        }
      }
    );

    return {
      playerDefinition,
      submitDefinition,
      isMediator,
      timeLeft,
    };
  },
};
</script>

<style>
/* Adicione estilos para a página do jogo aqui */
</style>
