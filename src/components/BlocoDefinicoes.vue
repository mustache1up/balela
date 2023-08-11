<template>
  <div>
    <h1>Valendo!</h1>

    <p>Palavra: {{ estado.sala.palavra || 'PALAVRA AQUI' }}</p>

    <p v-if="estado.souMediador">Você é o mediador da rodada!</p>
    <p v-if="!estado.souMediador">
      Mediador da rodada:
      {{ estado.sala.jogadores[estado.sala.mediador]?.apelido || 'MEDIADOR AQUI' }}
    </p>

    <p v-if="estado.souMediador">Os jogadores estão escrevendo suas definições!</p>
    <div v-if="!estado.souMediador">
      <label for="minhaDefinicao">Escreva sua definição:</label>
      <input type="text" id="minhaDefinicao" v-model="minhaDefinicao" />
      <button @click="enviarDefinicao">Enviar definição</button>
    </div>

    <div>
      <p>Tempo restante: {{ tempoRestante }} segundos</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import { db } from "../firebaseConfig";

const estado = inject("estado");

const minhaDefinicao = ref("");
const tempoRestante = ref(0);

function enviarDefinicao() {
  db.set(`salas/${estado.sala.id}/jogadores/${estado.meuIdJogador}/definicao`, minhaDefinicao.value);
}

function calculaTempoRestante() {
  if (estado.sala.fim_tempo === undefined) {
    return 0;
  }
  return estado.sala.fim_tempo - Math.round(Date.now() / 1000);
}

async function contagemRegressiva() {
  while (tempoRestante.value >= 0) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    tempoRestante.value = calculaTempoRestante();
  }
  tempoRestante.value = 0; // evita mostrar tempo negativo
  if (estado.souMediador) {
    db.set(`salas/${estado.sala.id}/etapa`, "votacao");
  }
}

onMounted(contagemRegressiva);
</script>

<style>
/* Estilos */
</style>
