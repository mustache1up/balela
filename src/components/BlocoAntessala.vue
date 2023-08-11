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
import { db } from "../firebaseConfig";

const estado = inject("estado");

const apelido = ref("");

function entrarNaSala() {
  db.set(`salas/${estado.idSala}/jogadores/${estado.meuIdJogador}/apelido`, apelido.value);
}
</script>

<style>
/* Estilos */
</style>
