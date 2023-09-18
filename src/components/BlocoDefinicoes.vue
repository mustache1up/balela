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
        <div class="centralizado"> 
          <button  @click="enviarDefinicao">Enviar definição</button>
        </div>         
    </div>

    <div class="barra-container">
      <div class="barra" :style="{ width: progresso}" :class="corDaBarra" ></div>
      <p v-if="exibirSemTempo" class="sem-tempo" @click="handleCliqueSemTempo">Sem tempo...</p>
    </div>
    <br>
    <div>
      <br><p class="eMuitoRapido" v-if="fraseOcultaVisivel">É muito rápido!</p>
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
const tempoTotal = ref(12);
const tempoRestante = ref(tempoTotal.value);
const progresso = ref("100%");
const corDaBarra = ref("barra");
const exibirSemTempo = ref(false);
let numCliquesSemTempo = 0;
let fraseOcultaVisivel = false; // Variável para controlar a exibição da frase oculta

function enviarDefinicao() {
  db.set(`salas/${estado.sala.id}/jogadores/${estado.meuIdJogador}/definicao`, minhaDefinicao.value);
}

function calculaTempoRestante() {
  if (estado.sala.fim_tempo === 0) {
    return 0;
  }
  return estado.sala.fim_tempo - Math.round(Date.now() / 1000);
}

function handleCliqueSemTempo() {
  numCliquesSemTempo++;
  if (numCliquesSemTempo === 3) {
    fraseOcultaVisivel = true; // Exibe a frase oculta após 3 cliques
  }
}

async function contagemRegressiva() {
  while (tempoRestante.value >= 0) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    tempoRestante.value -= 1;
    progresso.value = ((tempoRestante.value / tempoTotal.value) * 100).toFixed(2) + "%";
    if (tempoRestante.value <= 3) {
      corDaBarra.value = "roxo";
      exibirSemTempo.value = !exibirSemTempo.value; // Alternar visibilidade da mensagem // Mude para roxo quando o tempo estiver acabando
    }
    else if (tempoRestante.value <= 6) {
      corDaBarra.value = "vermelho"; // Mude para vermelho quando o tempo estiver acabando
    } 
    else if (tempoRestante.value <= 10) {
      corDaBarra.value = "amarelo"; // Mude para amarelo quando estiver quase acabando
    }
  }
  tempoRestante.value = 0; // Evita mostrar tempo negativo
  if (estado.souMediador) {
    db.set(`salas/${estado.sala.id}/etapa`, "votacao");
  }
}
onMounted(contagemRegressiva);
</script>

<style scoped>
/* Estilos */
.barra-container {
  width: 100%;
  height: 20px;
  background-color: #cccccc00;
}

.barra {
  text-align: right;
  height: 12px;
  width: 100%;
  border-radius: 15px;
  background-color: #4caf50; /* Cor de fundo da barra de progresso */
  transition: width 1s linear; /* Transição suave da largura */

}

.barra::before {
  left: 16px;
  top: -7px;
  position:relative;
  content: "\23F3"; /* Símbolo da ampulheta */
}

.roxo {
  height: 12px;
  width: 100%;
  background-color: #6200ff; /* Cor de fundo da barra de progresso */
  transition: 1s linear; /* Transição suave da largura */
}

  .sem-tempo {
    text-align: center;
    font-size: 24px; /* Tamanho da fonte da mensagem */
    color: #6200ff; /* Cor da mensagem */
    margin-top: -27px; /* Espaçamento superior para separar da barra de progresso */
    margin-left: 20px; /* Espaçamento esquerdo para separar da barra de progresso */
  }

  .eMuitoRapido {
    text-align: center;
    font-size: 22px; /* Tamanho da fonte da mensagem */
    color: #6200ff; /* Cor da mensagem */
    margin-top: -55px; /* Espaçamento superior para separar da barra de progresso */
    margin-left: 40px; /* Espaçamento esquerdo para separar da barra de progresso */
  }

    .eMuitoRapido::after {
      content: "\1F3C3"; /*run*/
    }

.vermelho {
  height: 12px;
  width: 100%;
  background-color: #ff0000; /* Cor de fundo da barra de progresso */
  transition: 1s linear; /* Transição suave da largura */
}

.amarelo {
  height: 12px;
  width: 100%;
  background-color: #fbff00; /* Cor de fundo da barra de progresso */
  transition: 1s linear; /* Transição suave da largura */
}

.sem-negrito {
  font-weight: 100;
}

.centralizado {
  text-align: center;
}  
.centralizado button {
  margin: 0 auto;   /* Centraliza horizontalmente o botão*/
  margin-bottom: 20px; /* Espaçamento superior para separar da barra de progresso */
  width: 50%; /*tamanho do botão*/
}
</style>
