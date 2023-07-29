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
import { ref as dbRef, set } from "firebase/database";

const idSala = 0;

const idJogadorEuProprio = inject("idJogadorEuProprio");
const db = inject("db");

const apelido = ref("");

function entrarNaSala() {
  const jogadorRef = dbRef(
    db,
    "salas/" + idSala + "/jogadores/" + idJogadorEuProprio.value + "/apelido"
  );
  set(jogadorRef, apelido.value);

  const etapaRef = dbRef(db, "salas/" + idSala + "/etapa");
  set(etapaRef, "definicoes");
}
</script>

<style>
/* Estilos */
</style>
