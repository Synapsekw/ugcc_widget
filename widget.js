/**
 * UGCC AI Chat Widget - Visual Polish (Scrollbar Fix) v5
 */

class GlassChatWidget {
    constructor(config) {
        this.webhookUrl = config.webhookUrl;
        this.chatTitle = config.chatTitle || "UGCC Support"; 
        this.logoUrl = config.logoUrl || null; 
        this.primaryColor = config.primaryColor || '#d31225'; 
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
            setTimeout(() => this.elements.input.focus(), 100);
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
                --glass-bg: rgba(10, 10, 15, 0.95); /* Slightly darker for better contrast */
                --glass-border: rgba(255, 255, 255, 0.15);
                font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                z-index: 2147483647; 
                position: fixed;
                bottom: 25px;
                right: 25px;
            }

            .chat-launcher {
                width: 60px; height: 60px;
                background: rgba(20, 20, 30, 0.6); 
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 50%; cursor: pointer;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                display: flex; align-items: center; justify-content: center;
                transition: transform 0.3s ease;
                overflow: hidden;
            }
            .chat-launcher:hover { transform: scale(1.05); }
            .chat-launcher.hidden { opacity: 0; pointer-events: none; transform: scale(0.5); }
            
            .launcher-img { width: 60%; height: 60%; object-fit: contain; pointer-events: none; }
            .launcher-icon { width: 30px; height: 30px; fill: white; }

            /* MAIN CHAT CONTAINER */
            .chat-container {
                width: 380px; height: 600px; max-height: 80vh;
                background-color: var(--glass-bg); 
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                border: 1px solid var(--glass-border);
                border-radius: 20px;
                /* This forces the corners to clip even with child elements */
                overflow: hidden; 
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
                display: flex; flex-direction: column;
                position: absolute; bottom: 0; right: 0;
                transform-origin: bottom right;
                transform: scale(0.9) translateY(20px);
                opacity: 0; pointer-events: none;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .chat-container.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }

            .chat-header {
                padding: 18px 24px; 
                background: rgba(255, 255, 255, 0.05);
                border-bottom: 1px solid rgba(255,255,255,0.05);
                display: flex; justify-content: space-between; align-items: center;
                min-height: 30px;
                /* Force top corners to round in case overflow fails */
                border-top-left-radius: 20px;
                border-top-right-radius: 20px;
            }
            .header-title { font-weight: 600; font-size: 16px; color: #ffffff !important; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
            .close-btn { background: none; border: none; cursor: pointer; color: #ffffff !important; opacity: 0.8; font-size: 28px; padding: 0 5px; }

            /* --- CUSTOM SCROLLBAR (THE FIX) --- */
            .chat-messages { 
                flex: 1; 
                padding: 24px; 
                overflow-y: auto; 
                display: flex; 
                flex-direction: column; 
                gap: 16px;
                scrollbar-width: thin; 
                scrollbar-color: rgba(255,255,255,0.2) transparent; /* Firefox */
            }
            
            /* Chrome/Safari Scrollbar Fix */
            .chat-messages::-webkit-scrollbar { width: 6px; }
            .chat-messages::-webkit-scrollbar-track { background: transparent; } /* Transparent Track */
            .chat-messages::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }

            .message { display: flex; flex-direction: column; max-width: 85%; }
            .message.user { align-self: flex-end; align-items: flex-end; }
            .message.bot { align-self: flex-start; align-items: flex-start; }

            .bubble { padding: 14px 18px; border-radius: 18px; font-size: 14px; line-height: 1.5; color: white; }
            .message.user .bubble { background: linear-gradient(135deg, var(--primary), #a00f1c); border-bottom-right-radius: 4px; }
            .message.bot .bubble { background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255,255,255,0.05); border-bottom-left-radius: 4px; }

            .typing-indicator { display: none; gap: 6px; padding: 12px 18px; background: rgba(255,255,255,0.05); border-radius: 20px; width: fit-content; margin-left: 24px; margin-bottom: 12px; }
            .dot { width: 6px; height: 6px; background: rgba(255,255,255,0.6); border-radius: 50%; animation: bounce 1.4s infinite; }
            .dot:nth-child(2) { animation-delay: 0.2s; } .dot:nth-child(3) { animation-delay: 0.4s; }
            @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

            .chat-input { padding: 20px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.05); display: flex; gap: 12px; }
            .chat-input input { font-size: 16px; flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 12px; color: white; outline: none; }
            .send-btn { background: var(--primary); border: none; width: 44px; height: 44px; border-radius: 12px; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }

            @media (max-width: 480px) {
                .chat-container {
                    position: fixed; bottom: 0 !important; right: 0 !important; left: 0 !important; top: 0 !important;
                    width: 100vw !important; height: 100dvh !important; max-height: 100dvh !important;
                    border-radius: 0 !important; transform: none !important; margin: 0 !important;
                    background-color: rgba(10, 10, 15, 0.98);
                }
                .chat-container.open { opacity: 1; pointer-events: all; transform: none !important; }
                .chat-header { padding-top: 20px; border-radius: 0; }
            }
        `;
    }

    getHTML() {
        const iconHtml = this.logoUrl 
            ? `<img src="${this.logoUrl}" class="launcher-img" alt="Chat" />`
            : `<svg class="launcher-icon" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`;

        return `
            <div class="chat-launcher">${iconHtml}</div>
            <div class="chat-container">
                <div class="chat-header">
                    <span class="header-title">${this.chatTitle}</span>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="chat-messages"></div>
                <div class="typing-indicator"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                <div class="chat-input">
                    <input type="text" placeholder="Type a message..." />
                    <button class="send-btn"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
                </div>
            </div>
        `;
    }
}
