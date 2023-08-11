<template>
  <div>
    <h1>Votação</h1>

    <p>Palavra: {{ estado.sala.palavra || 'PALAVRA AQUI' }}</p>

    <p v-if="estado.souMediador">Você é o mediador da rodada!</p>
    <p v-if="!estado.souMediador">
      Mediador da rodada:
      {{ estado.sala.jogadores[estado.sala.mediador]?.apelido || 'MEDIADOR AQUI' }}
    </p>

    <div v-for="def in definicoesPreparada" :key="def.letra">
      <p v-if="estado.souMediador">Definição {{ def.letra }}: {{ def.texto }}</p>
      <button v-if="!estado.souMediador" @click="votar(def.idJogador)">
        Definição {{ def.letra }}: {{ votos[def.idJogador] || 0 }} votos
        {{ def.idJogador === meuVoto ? '*votado*' : '' }}
      </button>
    </div>

    <div v-if="estado.souMediador">
      <p>Faltam {{ qtdFaltaVotar }} votos!</p>
      <button v-if="qtdFaltaVotar <= 0" @click="encerrarVotacao">Encerrar votação</button>
    </div>
  </div>
</template>

<script setup>
import _ from "lodash";
import { computed, inject } from "vue";
import { increment } from "@firebase/database";
import { db } from "../firebaseConfig";
import sha1 from "crypto-js/sha1";

const estado = inject("estado");

const meuVoto = computed(() => {
  return estado.sala.jogadores[estado.meuIdJogador]?.votou_em;
});

const definicoesPreparada = computed(() => {
  return _(estado.sala.jogadores)
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
  return _(estado.sala.jogadores).filter("votou_em").countBy("votou_em").value();
});

const qtdFaltaVotar = computed(() => {
  const qtdJogadores = _.reject(estado.sala.jogadores, (o, k) => {
    return k === estado.sala.mediador;
  }).length;
  const qtdTotalVotos = _.filter(estado.sala.jogadores, "votou_em").length;
  return qtdJogadores - qtdTotalVotos;
});

function votar(idJogadorNoQualVotar) {
  if (estado.souMediador) {
    return;
  }

  db.set(`salas/${estado.sala.id}/jogadores/${estado.meuIdJogador}/votou_em`, idJogadorNoQualVotar);
}

function calculaPontosDaRodada() {
  const pontosDaRodada = _.mapValues(estado.sala.jogadores, () => 0);
  const idMediador = estado.sala.mediador;
  pontosDaRodada[idMediador] = 3;

  _.each(estado.sala.jogadores, (jogadorDaSala, idJogadorQueVotou) => {
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
  const idJogadores = Object.keys(estado.sala.jogadores);
  const indiceMediadorAtual = idJogadores.indexOf(estado.sala.mediador);
  const indiceProximoMediador = (indiceMediadorAtual + 1) % idJogadores.length;
  return idJogadores[indiceProximoMediador];
}

function encerrarVotacao() {
  if (!estado.souMediador || qtdFaltaVotar.value > 0) {
    return;
  }

  const pontosDaRodada = calculaPontosDaRodada();

  const salaUpdates = {};
  _.each(pontosDaRodada, (pontosDaRodada, idJogador) => {
    salaUpdates[`jogadores/${idJogador}/pontos_ultima_rodada`] = pontosDaRodada;
    salaUpdates[`jogadores/${idJogador}/pontos`] = increment(pontosDaRodada);
  });

  salaUpdates["etapa"] = "preparacao";
  
  const idProximoMediador = definirProximoMediador();
  salaUpdates["mediador"] = idProximoMediador;

  db.update(`salas/${estado.sala.id}`, salaUpdates);
}
</script>

<style>
/* Estilos */
</style>
