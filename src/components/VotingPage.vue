<template>
  <div>
    <h1>Página de Votação</h1>

    <p v-if="isMediador">Você é o mediador da rodada!</p>
    <p v-if="!isMediador">
      Mediador da rodada: {{ sala.mediador || "MEDIADOR AQUI" }}
    </p>

    <p>Palavra: {{ sala.palavra || "PALAVRA AQUI" }}</p>

    <div v-for="(jogador, idJogador) in sala.jogadores" :key="idJogador">
      <button v-if="!isMediador" @click="votar(idJogador)">
        Definição {{ idJogador }}: {{ votos[idJogador] || 0 }} votos
        {{
          idJogador === sala.jogadores[idJogadorEuProprio].votou_em
            ? "*votado*"
            : ""
        }}
      </button>
      <p v-if="isMediador">
        Definição {{ idJogador }}: {{ jogador.definicao }}
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { ref as dbRef, set, onValue, getDatabase } from "firebase/database";
import firebaseApp from "../firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const db = getDatabase(firebaseApp);

export default {
  props: {},
  setup() {
    const idSala = 0;
    const idJogadorEuProprio = ref("NONE");
    const sala = ref({ mediador: -1, jogadores: [], palavra: "NENHUMA" });

    onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        idJogadorEuProprio.value = user.uid;
        console.log("USER " + user.uid + " SIGNED");
      } else {
        console.log("USER NOT SIGNED");
      }
    });

    const salaRef = dbRef(db, "salas/" + idSala);
    onValue(salaRef, (snapshot) => {
      const temp = snapshot.val();
      sala.value = temp;
    });

    const isMediador = computed(() => {
      return sala.value.mediador === idJogadorEuProprio.value;
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
          "salas/" +
            idSala +
            "/jogadores/" +
            idJogadorEuProprio.value +
            "/votou_em"
        );
        // set(votouEmRef, increment(1));
        set(votouEmRef, idJogadorNoQualVotar);
      }
    }

    return {
      idJogadorEuProprio,
      sala,
      isMediador,
      votos,
      votar,
    };
  },
};
</script>

<style>
/* Adicione estilos para a página de votação aqui */
</style>
