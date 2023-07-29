<template>
  <div>
    <h1>Rodada do Jogo</h1>
    <p>Mediador da rodada: {{ mediatorName }}</p>
    <p>Palavra: {{ word }}</p>
    <p v-if="isMediador">Definição: {{ definicao }}</p>

    <div v-if="!isMediador">
      <label for="definicaoDoJogador">Escreva sua definição:</label>
      <input type="text" id="definicaoDoJogador" v-model="definicaoDoJogador" />
      <button @click="submitDefinicao">Enviar definição</button>
    </div>

    <div>
      <p>Tempo restante: {{ timeLeft }} segundos</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { ref as dbRef, set, getDatabase } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseApp from "../firebaseConfig";
import router from "../router";
const db = getDatabase(firebaseApp);

export default {
  props: {
    mediatorName: String,
    word: String,
    definicao: String,
    currentPlayer: String,
  },
  setup(props) {
    const idJogadorEuProprio = ref("NONE"); // getAuth().currentUser.uid;

    onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        idJogadorEuProprio.value = user.uid;
        console.log("USER " + user.uid + " SIGNED");
      } else {
        console.log("USER NOT SIGNED");
      }
    });

    const definicaoDoJogador = ref("");
    const timeLimit = 30; // Tempo limite em segundos
    const timeLeft = ref(timeLimit);
    let timer = null;

    const isMediador = computed(() => {
      props.mediatorName === props.currentPlayer;
      return false;
    });

    function submitDefinicao() {
      // Enviar a definição do jogador para o Firebase
      const definicaoRef = dbRef(
        db,
        "salas/" + 0 + "/jogadores/" + idJogadorEuProprio.value + "/definicao"
      );
      set(definicaoRef, definicaoDoJogador.value);
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
      definicaoDoJogador,
      submitDefinicao,
      isMediador,
      timeLeft,
      idJogadorEuProprio,
    };
  },
};
</script>

<style>
/* Adicione estilos para a página do jogo aqui */
</style>
