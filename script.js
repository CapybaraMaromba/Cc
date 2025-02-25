class SecureClient {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.ws = null;
    this.config = {
      url: 'wss://stunning-lightly-tick.ngrok-free.app/ws', // 
      reconnectDelay: 5000,
      maxRetries: 3
    };
    this.token = null;
    this.username = "";
  }

  generateSessionId() {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  connect() {
    this.ws = new WebSocket(this.config.url);
    this.ws.onopen = () => {
      console.log('Conexão segura estabelecida');
      this.retryCount = 0;
    };
    this.ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      this.handleResponse(data);
    };
    this.ws.onclose = () => {
      if (this.retryCount++ < this.config.maxRetries) {
        setTimeout(() => this.connect(), this.config.reconnectDelay);
      }
    };
  }

  handleResponse(data) {
    console.log("Resposta:", data);
    if (data.error) {
      this.showError(data.error);
    }
    if (data.status) {
      console.log('Status:', data.status);
      if (data.status === 'authenticated') {
        this.token = data.token;
        this.username = document.getElementById('login-username').value.trim();
        this.showSecureInterface();
      }
      if (data.status === 'registered') {
        alert("Registro realizado com sucesso. Faça login.");
        this.showLoginInterface();
      }
      if (data.status === 'code_sent') {
        alert("Código enviado para sua DM no Discord.");
        this.showRegistrationStep2();
      }
      if (data.status === 'code_verified') {
        alert("Código verificado com sucesso.");
        this.showRegistrationStep3();
      }
    }
    if (data.saldo) {
      document.getElementById('saldo-display').innerText = data.saldo;
    }
  }

  // ───────────── Cadastro ─────────────

  sendRegCode() {
    const username = document.getElementById('reg-username').value.trim();
    if (!username) {
      alert("Informe o username (ex.: i.legend).");
      return;
    }
    const payload = {
      action: 'send_reg_code',
      session: this.sessionId,
      username: username
    };
    this.ws.send(JSON.stringify(payload));
  }

  verifyRegCode() {
    const username = document.getElementById('reg-username').value.trim();
    const code = document.getElementById('reg-code').value.trim();
    if (!username || !code) {
      alert("Informe o username e o código recebido.");
      return;
    }
    const payload = {
      action: 'verify_reg_code',
      session: this.sessionId,
      username: username,
      code: code
    };
    this.ws.send(JSON.stringify(payload));
  }

  createAccount() {
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-password-confirm').value;
    if (!username || !password || !confirmPassword) {
      alert("Preencha todos os campos para criação da conta.");
      return;
    }
    const payload = {
      action: 'create_account',
      session: this.sessionId,
      username: username,
      password: password,
      confirm_password: confirmPassword
    };
    this.ws.send(JSON.stringify(payload));
  }

  // ───────────── Login ─────────────

  login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    if (!username || !password) {
      alert("Preencha todos os campos para login.");
      return;
    }
    const payload = {
      action: 'login',
      session: this.sessionId,
      username: username,
      password: password
    };
    this.ws.send(JSON.stringify(payload));
  }

  // ───────────── Interface Controls ─────────────

  showSecureInterface() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('registration-step1').style.display = 'none';
    document.getElementById('registration-step2').style.display = 'none';
    document.getElementById('registration-step3').style.display = 'none';
    document.getElementById('secure-section').style.display = 'block';
    // Preenche informações do usuário na top bar
    document.getElementById('user-name').innerText = this.username;
    // Se desejado, implementar chamada à API do Discord para obter o avatar; usamos o default.
    this.getSaldo();
  }

  showLoginInterface() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('registration-step1').style.display = 'none';
    document.getElementById('registration-step2').style.display = 'none';
    document.getElementById('registration-step3').style.display = 'none';
    document.getElementById('secure-section').style.display = 'none';
  }

  showRegistrationStep1() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('registration-step1').style.display = 'block';
    document.getElementById('registration-step2').style.display = 'none';
    document.getElementById('registration-step3').style.display = 'none';
    document.getElementById('secure-section').style.display = 'none';
  }

  showRegistrationStep2() {
    document.getElementById('registration-step1').style.display = 'none';
    document.getElementById('registration-step2').style.display = 'block';
    document.getElementById('registration-step3').style.display = 'none';
  }

  showRegistrationStep3() {
    document.getElementById('registration-step1').style.display = 'none';
    document.getElementById('registration-step2').style.display = 'none';
    document.getElementById('registration-step3').style.display = 'block';
  }

  showError(message) {
    console.error("Erro:", message);
    alert("Erro: " + message);
  }

  // Consulta de saldo
  getSaldo() {
    if (!this.token) {
      alert("Usuário não autenticado.");
      return;
    }
    const payload = {
      action: 'get_saldo',
      session: this.sessionId,
      token: this.token
    };
    this.ws.send(JSON.stringify(payload));
  }

  // Dark mode toggle
  toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const btn = document.getElementById('dark-mode-toggle');
    if (document.body.classList.contains('dark-mode')) {
      btn.innerText = '☀️';
    } else {
      btn.innerText = '🌙';
    }
  }
}

const client = new SecureClient();
client.connect();

// Eventos de Login
document.getElementById('login-btn').onclick = () => client.login();
document.getElementById('go-to-register').onclick = () => client.showRegistrationStep1();

// Eventos de Cadastro
document.getElementById('send-reg-code-btn').onclick = () => client.sendRegCode();
document.getElementById('verify-code-btn').onclick = () => client.verifyRegCode();
document.getElementById('resend-code-link').onclick = (e) => {
  e.preventDefault();
  client.sendRegCode();
};
document.getElementById('create-account-btn').onclick = () => client.createAccount();

// Evento do dark mode toggle
document.getElementById('dark-mode-toggle').onclick = () => client.toggleDarkMode();

// Evento de clique nos cards de minigames
document.querySelectorAll('.minigame-card').forEach(card => {
  card.onclick = () => {
    const game = card.getAttribute('data-game');
    if (game === 'dados') {
      window.location.href = 'minigames/dados/index.html?session=' + client.sessionId + '&token=' + client.token;
    } else {
      alert("Minigame ainda não implementado.");
    }
  };
});
