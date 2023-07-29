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
import { ref } from "vue";
import { ref as dbRef, update, getDatabase } from "firebase/database";
import firebaseApp from "../firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import router from "../router";

const db = getDatabase(firebaseApp);
const idSala = 0;

const idJogadorEuProprio = ref("NONE");

onAuthStateChanged(getAuth(), (user) => {
  if (user) {
    idJogadorEuProprio.value = user.uid;
    console.log("USER " + user.uid + " SIGNED");
  } else {
    console.log("USER NOT SIGNED");
  }
});

const apelido = ref("");

function entrarNaSala() {
  const jogadorRef = dbRef(
    db,
    "salas/" + idSala + "/jogadores/" + idJogadorEuProprio.value
  );
  update(jogadorRef, { apelido: apelido.value });
  router.push("/game");
}
</script>

<style>
/* Adicione estilos para a página de salas aqui */
</style>
