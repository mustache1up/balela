<!-- VotingPage.vue -->
<template>
  <div>
    <h1>Votação</h1>
    <p>Mediador da rodada: {{ mediatorName }}</p>
    <p>Palavra: {{ word }}</p>

    <!-- Se for o mediador, mostrar cada uma das playerDefinitions -->
    <div v-if="isMediator">
      <p>Definições dos Jogadores:</p>
      <ul>
        <li v-for="(definition, index) in playerDefinitions" :key="index">
          Definição {{ index + 1 }}: {{ definition }}
        </li>
      </ul>
    </div>

    <!-- Botões para votar (aparecem somente quando não é o mediador) -->
    <div v-if="!isMediator">
      <p>Escolha a definição correta:</p>
      <button
        v-for="(definition, index) in playerDefinitions"
        :key="index"
        @click="vote(index)"
      >
        Votar na definição {{ index + 1 }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    mediatorName: String,
    word: String,
    definition: String,
    currentPlayer: String,
    playerDefinitions: Array, // Array contendo as definições dos jogadores
  },
  computed: {
    isMediator() {
      return this.mediatorName === this.currentPlayer;
    },
  },
  methods: {
    vote(/*index*/) {
      // Implementar a lógica para enviar o voto para o servidor ou atualizar o estado do jogo
      // Por exemplo, você pode emitir um evento para notificar o componente pai sobre o voto do jogador
      // this.$emit('vote', index);
    },
  },
};
</script>

<style>
/* Adicione estilos para a página de votação aqui */
</style>
