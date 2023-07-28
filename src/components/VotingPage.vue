<template>
  <div>
    <h1>Página de Votação</h1>
    <p>Mediador da rodada: {{ mediatorName }}</p>
    <p>Palavra: {{ word }}</p>

    <div v-for="(definition, index) in definitions" :key="index">
      <button v-if="!isMediator" @click="vote(index)">{{ index + 1 }}</button>
      <p v-else>
        Definição do jogador {{ definition.player }}:
        {{ definition.definition }}
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { ref as databaseRef, set, onValue } from "firebase/database";
import db from "../firebaseConfig"; // Importe a instância do Firebase configurada

export default {
  props: {
    mediatorName: String,
    word: String,
    // definitions: Array,
    currentPlayer: String,
  },
  setup(props) {
    // Carregar as definições dos jogadores
    const definitionsRef = databaseRef(db, "rooms/" + 0 + "/definitions");
    const definitions = ref([]);

    onValue(definitionsRef, (snapshot) => {
      const data = snapshot.val();
      const playerDefinitions = Object.entries(data).map(([player, value]) => ({
        player,
        definition: value.definition,
        votes: value.votes,
      }));
      definitions.value = playerDefinitions;
    });

    const isMediator = computed(() => {
      props.mediatorName === props.currentPlayer;
      return false;
    });

    // Método para votar em uma definição
    function vote(index) {
      if (!isMediator.value) {
        // Atualizar o número de votos da definição
        const definitionRef = databaseRef(
          db,
          "rooms/" + 0 + "/definitions/" + index + "/votes"
        );
        set(definitionRef, 1);
      }
    }

    return {
      definitions,
      isMediator,
      vote,
    };
  },
};
</script>

<style>
/* Adicione estilos para a página de votação aqui */
</style>
