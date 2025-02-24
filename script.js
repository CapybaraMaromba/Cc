class SecureClient {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.ws = null;
        this.config = {
            url: 'wss://SEU_SUBDOMINIO.ngrok-free.app/ws',
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
            if(this.retryCount++ < this.config.maxRetries) {
                setTimeout(() => this.connect(), this.config.reconnectDelay);
            }
        };
    }

    handleResponse(data) {
        if(data.token) {
            localStorage.setItem('authToken', data.token);
            this.showSecureInterface();
        }
        
        if(data.error) {
            this.showError(data.error);
        }
    }

    sendCode() {
        this.ws.send(JSON.stringify({
            action: 'send_code',
            session: this.sessionId
        }));
    }

    login(code) {
        this.ws.send(JSON.stringify({
            action: 'login',
            session: this.sessionId,
            code: code.toUpperCase()
        }));
    }

    getData() {
        const token = localStorage.getItem('authToken');
        if(token) {
            this.ws.send(JSON.stringify({
                action: 'get_data',
                session: this.sessionId,
                token: token
            }));
        }
    }

    showSecureInterface() {
        document.getElementById('login').style.display = 'none';
        document.getElementById('secureContent').style.display = 'block';
    }

    showError(message) {
        console.error(`Erro de segurança: ${message}`);
    }
}

// Inicialização
const client = new SecureClient();
document.getElementById('requestCode').onclick = () => client.sendCode();
document.getElementById('loginBtn').onclick = () => {
    const code = document.getElementById('codeInput').value;
    client.login(code);
};
document.getElementById('getData').onclick = () => client.getData();
client.connect();
