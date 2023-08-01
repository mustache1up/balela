<template>
  <div>
    <h1>Votação</h1>

    <p>Palavra: {{ sala.palavra || 'PALAVRA AQUI' }}</p>

    <p v-if="isMediador">Você é o mediador da rodada!</p>
    <p v-if="!isMediador">
      Mediador da rodada:
      {{ sala.jogadores[sala.mediador]?.apelido || 'MEDIADOR AQUI' }}
    </p>

    <div v-for="def in definicoesPreparada" :key="def.letra">
      <p v-if="isMediador">Definição {{ def.letra }}: {{ def.texto }}</p>
      <button v-if="!isMediador" @click="votar(def.idJogador)">
        Definição {{ def.letra }}: {{ votos[def.idJogador] || 0 }} votos
        {{ def.idJogador === meuVoto ? '*votado*' : '' }}
      </button>
    </div>

    <div v-if="isMediador">
      <p>Faltam {{ qtdFaltaVotar }} votos!</p>
      <button v-if="qtdFaltaVotar <= 0" @click="encerrarVotacao">Encerrar votação</button>
    </div>
  </div>
</template>

<script setup>
import _ from "lodash";
import { computed, inject } from "vue";
import { set, increment, update } from "@firebase/database";
import { dbRef } from "../firebaseConfig";
import sha1 from "crypto-js/sha1";


const sala = inject("sala");
const idJogadorEuProprio = inject("idJogadorEuProprio");
const isMediador = inject("isMediador");
const mudaEtapa = inject("mudaEtapa");

const meuVoto = computed(() => {
  return sala.value.jogadores[idJogadorEuProprio]?.votou_em;
});

const definicoesPreparada = computed(() => {
  return _(sala.value.jogadores)
    .map((jogadorDaSala, idJogador) => {
      const hash = sha1(jogadorDaSala.definicao).toString();
      return { hash, idJogador, texto: jogadorDaSala.definicao };
    })
    .orderBy(["hash", "idJogador"])
    .map((item, index) => {
      const letra = String.fromCharCode(index + "A".charCodeAt(0));
      return { ...item, letra };
    })
    .value();
});

const votos = computed(() => {
  return _(sala.value.jogadores).countBy("votou_em").value();
});

const qtdFaltaVotar = computed(() => {
  const qtdJogadores = _.reject(sala.value.jogadores, (o, k) => {
    return k === sala.value.mediador;
  }).length;
  const qtdTotalVotos = _.filter(sala.value.jogadores, "votou_em").length;
  return qtdJogadores - qtdTotalVotos;
});

function votar(idJogadorNoQualVotar) {
  if (isMediador.value) {
    return;
  }

  set(dbRef("salas/" + sala.value.id + "/jogadores/" + idJogadorEuProprio.value + "/votou_em"), idJogadorNoQualVotar);
}

function calculaPontosDaRodada() {
  const pontosDaRodada = _.mapValues(sala.value.jogadores, () => 0);
  const idMediador = sala.value.mediador;
  pontosDaRodada[idMediador] = 3;

  _.each(sala.value.jogadores, (jogadorDaSala, idJogadorQueVotou) => {
    const idJogadorQueRecebeuOVoto = jogadorDaSala.votou_em;
    if (idJogadorQueVotou === idMediador) {
      // mediador nao vota, nada a fazer
    } else if (!idJogadorQueRecebeuOVoto) {
      // nao votou, nada a fazer
    } else if (idJogadorQueRecebeuOVoto === idJogadorQueVotou) {
      // votou na propria, nenhum ponto
    } else if (idJogadorQueRecebeuOVoto === idMediador) {
      // votou na certa, dois pontos
      pontosDaRodada[idJogadorQueVotou] += 2;
      // alguem votou na certa, mediador nao recebe pontos
      pontosDaRodada[idMediador] = 0;
    } else {
      // votou em jogador, jogador recebe um ponto
      pontosDaRodada[idJogadorQueRecebeuOVoto] += 1;
    }
  });

  return pontosDaRodada;
}

function definirProximoMediador() {
  const idJogadores = Object.keys(sala.value.jogadores);
  const indiceMediadorAtual = idJogadores.indexOf(sala.value.mediador);
  const indiceProximoMediador = (indiceMediadorAtual + 1) % idJogadores.length;
  return idJogadores[indiceProximoMediador];
}

function encerrarVotacao() {
  if (!isMediador.value || qtdFaltaVotar.value > 0) {
    return;
  }
  const pontosDaRodada = calculaPontosDaRodada();

  const salaUpdates = {};
  _.each(pontosDaRodada, (pontosDaRodada, idJogador) => {
    salaUpdates["jogadores/" + idJogador + "/pontos_ultima_rodada"] = pontosDaRodada;
    salaUpdates["jogadores/" + idJogador + "/pontos"] = increment(pontosDaRodada);
  });

  update(dbRef("salas/" + sala.value.id), salaUpdates)
    .then(() => {
      return mudaEtapa("preparacao");
    })
    .then(() => {
      const idProximoMediador = definirProximoMediador();
      set(dbRef("salas/" + sala.value.id + "/mediador"), idProximoMediador);
    });
}
</script>

<style>
/* Estilos */
</style>
