<template>
  <div>
    <h1>Salas de Jogo</h1>
    <p>Sala Mandra *selecionada*</p>
    <div>
      <label for="apelido">Escreva seu apelido:</label>
      <input type="text" id="apelido" v-model="apelido" />
      <button @click="entrarNaSala">Entrar na sala</button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from "vue";
import { ref as dbRef, set } from "@firebase/database";

const db = inject("db");
const idSala = inject("idSala");
const idJogadorEuProprio = inject("idJogadorEuProprio");
const mudaEtapa = inject("mudaEtapa");

const apelido = ref("");

function entrarNaSala() {
  const jogadorRef = dbRef(
    db,
    "salas/" +
      idSala.value +
      "/jogadores/" +
      idJogadorEuProprio.value +
      "/apelido"
  );
  set(jogadorRef, apelido.value);

  mudaEtapa("definicoes");
}
</script>

<style>
/* Estilos */
</style>
