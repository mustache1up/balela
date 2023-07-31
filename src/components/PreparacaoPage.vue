<template>
  <div>
    <h1>Sala Mandra</h1>

    <p>Nova rodada</p>

    <p v-if="isMediador">Você é o mediador da rodada!</p>
    <p v-if="!isMediador">
      Mediador da rodada:
      {{ sala.jogadores[sala.mediador]?.apelido || "MEDIADOR AQUI" }}
    </p>

    <h3>Jogadores na Sala:</h3>
    <ul>
      <li v-for="(jogador, idJogador) in sala.jogadores" :key="idJogador">
        {{ jogador.apelido }} ({{ jogador.pontos || 0 }} pontos)
        <span v-if="jogador.pontos_ultima_rodada">
          [{{ jogador.pontos_ultima_rodada }} da última rodada!]
        </span>
      </li>
    </ul>

    <div v-if="isMediador">
      <button @click="iniciarRodada">Iniciar Rodada</button>
    </div>
    <div v-if="!isMediador">
      <p>A rodada já vai começar!</p>
    </div>
  </div>
</template>

<script setup>
import { inject } from "vue";
import { ref as dbRef, update, get } from "firebase/database";

const db = inject("db");
const mudaEtapa = inject("mudaEtapa");
const idSala = inject("idSala");
const isMediador = inject("isMediador");
const sala = inject("sala");
const timeLimit = 30; // Tempo limite em segundos

function iniciarRodada() {
  if (!isMediador.value) {
    return;
  }

  // TODO mudar para 3 ou 4
  if (sala.value.jogadores.length < 2) {
    alert("É necessário pelo menos dois jogadores para iniciar a rodada.");
    return;
  }

  // TODO (gravar todas que foram na sala para nao repetir?)
  // TODO definir palavra aleatoria
  const palavrasRef = dbRef(db, "palavras");
  get(palavrasRef)
    .then((snapshot) => {
      const palavras = snapshot.val();
      var keys = Object.keys(palavras);
      const palavra = keys[(keys.length * Math.random()) << 0];
      const definicao = palavras[palavra];

      const fimTempo = Math.round(Date.now() / 1000) + timeLimit;

      const salaUpdates = {};
      for (const [idJogador] of Object.entries(sala.value.jogadores)) {
        salaUpdates["jogadores/" + idJogador + "/definicao"] = null;
        salaUpdates["jogadores/" + idJogador + "/votou_em"] = null;
      }
      salaUpdates["fim_tempo"] = fimTempo;
      salaUpdates["palavra"] = palavra;
      salaUpdates["jogadores/" + sala.value.mediador + "/definicao"] =
        definicao;
      console.log(palavra);
      const salaRef = dbRef(db, "salas/" + idSala.value);
      return update(salaRef, salaUpdates);
    })
    .then(() => {
      mudaEtapa("definicoes");
    });
}
</script>

<style>
/* Estilos */
</style>
