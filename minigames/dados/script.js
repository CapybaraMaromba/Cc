(function() {
  // Obtém session e token dos parâmetros da URL
  const urlParams = new URLSearchParams(window.location.search);
  const session = urlParams.get('session');
  const token = urlParams.get('token');

  const wsUrl = 'wss://stunning-lightly-tick.ngrok-free.app:8182/ws'; // Altere conforme necessário
  let ws;

  function connect() {
    ws = new WebSocket(wsUrl);
    ws.onopen = () => {
      console.log("Conectado ao minigame Dados");
      getSaldo();
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Recebido:", data);
      if (data.error) {
        displayResult("Erro: " + data.error);
      }
      if (data.status === "result") {
        let message = `Você rolou: ${data.user_roll}<br>Bot rolou: ${data.bot_roll}<br>`;
        if (data.result === "win") {
          message += "Você venceu! Dobrou sua aposta.";
        } else if (data.result === "lose") {
          message += "Você perdeu a aposta.";
        } else {
          message += "Empate! Sua aposta foi devolvida.";
        }
        displayResult(message);
        document.getElementById('saldo').innerText = data.new_saldo;
      }
    };
    ws.onclose = () => {
      console.log("Conexão com minigame fechada.");
    };
  }

  function playGame() {
    const bet = document.getElementById('bet-input').value;
    if (!bet || bet <= 0) {
      alert("Informe um valor de aposta válido.");
      return;
    }
    const payload = {
      action: "play_dados",
      session: session,
      token: token,
      bet: bet
    };
    ws.send(JSON.stringify(payload));
  }

  function getSaldo() {
    // Opcional: implementar requisição para obter saldo atual, se necessário.
  }

  function displayResult(message) {
    document.getElementById('result-display').innerHTML = message;
  }

  document.getElementById('play-btn').onclick = playGame;
  document.getElementById('back-btn').onclick = () => {
    window.location.href = '../../index.html';
  };

  connect();
})();
