class SecureClient {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.ws = null;
        this.config = {
            url: 'wss://stunning-lightly-tick.ngrok-free.app/ws',
            reconnectDelay: 5000,
            maxRetries: 3
        };
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
        if (data.token) {
            localStorage.setItem('authToken', data.token);
            this.showSecureInterface();
        }
        
        if (data.error) {
            this.showError(data.error);
        }
        if (data.status) {
            console.log('Status: ' + data.status);
        }
        if (data.saldo !== undefined) {
            console.log('Saldo: ' + data.saldo);
            document.getElementById('send-message-status').innerText = 'Saldo: ' + data.saldo;
        }
    }

    sendCode() {
        const userId = document.getElementById('user-id').value;
        this.ws.send(JSON.stringify({
            action: 'send_code',
            session: this.sessionId,
            user_id: userId
        }));
    }

    login(code) {
        this.ws.send(JSON.stringify({
            action: 'login',
            session: this.sessionId,
            code: code.toUpperCase()
        }));
    }

    getSaldo() {
        const token = localStorage.getItem('authToken');
        if (token) {
            this.ws.send(JSON.stringify({
                action: 'get_saldo',
                session: this.sessionId,
                token: token
            }));
        }
    }

    showSecureInterface() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('message-section').style.display = 'block';
    }

    showError(message) {
        console.error(`Erro de segurança: ${message}`);
        document.getElementById('login-message').innerText = message;
    }
}

// Inicialização
const client = new SecureClient();
document.getElementById('request-code-btn').onclick = () => client.sendCode();
document.getElementById('login-btn').onclick = () => {
    const code = document.getElementById('code-input').value;
    client.login(code);
};

// Se desejar consultar o saldo, certifique-se de ter o botão com id 'get-saldo-btn'
const getSaldoBtn = document.getElementById('get-saldo-btn');
if (getSaldoBtn) {
    getSaldoBtn.onclick = () => client.getSaldo();
}

client.connect();
