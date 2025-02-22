document.addEventListener("DOMContentLoaded", () => {
  // Gera um identificador único de sessão e salva no localStorage
  let sessionId = localStorage.getItem("sessionId");
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem("sessionId", sessionId);
  }

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
    try {
      const response = await fetch(`${baseURL}/send_code`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session: sessionId })
      });
      const data = await response.json();
      if (data.status === "code sent") {
        loginMessage.textContent = "Código enviado! Verifique o canal do Discord.";
      } else {
        loginMessage.textContent = "Erro ao enviar código.";
      }
    } catch (error) {
      console.error("Erro:", error);
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
    try {
      const response = await fetch(`${baseURL}/login`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session: sessionId, code: code })
      });
      const data = await response.json();
      if (data.status === "login successful") {
        loginMessage.textContent = "Login realizado com sucesso!";
        // Esconde a seção de login e mostra a de envio de mensagem
        loginSection.style.display = "none";
        messageSection.style.display = "block";
      } else {
        loginMessage.textContent = "Código incorreto. Tente novamente.";
      }
    } catch (error) {
      console.error("Erro:", error);
      loginMessage.textContent = "Erro de comunicação com o servidor.";
    }
  });

  // Função para enviar mensagem para o canal do Discord
  sendMessageBtn.addEventListener("click", async () => {
    // Se nenhum texto for inserido, envia a mensagem de teste
    const message = messageInput.value.trim() || "Olá, essa é uma mensagem de teste!";
    try {
      const response = await fetch(`${baseURL}/send_message`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message })
      });
      const data = await response.json();
      if (data.status === "message sent") {
        sendMessageStatus.textContent = "Mensagem enviada com sucesso!";
        messageInput.value = "";
      } else {
        sendMessageStatus.textContent = "Erro ao enviar mensagem.";
      }
    } catch (error) {
      console.error("Erro:", error);
      sendMessageStatus.textContent = "Erro de comunicação com o servidor.";
    }
  });
});
