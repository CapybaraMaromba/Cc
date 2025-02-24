class SecureClient {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.ws = null;
        this.config = {
            url: 'wss://stunning-lightly-tick.ngrok-free.app/ws', // Altere para o seu endpoint
            reconnectDelay: 5000,
            maxRetries: 3
        };
        this.token = null;
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
            if(this.retryCount++ < this.config.maxRetries) {
                setTimeout(() => this.connect(), this.config.reconnectDelay);
            }
        };
    }

    handleResponse(data) {
        console.log("Resposta:", data);
        if(data.error) {
            this.showError(data.error);
        }
        if(data.status) {
            console.log('Status:', data.status);
            if(data.status === 'authenticated') {
                this.token = data.token;
                this.showSecureInterface();
            }
            if(data.status === 'registered') {
                alert("Registro realizado com sucesso. Por favor, faça login.");
                this.showLoginInterface();
            }
            if(data.status === 'code_sent') {
                alert("Código enviado: " + data.code);
            }
        }
        if(data.saldo) {
            document.getElementById('saldo-display').innerText = data.saldo;
        }
    }

    // Envia requisição para solicitar o código de cadastro
    sendRegCode() {
        const username = document.getElementById('reg-username').value;
        if (!username) {
            alert("Informe o username.");
            return;
        }
        const payload = {
            action: 'send_reg_code',
            session: this.sessionId,
            username: username
        };
        this.ws.send(JSON.stringify(payload));
    }

    // Realiza o cadastro: envia username, senha e o código recebido
    register() {
        const username = document.getElementById('reg-username').value;
        const password = document.getElementById('reg-password').value;
        const code = document.getElementById('reg-code').value;
        if(!username || !password || !code) {
            alert("Preencha todos os campos para registro.");
            return;
        }
        const payload = {
            action: 'register',
            session: this.sessionId,
            username: username,
            password: password,
            code: code
        };
        this.ws.send(JSON.stringify(payload));
    }

    // Realiza login com username e senha
    login() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        if(!username || !password) {
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

    // Solicita o saldo do usuário autenticado
    getSaldo() {
        if(!this.token) {
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

    showSecureInterface() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('registration-section').style.display = 'none';
        document.getElementById('secure-section').style.display = 'block';
        this.getSaldo();
    }

    showLoginInterface() {
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('registration-section').style.display = 'none';
        document.getElementById('secure-section').style.display = 'none';
    }

    showRegistrationInterface() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('registration-section').style.display = 'block';
        document.getElementById('secure-section').style.display = 'none';
    }

    showError(message) {
        console.error("Erro:", message);
        alert("Erro: " + message);
    }
}

const client = new SecureClient();
client.connect();

// Eventos para a tela de login
document.getElementById('login-btn').onclick = () => client.login();
document.getElementById('go-to-register').onclick = () => client.showRegistrationInterface();

// Eventos para a tela de cadastro
document.getElementById('send-reg-code-btn').onclick = () => client.sendRegCode();
document.getElementById('register-btn').onclick = () => client.register();
document.getElementById('go-to-login').onclick = () => client.showLoginInterface();

// Evento para atualizar o saldo na tela segura
document.getElementById('refresh-saldo-btn').onclick = () => client.getSaldo();
