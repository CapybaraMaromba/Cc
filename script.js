document.addEventListener("DOMContentLoaded", () => {
  // Gera um identificador único de sessão e salva no localStorage
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem("sessionId", sessionId);
  }
  console.log("Session ID:", sessionId);

  // URL do WebSocket do seu servidor API (use ws:// ou wss:// conforme seu setup)
  const wsURL = "wss://stunning-lightly-tick.ngrok-free.app/ws";

  // Cria a conexão WebSocket
  const ws = new WebSocket(wsURL);

  // Seleção dos elementos da página
  const requestCodeBtn = document.getElementById("request-code-btn");
  const loginBtn = document.getElementById("login-btn");
  const loginMessage = document.getElementById("login-message");
  const codeInput = document.getElementById("code-input");
  const loginSection = document.getElementById("login-section");
  const messageSection = document.getElementById("message-section");
  const sendMessageBtn = document.getElementById("send-message-btn");
  const messageInput = document.getElementById("message-input");
  const sendMessageStatus = document.getElementById("send-message-status");
  
  // Elementos opcionais para solicitar e exibir a última mensagem
  const lastMessageBtn = document.getElementById("last-message-btn");
  const lastMessageDisplay = document.getElementById("last-message-display");

  ws.onopen = function() {
    console.log("Conexão WebSocket estabelecida.");
  };

  ws.onmessage = function(event) {
    console.log("Recebido do servidor:", event.data);
    // Processa a resposta do servidor de acordo com o conteúdo da mensagem
    if (event.data.includes("Código enviado")) {
      loginMessage.textContent = event.data;
    } else if (event.data.includes("Login realizado com sucesso")) {
      loginMessage.textContent = event.data;
      loginSection.style.display = "none";
      messageSection.style.display = "block";
    } else if (event.data.includes("Mensagem enviada")) {
      sendMessageStatus.textContent = event.data;
      messageInput.value = "";
    } else if (event.data.includes("Última mensagem:")) {
      if (lastMessageDisplay) {
        lastMessageDisplay.textContent = event.data;
      } else {
        console.log("Última mensagem:", event.data);
      }
    } else {
      // Para mensagens genéricas, apenas loga no console
      console.log("Resposta do servidor:", event.data);
    }
  };

  ws.onerror = function(error) {
    console.error("Erro na conexão WebSocket:", error);
  };

  ws.onclose = function() {
    console.log("Conexão WebSocket fechada.");
  };

  // Função para solicitar o código de login via WebSocket
  requestCodeBtn.addEventListener("click", () => {
    const requestData = { action: "send_code", session: sessionId };
    console.log("Enviando solicitação de código via WebSocket:", requestData);
    ws.send(JSON.stringify(requestData));
  });

  // Função para efetuar o login via WebSocket
  loginBtn.addEventListener("click", () => {
    const code = codeInput.value.trim();
    if (!code) {
      loginMessage.textContent = "Digite o código recebido.";
      return;
    }
    const requestData = { action: "login", session: sessionId, code: code };
    console.log("Enviando requisição de login via WebSocket:", requestData);
    ws.send(JSON.stringify(requestData));
  });

  // Função para enviar mensagem para o canal do Discord via WebSocket
  sendMessageBtn.addEventListener("click", () => {
    const message = messageInput.value.trim() || "Olá, essa é uma mensagem de teste!";
    const requestData = { action: "send_message", message: message };
    console.log("Enviando mensagem via WebSocket:", requestData);
    ws.send(JSON.stringify(requestData));
  });

  // Função para solicitar a última mensagem do chat via WebSocket (se os elementos existirem)
  if (lastMessageBtn) {
    lastMessageBtn.addEventListener("click", () => {
      const requestData = { action: "última_mensagem" };
      console.log("Solicitando a última mensagem via WebSocket:", requestData);
      ws.send(JSON.stringify(requestData));
    });
  }
});
