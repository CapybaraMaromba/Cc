// client.js (Frontend Atualizado)
document.addEventListener("DOMContentLoaded", () => {
    // Geração segura de Session ID
    let sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
        const array = new Uint32Array(2);
        window.crypto.getRandomValues(array);
        sessionId = array[0].toString(36).padStart(6, '0') + array[1].toString(36).padStart(6, '0');
        localStorage.setItem("sessionId", sessionId);
    }

    // Configuração de conexão
    const config = {
        wsURL: "wss://seu-subdomínio.ngrok-free.app/ws",
        reconnectInterval: 5000,
        maxRetries: 5
    };

    // Elementos da UI
    const ui = {
        requestCodeBtn: document.getElementById("request-code-btn"),
        loginBtn: document.getElementById("login-btn"),
        codeInput: document.getElementById("code-input"),
        loginSection: document.getElementById("login-section"),
        messageSection: document.getElementById("message-section"),
        statusMessage: document.getElementById("status-message"),
        tokenExpiryWarning: document.getElementById("token-expiry-warning")
    };

    let ws;
    let reconnectAttempts = 0;
    let tokenCheckInterval;

    function connect() {
        ws = new WebSocket(config.wsURL);

        ws.onopen = () => {
            reconnectAttempts = 0;
            ui.statusMessage.textContent = "Conectado ao servidor";
            checkTokenExpiry();
        };

        ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            
            if (data.token) {
                localStorage.setItem("jwt", data.token);
                ui.loginSection.style.display = "none";
                ui.messageSection.style.display = "block";
                startTokenExpiryCheck();
            }
            
            if (data.error) {
                showError(data.error);
            }
            
            if (data.saldo) {
                updateSaldoDisplay(data.saldo);
            }
        };

        ws.onerror = (error) => {
            console.error("Erro na conexão:", error);
            ui.statusMessage.textContent = "Erro de conexão";
        };

        ws.onclose = () => {
            if (reconnectAttempts < config.maxRetries) {
                setTimeout(connect, config.reconnectInterval);
                reconnectAttempts++;
            }
        };
    }

    function startTokenExpiryCheck() {
        tokenCheckInterval = setInterval(() => {
            const token = localStorage.getItem("jwt");
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const expiry = payload.exp * 1000;
                const now = Date.now();
                
                if (expiry - now < 300000) { // 5 minutos antes da expiração
                    ui.tokenExpiryWarning.style.display = "block";
                }
            }
        }, 60000);
    }

    function checkTokenExpiry() {
        const token = localStorage.getItem("jwt");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.exp * 1000 < Date.now()) {
                    localStorage.removeItem("jwt");
                    ui.messageSection.style.display = "none";
                    ui.loginSection.style.display = "block";
                }
            } catch (e) {
                console.error("Erro ao verificar token:", e);
            }
        }
    }

    function showError(message) {
        ui.statusMessage.textContent = message;
        setTimeout(() => {
            ui.statusMessage.textContent = "";
        }, 5000);
    }

    // Event Listeners
    ui.requestCodeBtn.addEventListener("click", () => {
        const requestData = {
            action: "send_code",
            session: sessionId,
            user_id: "ID_DO_USUARIO_DISCORD" // Substituir pelo ID real
        };
        ws.send(JSON.stringify(requestData));
    });

    ui.loginBtn.addEventListener("click", () => {
        const code = ui.codeInput.value.trim();
        if (code.length !== 6) {
            showError("Código deve ter 6 dígitos");
            return;
        }
        
        const requestData = {
            action: "login",
            session: sessionId,
            code: code
        };
        ws.send(JSON.stringify(requestData));
    });

    // Conexão inicial
    connect();

    // Gerenciamento de token ao recarregar
    window.addEventListener("beforeunload", () => {
        if (ws) ws.close();
        clearInterval(tokenCheckInterval);
    });
});
