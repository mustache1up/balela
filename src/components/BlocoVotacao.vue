
<template>
   <div>
    <h2>Votação</h2>

    <h3>Palavra: <b> {{ estado.sala.palavra || 'não definida' }} </b></h3>

    <p>
      <b>
        <span v-if="estado.souMediador">
          Você
        </span>
        <span v-if="!estado.souMediador">
          {{ estado.sala.jogadores[estado.sala.mediador]?.apelido || 'Não sabemos quem' }}
        </span>
      </b> 
      é o mediador dessa rodada 🤠
    </p>

    <h3>Dica</h3>

    <div v-if="estado.souMediador">
      <p>Leia as definições para os jogadores de forma a não evidenciar qual é a correta.</p>
      <p>Você ganha um ponto para cada jogador que <b>não</b> votar na correta!</p>
    </div>
    <div v-if="!estado.souMediador">
      <p>Ouça atentamente às definições que o mediador lerá e vote na que acredita ser correta.</p>
      <p>Votando na correta você ganha dois pontos!</p>
    </div>

    <h3>Definições</h3>
    <div v-for="def in definicoesPreparada" :key="def.letra">
      <p v-if="estado.souMediador">
        Definição {{ def.letra }}: {{ def.texto }}
      </p>
      <div v-if="!estado.souMediador">
        
        <button @click="votar(def.idJogador)" :class="{ 'destaque-ativo': def.idJogador === meuVoto }">
        Definição {{ def.letra }} : {{ votos[def.idJogador] || 0 }} votos
        </button>
        
        {{ def.idJogador === meuVoto ? '' : '' }}
      </div>
    </div>
  
    <br />
    <p v-if="qtdFaltaVotar > 0">Falta {{ qtdFaltaVotar }} votos!</p>
    <p v-if="qtdFaltaVotar == 0">Todos votaram!</p>

    <div v-if="estado.souMediador">
      <button v-if="qtdFaltaVotar <= 0" @click="encerrarRodada">Encerrar votação</button>
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

function encerrarRodada() {
  if (!estado.souMediador || qtdFaltaVotar.value > 0) {
    return;
  }

  const pontosDaRodadaPorJogador = calculaPontosDaRodada();

  const salaUpdates = {};

  _.each(estado.sala.jogadores, (jogadorDaSala, idJogador) => {
    const pontosDaRodada = pontosDaRodadaPorJogador[idJogador] || 0;
    salaUpdates[`jogadores/${idJogador}/pontos_ultima_rodada`] = pontosDaRodada;
    salaUpdates[`jogadores/${idJogador}/pontos`] = increment(pontosDaRodada);
    salaUpdates[`jogadores/${idJogador}/definicao`] = null;
    salaUpdates[`jogadores/${idJogador}/votou_em`] = null;
  });

  salaUpdates["etapa"] = "preparacao";
  
  const idProximoMediador = definirProximoMediador();
  salaUpdates["mediador"] = idProximoMediador;

  db.update(`salas/${estado.sala.id}`, salaUpdates);
}
</script>


<style scoped>
/* Estilos botões*/
button {
  background-color:  #fff45d;
  color: rgb(0, 0, 0);
  border-color: #fff45d;
  border-radius: 20px;
  margin-left: 15px;  /* Afastamento do botão à esquerda da margem */
  padding: 15px;
  width: 300px; /* Largura desejada do botão */
  height: 50px; /* Altura desejada do botão */
  text-align: center; /* Alinhamento horizontal do texto */
  line-height:0px; /* Alinhamento vertical do texto */
}
button:hover {
  background-color: #feb52d;
  border-color: #fff45d;
  color: rgb(0, 0, 0);
  padding: 15px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.8s;
}
.destaque-ativo {
  background-color: #e77346;
  border-color: #fff45d;
  color: white;
  padding: 15px;
  border-radius: 20px;
  cursor: pointer;
}
.destaque-ativo::before {
  content: "\1F3AF"; /* Símbolo da alternativa marcada */
}
</style>
