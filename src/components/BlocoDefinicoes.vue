<template>
  <div>
    <h2>Valendo!</h2>

    <p>
      <h4 class="centralizado"> 
        {{ estado.sala.palavra || 'não definida' }}
        <span class="sem-negrito">   
          é:
        </span>  
      </h4>
    </p>

    <p v-if="estado.souMediador">Os jogadores estão escrevendo suas definições!</p>
    <div v-if="!estado.souMediador">
      
      <textarea id="minhaDefinicao" v-model="minhaDefinicao" cols="40" rows="3">
      </textarea>
       
      <button @click="enviarDefinicao">Enviar definição</button>
    </div>

    <div>
      <p>Tempo restante: {{ tempoRestante }} segundos</p>
    </div>

    <p v-if="estado.souMediador">Você é o mediador da rodada!</p>
    <p v-if="!estado.souMediador">
      Mediador da rodada:
      {{ estado.sala?.jogadores?.[estado.sala?.mediador]?.apelido || 'não definido!' }}
    </p>

    <div v-if="!estado.souMediador">
      <h3>Dica</h3>
      <p>Escreve uma definição convincente para os demais jogadores.</p>
      <p>Você ganha pontos para cada voto que sua definição receber!</p>
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
.sem-negrito {
  font-weight: 100;
}
.centralizado {
  text-align: center;
}  
</style>
