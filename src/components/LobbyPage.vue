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

const dbRefs = inject("dbRefs");
const mudaEtapa = inject("mudaEtapa");

const apelido = ref("");

function entrarNaSala() {
  set(dbRefs.eu.apelido, apelido.value);

  mudaEtapa("definicoes");
}
</script>

<style>
/* Estilos */
</style>
