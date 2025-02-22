document.addEventListener('DOMContentLoaded', () => {
  // Seleciona os elementos da página
  const botNumberElem = document.getElementById('bot-number');
  const userNumberElem = document.getElementById('user-number');
  const resultMessageElem = document.getElementById('result-message');
  const playButton = document.getElementById('play-button');
  const resetButton = document.getElementById('reset-button');

  // Variável para armazenar o número do bot
  let botNumber;

  // Função para iniciar uma nova rodada
  function startRound() {
    // Gera um número aleatório para o bot (entre 1 e 6)
    botNumber = Math.floor(Math.random() * 6) + 1;
    botNumberElem.textContent = botNumber;
    userNumberElem.textContent = '?';
    resultMessageElem.textContent = '';
    playButton.style.display = 'inline-block';
    resetButton.style.display = 'none';
  }

  // Função que executa quando o usuário joga
  function userPlay() {
    // Gera um número aleatório para o usuário (entre 1 e 6)
    const userNumber = Math.floor(Math.random() * 6) + 1;
    userNumberElem.textContent = userNumber;

    // Compara os números e define o resultado
    if (userNumber > botNumber) {
      resultMessageElem.textContent = 'Você venceu!';
    } else if (userNumber < botNumber) {
      resultMessageElem.textContent = 'Você perdeu!';
    } else {
      resultMessageElem.textContent = 'Empate!';
    }

    // Oculta o botão de jogar e exibe o botão de reiniciar
    playButton.style.display = 'none';
    resetButton.style.display = 'inline-block';
  }

  // Eventos dos botões
  playButton.addEventListener('click', userPlay);
  resetButton.addEventListener('click', startRound);

  // Inicia a primeira rodada
  startRound();
});
