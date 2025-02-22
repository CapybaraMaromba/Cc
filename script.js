document.addEventListener("DOMContentLoaded", () => {
  // Gera um identificador único de sessão e salva no localStorage
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem("sessionId", sessionId);
  }
  console.log("Session ID:", sessionId);

  // URL base do seu servidor API (ngrok)
  const baseURL = "https://stunning-lightly-tick.ngrok-free.app";

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

  // Função para solicitar o código de login
  requestCodeBtn.addEventListener("click", async () => {
    const requestData = { session: sessionId };
    console.log("Enviando solicitação de código com dados:", requestData);
    try {
      const response = await fetch(`${baseURL}/send_code`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });
      const data = await response.json();
      console.log("Resposta do servidor para send_code:", data);
      if (data.status === "code sent") {
        loginMessage.textContent = "Código enviado! Verifique o canal do Discord.";
      } else {
        loginMessage.textContent = "Erro ao enviar código: " + JSON.stringify(data);
      }
    } catch (error) {
      console.error("Erro ao solicitar código:", error);
      loginMessage.textContent = "Erro de comunicação com o servidor.";
    }
  });

  // Função para efetuar o login
  loginBtn.addEventListener("click", async () => {
    const code = codeInput.value.trim();
    if (!code) {
      loginMessage.textContent = "Digite o código recebido.";
      return;
    }
    console.log("Tentando login com código:", code);
    try {
      const response = await fetch(`${baseURL}/login`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session: sessionId, code: code })
      });
      const data = await response.json();
      console.log("Resposta do servidor para login:", data);
      if (data.status === "login successful") {
        loginMessage.textContent = "Login realizado com sucesso!";
        loginSection.style.display = "none";
        messageSection.style.display = "block";
      } else {
        loginMessage.textContent = "Código incorreto. Tente novamente.";
      }
    } catch (error) {
      console.error("Erro ao tentar login:", error);
      loginMessage.textContent = "Erro de comunicação com o servidor.";
    }
  });

  // Função para enviar mensagem para o canal do Discord
  sendMessageBtn.addEventListener("click", async () => {
    const message = messageInput.value.trim() || "Olá, essa é uma mensagem de teste!";
    console.log("Enviando mensagem:", message);
    try {
      const response = await fetch(`${baseURL}/send_message`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message })
      });
      const data = await response.json();
      console.log("Resposta do servidor para send_message:", data);
      if (data.status === "message sent") {
        sendMessageStatus.textContent = "Mensagem enviada com sucesso!";
        messageInput.value = "";
      } else {
        sendMessageStatus.textContent = "Erro ao enviar mensagem: " + JSON.stringify(data);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      sendMessageStatus.textContent = "Erro de comunicação com o servidor.";
    }
  });
});
