<!-- GamePage.vue -->
<template>
  <div>
    <h1>Rodada do Jogo</h1>
    <p>Mediador da rodada: {{ mediatorName }}</p>
    <p>Palavra: {{ word }}</p>

    <!-- Se for o mediador, mostrar a definição -->
    <p v-if="isMediator">Definição: {{ definition }}</p>

    <!-- Campo de texto para jogadores escreverem suas definições (aparece somente quando não é o mediador) -->
    <div v-if="!isMediator">
      <label for="playerDefinition">Sua definição:</label>
      <input type="text" id="playerDefinition" v-model="playerDefinition" />
      <button @click="submitDefinition">Enviar Definição</button>
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
  },
  data() {
    return {
      playerDefinition: "", // Campo de texto para a definição do jogador
    };
  },
  computed: {
    isMediator() {
      return this.mediatorName === this.currentPlayer;
    },
  },
  methods: {
    submitDefinition() {
      // Implementar a lógica para enviar a definição do jogador para o servidor ou atualizar o estado do jogo
      // Por exemplo, você pode emitir um evento para notificar o componente pai sobre a definição do jogador
      // this.$emit('submit-definition', this.playerDefinition);
    },
  },
};
</script>

<style>
/* Adicione estilos para a página do jogo aqui */
</style>
