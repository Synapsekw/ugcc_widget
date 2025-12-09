/**
 * UGCC AI Chat Widget - Final Branded Version
 */

class GlassChatWidget {
    constructor(config) {
        this.webhookUrl = config.webhookUrl;
        this.chatTitle = config.chatTitle || "UGCC Support"; 
        this.logoUrl = config.logoUrl || null; 
        this.primaryColor = config.primaryColor || '#d31225'; // UGCC Red
        this.welcomeMessage = config.welcomeMessage || "Hello! How can I help you with our projects?";
        this.sessionId = this.getOrCreateSessionId();
        this.init();
    }

    getOrCreateSessionId() {
        let id = localStorage.getItem('chatWidgetSessionId');
        if (!id) {
            id = 'session-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chatWidgetSessionId', id);
        }
        return id;
    }

    init() {
        const host = document.createElement('div');
        host.id = 'glass-ai-widget-host';
        document.body.appendChild(host);
        
        const shadow = host.attachShadow({ mode: 'open' });
        
        shadow.innerHTML = `
            <style>${this.getStyles()}</style>
            ${this.getHTML()}
        `;
        
        this.elements = {
            container: shadow.querySelector('.chat-container'),
            launcher: shadow.querySelector('.chat-launcher'),
            closeBtn: shadow.querySelector('.close-btn'),
            messages: shadow.querySelector('.chat-messages'),
            input: shadow.querySelector('.chat-input input'),
            sendBtn: shadow.querySelector('.send-btn'),
            typing: shadow.querySelector('.typing-indicator')
        };

        this.elements.launcher.addEventListener('click', () => this.toggleChat());
        this.elements.closeBtn.addEventListener('click', () => this.toggleChat());
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        if (this.elements.messages.children.length === 0) {
            this.addMessage(this.welcomeMessage, 'bot');
        }
    }

    toggleChat() {
        this.elements.container.classList.toggle('open');
        this.elements.launcher.classList.toggle('hidden');
        if (this.elements.container.classList.contains('open')) {
            this.elements.input.focus();
        }
    }

    async sendMessage() {
        const text = this.elements.input.value.trim();
        if (!text) return;

        this.addMessage(text, 'user');
        this.elements.input.value = '';
        this.showTyping();

        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: text, 
                    sessionId: this.sessionId,
                    timestamp: new Date().toISOString()
                })
            });

            const data = await response.json();
            const botReply = data.output || data.text || "I received your message.";
            
            this.hideTyping();
            this.addMessage(botReply, 'bot');

        } catch (error) {
            console.error('Widget Error:', error);
            this.hideTyping();
            this.addMessage("Connection error. Please try again.", 'bot');
        }
    }

    addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        const formattedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>');
        div.innerHTML = `<div class="bubble">${formattedText}</div>`;
        this.elements.messages.appendChild(div);
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
    }

    showTyping() { 
        this.elements.typing.style.display = 'flex'; 
        this.elements.messages.scrollTop = this.elements.messages.scrollHeight; 
    }
    
    hideTyping() { 
        this.elements.typing.style.display = 'none'; 
    }

    getStyles() {
        return `
            :host {
                --primary: ${this.primaryColor};
                /* Dark Smoked Glass */
                --glass-bg: rgba(10, 10, 15, 0.85); 
                --glass-blur: blur(15px);
                --glass-border: rgba(255, 255, 255, 0.15);
                --text-main: #ffffff;
                --text-secondary: #94a3b8;
                
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                z-index: 999999;
                position: fixed;
                bottom: 25px;
                right: 25px;
            }

            /* --- NEW LAUNCHER DESIGN (Translucent) --- */
            .chat-launcher {
                width: 65px;
                height: 65px;
                /* See-through background */
                background: rgba(20, 20, 30, 0.5); 
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8p
