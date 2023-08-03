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
import { set } from "@firebase/database";
import { dbRef } from "../firebaseConfig";

const sala = inject("sala");
const mudaEtapa = inject("mudaEtapa");
const idJogadorEuProprio = inject("idJogadorEuProprio");

const apelido = ref("");

function entrarNaSala() {
  set(dbRef("salas/" + sala.value.id + "/jogadores/" + idJogadorEuProprio.value + "/apelido"), apelido.value);

  mudaEtapa("definicoes");
}
</script>

<style>
/* Estilos */
</style>
