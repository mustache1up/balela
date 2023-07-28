// app.js
const express = require('express');
const app = express();
const port = 3000; // ou qualquer outra porta que você preferir

// Defina as rotas aqui
app.get('/api/rooms', (req, res) => {
  // Implemente a lógica para retornar as salas do jogo
});

app.get('/api/room/:id', (req, res) => {
  // Implemente a lógica para retornar os detalhes de uma sala específica
});

app.post('/api/room/:id/definition', (req, res) => {
  // Implemente a lógica para receber as definições dos jogadores
});

app.post('/api/room/:id/vote', (req, res) => {
  // Implemente a lógica para receber os votos dos jogadores
});

// Inicie o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});