<template>
  <div>
    <h1>Sala Mandra</h1>

    <p>Nova rodada</p>

    <p v-if="isMediador">Você é o mediador da rodada!</p>
    <p v-if="!isMediador">
      Mediador da rodada:
      {{ sala.jogadores[sala.mediador]?.apelido || 'MEDIADOR AQUI' }}
    </p>

    <h3>Jogadores na Sala:</h3>
    <!-- TODO: marcar tags de "você!" e "mediador"  -->
    <div>
      <p class="item-jogador" v-for="(jogador, idJogador) in sala.jogadores" :key="idJogador">
        <strong>{{ jogador.apelido }}</strong> ({{ jogador.pontos || 0 }} pontos)
        <span v-if="jogador.pontos_ultima_rodada">
          [{{ jogador.pontos_ultima_rodada }} da última rodada!]
        </span>
      </p>
    </div>

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
import { db } from "../firebaseConfig";

const mudaEtapa = inject("mudaEtapa");
const isMediador = inject("isMediador");
const sala = inject("sala");
const tempoParaDefinicoesEmSegundos = 30;
const quantidadeMinimaJogadores = 2; // TODO: mudar para 3 ou 4

function iniciarRodada() {
  if (!isMediador.value) {
    return;
  }

  if (sala.value.jogadores.length < quantidadeMinimaJogadores) {
    alert("É necessário pelo menos " + quantidadeMinimaJogadores + " jogadores para iniciar a rodada.");
    return;
  }

  // TODO: dar cinco opcoes de palavras para o mediador escolher (sem as definicoes)
  // TODO: gravar todas que foram na sala para nao repetir?
  db.get("palavras")
    .then((snapshot) => {
      const palavras = snapshot.val();
      var keys = Object.keys(palavras);
      const palavra = keys[(keys.length * Math.random()) << 0];
      const definicao = palavras[palavra];
      const fimTempo = Math.round(Date.now() / 1000) + tempoParaDefinicoesEmSegundos;

      const salaUpdates = {};
      for (const [idJogador] of Object.entries(sala.value.jogadores)) {
        salaUpdates["jogadores/" + idJogador + "/definicao"] = null;
        salaUpdates["jogadores/" + idJogador + "/votou_em"] = null;
      }
      salaUpdates["fim_tempo"] = fimTempo;
      salaUpdates["palavra"] = palavra;
      salaUpdates["jogadores/" + sala.value.mediador + "/definicao"] = definicao;
      return db.update("salas/" + sala.value.id, salaUpdates);
    })
    .then(() => {
      mudaEtapa("definicoes");
    });
}
</script>

<style>
.item-jogador {
  padding-left: 20px;
}
</style>
