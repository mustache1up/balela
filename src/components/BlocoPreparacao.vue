<template>
  <h3 class="titulo">Você está na sala <b>{{ estado.sala.nome }}</b></h3>
  <h4>Jogadores</h4>

  <div>
    <p class="item-jogador" v-for="(jogador, idJogador) in estado.sala.jogadores" :key="idJogador">
      <strong>{{ jogador.apelido }}</strong>
      
      <a role="button" class="outline pontuacao vermelho">
        {{ jogador.pontos || 0 }}
      </a>

      <span v-if="jogador.pontos_ultima_rodada">

        <a role="button" class="outline pontuacao verde">
          + {{ jogador.pontos_ultima_rodada }} 
        </a>
     
      </span>
      <span v-if="idJogador === estado.sala.mediador">
        <a role="button" class="outline pontuacao">
          mediador    
        </a>
      </span>
      <span v-if="idJogador === estado.meuIdJogador">

        <a role="button" class="outline pontuacao">
          você    
        </a>
       
      </span>
    </p>
  </div>

  <h3>Preparativos da nova rodada</h3>
  <p>
    <b>
      <span v-if="estado.souMediador">
        Você
      </span>
      <span v-if="!estado.souMediador">
        {{ estado.sala.jogadores[estado.sala.mediador]?.apelido || 'Não sabemos quem' }}
      </span>
    </b> 
    é o mediador dessa rodada 🤠
  </p>


  <div v-if="estado.souMediador">
    <button @click="iniciarRodada">Iniciar Rodada</button>
  </div>
  <div v-if="!estado.souMediador">
    <p>A rodada já vai começar!</p>
  </div>
</template>

<script setup>
import { inject } from "vue";
import { db } from "../firebaseConfig";

const estado = inject("estado");

const tempoParaDefinicoesEmSegundos = 8; // TODO: definir tempo bom para jogar
const quantidadeMinimaJogadores = 2; // TODO: mudar para 3 ou 4

function iniciarRodada() {
  if (!estado.souMediador) {
    return;
  }

  if (estado.sala.jogadores.length < quantidadeMinimaJogadores) {
    alert(`É necessário pelo menos ${quantidadeMinimaJogadores} jogadores para iniciar a rodada.`);
    return;
  }

  // TODO: dar cinco opcoes de palavras para o mediador escolher (sem as definicoes)
  // TODO: gravar todas que foram na sala para nao repetir?
  db.get("palavras")
    .then((snapshot) => {
      const palavras = snapshot.val();
      var keys = Object.keys(palavras);
      const palavra = keys[(keys.length * Math.random()) << 0];
      const definicao = palavras[palavra];
      const fimTempo = Math.round(Date.now() / 1000) + tempoParaDefinicoesEmSegundos;

      const salaUpdates = {};
      salaUpdates["fim_tempo"] = fimTempo;
      salaUpdates["palavra"] = palavra;
      salaUpdates[`jogadores/${estado.sala.mediador}/definicao`] = definicao;
      return db.update(`salas/${estado.sala.id}`, salaUpdates);
    })
    .then(() => {
      db.set(`salas/${estado.sala.id}/etapa`, "definicoes");
    });
}
</script>

<style scoped>
.item-jogador {
  padding-left: 20px;
  margin-bottom: 10px;
}

.pontuacao {
  margin-left: 15px;
  color: blueviolet;
  border-color: blueviolet;
  padding: 3px 10px;
}

.vermelho {
  color: red;
  border-color: red;
}

.verde {
  color: green;
  border-color: green;
}

.titulo {
  margin: 0
}
</style>
