<template>
  <h2>Escolha a sala</h2>
  <ul>
    <li>Sala Papo Furado <i>*selecionada*</i></li>
  </ul>
  <h2>Escreva seu apelido</h2>
  <input type="text" id="apelido" v-model="apelido" />
  <br /><br />
  <button @click="entrarNaSala">Entrar na sala</button>
</template>

<script setup>
import { ref, inject } from "vue";
import { db } from "../firebaseConfig";

const estado = inject("estado");

const apelido = ref("");

function entrarNaSala() {
  if (!estado.sala.jogadores) {
    db.set(`salas/${estado.idSala}/mediador`, estado.meuIdJogador);
  }
  db.set(`salas/${estado.idSala}/jogadores/${estado.meuIdJogador}/apelido`, apelido.value);
}
</script>

<style scoped>
/* Estilos */
</style>
