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
    <div>
      <p>Tempo restante: {{ timeLeft }} segundos</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { ref as databaseRef, set } from "firebase/database";
import db from "../firebaseConfig"; // Importe a instância do Firebase configurada
import router from "../router"; // Importe o router conforme mencionado anteriormente

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
    let timer = null; // Declaração da variável timer

    const isMediator = computed(() => {
      props.mediatorName === props.currentPlayer;
      return false;
    });

    function submitDefinition() {
      // Enviar a definição do jogador para o Firebase
      const definitionRef = databaseRef(db, "rooms/" + 0 + "/definitions/" + 0);
      set(definitionRef, {
        definition: playerDefinition.value,
        votes: 0,
      });
    }

    // Método para iniciar o temporizador
    function startTimer() {
      timer = setInterval(() => {
        timeLeft.value--;
        if (timeLeft.value <= 0) {
          clearInterval(timer);
          // Redireciona para a VotingPage quando o tempo acabar
          redirectToVotingPage();
        }
      }, 1000);
    }

    // Chama o método startTimer quando o componente é criado
    onMounted(startTimer);

    // Redireciona para a VotingPage
    function redirectToVotingPage() {
      // Use router.push para redirecionar para a página de votação
      router.push("/voting");
    }

    // Limpa o temporizador quando o componente é destruído
    watch(timeLeft, (newValue) => {
      if (newValue <= 0) {
        clearInterval(timer);
      }
    });

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
