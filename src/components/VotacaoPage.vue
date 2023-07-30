<template>
  <div>
    <h1>Votação</h1>

    <p>Palavra: {{ sala.palavra || "PALAVRA AQUI" }}</p>

    <p v-if="isMediador">Você é o mediador da rodada!</p>
    <p v-if="!isMediador">
      Mediador da rodada:
      {{ sala.jogadores[sala.mediador]?.apelido || "MEDIADOR AQUI" }}
    </p>

    <div v-for="def in definicoesPreparada" :key="def.letra">
      <p v-if="isMediador">Definição {{ def.letra }}: {{ def.texto }}</p>
      <button v-if="!isMediador" @click="votar(def.idJogador)">
        Definição {{ def.letra }}: {{ votos[def.idJogador] || 0 }} votos
        {{ def.idJogador === meuVoto ? "*votado*" : "" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from "vue";
import { ref as dbRef, set } from "firebase/database";
import _ from "lodash";
import sha1 from "crypto-js/sha1";

const idSala = inject("idSala");
const db = inject("db");
const sala = inject("sala");
const idJogadorEuProprio = inject("idJogadorEuProprio");
const isMediador = inject("isMediador");

const meuVoto = computed(() => {
  return sala.value.jogadores[idJogadorEuProprio]?.votou_em || -1;
});

const definicoesPreparada = computed(() => {
  return _(sala.value.jogadores)
    .entries()
    .map(([idJogador, jogador]) => {
      const hash = sha1(jogador.definicao).toString();
      return { hash, idJogador, texto: jogador.definicao };
    })
    .orderBy(["hash", "idJogador"])
    .map((item, index) => {
      const letra = String.fromCharCode(index + "A".charCodeAt(0));
      return { ...item, letra };
    })
    .value();
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
        idSala.value +
        "/jogadores/" +
        idJogadorEuProprio.value +
        "/votou_em"
    );
    // set(votouEmRef, increment(1));
    set(votouEmRef, idJogadorNoQualVotar);
  }
}
</script>

<style>
/* Estilos */
</style>
