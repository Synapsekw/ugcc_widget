/**
 * Glassmorphism AI Chat Widget
 * Hosted on GitHub for Hostinger Integration
 */

class GlassChatWidget {
    constructor(config) {
        this.webhookUrl = config.webhookUrl;
        this.welcomeMessage = config.welcomeMessage || "Hello! How can I help you?";
        this.primaryColor = config.primaryColor || '#6366f1'; // Default Indigo
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
        // Create the Shadow DOM host
        const host = document.createElement('div');
        host.id = 'glass-ai-widget-host';
        document.body.appendChild(host);
        
        // Attach Shadow DOM to protect styles
        const shadow = host.attachShadow({ mode: 'open' });
        
        // Inject styles and HTML
        shadow.innerHTML = `
            <style>${this.getStyles()}</style>
            ${this.getHTML()}
        `;
        
        // Bind elements
        this.elements = {
            container: shadow.querySelector('.chat-container'),
            launcher: shadow.querySelector('.chat-launcher'),
            closeBtn: shadow.querySelector('.close-btn'),
            messages: shadow.querySelector('.chat-messages'),
            input: shadow.querySelector('.chat-input input'),
            sendBtn: shadow.querySelector('.send-btn'),
            typing: shadow.querySelector('.typing-indicator')
        };

        // Event Listeners
        this.elements.launcher.addEventListener('click', () => this.toggleChat());
        this.elements.closeBtn.addEventListener('click', () => this.toggleChat());
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Add welcome message
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

        // Add User Message
        this.addMessage(text, 'user');
        this.elements.input.value = '';
        this.showTyping();

        try {
            // Send payload to N8N
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
            
            // Handle N8N Response (looks for 'output' or 'text')
            const botReply = data.output || data.text || "I received the message, but the response format was unexpected.";
            
            this.hideTyping();
            this.addMessage(botReply, 'bot');

        } catch (error) {
            console.error('Widget Error:', error);
            this.hideTyping();
            this.addMessage("Sorry, I am having trouble connecting to the server.", 'bot');
        }
    }

    addMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        
        // Simple HTML sanitization and newline handling
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
                /* Smoked Glass Theme */
                --glass-bg: rgba(18, 18, 28, 0.65); 
                --glass-blur: blur(20px);
                --glass-gradient: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
                --glass-border: rgba(255, 255, 255, 0.15);
                --text-main: #ffffff;
                --text-secondary: #94a3b8;
                
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                z-index: 999999;
                position: fixed;
                bottom: 20px;
                right: 20px;
            }

            .chat-launcher {
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #0f172a, var(--primary));
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid rgba(255,255,255,0.1);
                transition: transform 0.3s ease;
            }
            .chat-launcher:hover { transform: scale(1.1); }
            .chat-launcher.hidden { opacity: 0; pointer-events: none; transform: scale(0.5); }
            .chat-launcher svg { width: 28px; height: 28px; fill: white; }

            .chat-container {
                width: 380px;
                height: 600px;
                max-height: 80vh;
                background-color: var(--glass-bg); 
                background-image: var(--glass-gradient);
                backdrop-filter: var(--glass-blur);
                -webkit-backdrop-filter: var(--glass-blur);
                border: 1px solid var(--glass-border);
                border-radius: 24px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                display: flex;
                flex-direction: column;
                position: absolute;
                bottom: 0;
                right: 0;
                transform-origin: bottom right;
                transform: scale(0.9) translateY(20px);
                opacity: 0;
                pointer-events: none;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                overflow: hidden;
            }

            .chat-container.open {
                transform: scale(1) translateY(0);
                opacity: 1;
                pointer-events: all;
            }

            .chat-header {
                padding: 20px 24px;
                border-bottom: 1px solid rgba(255,255,255,0.05);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .header-title { font-weight: 600; font-size: 16px; color: var(--text-main); text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
            .close-btn { background: none; border: none; cursor: pointer; color: var(--text-secondary); font-size: 24px; }
            .close-btn:hover { color: white; }

            .chat-messages {
                flex: 1;
                padding: 24px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 16px;
                scrollbar-width: thin;
                scrollbar-color: rgba(255,255,255,0.1) transparent;
            }
            
            .message { display: flex; flex-direction: column; max-width: 85%; animation: fadeUp 0.3s ease; }
            @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

            .message.user { align-self: flex-end; align-items: flex-end; }
            .message.bot { align-self: flex-start; align-items: flex-start; }

            .bubble {
                padding: 14px 18px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.5;
                position: relative;
                color: white;
            }

            .message.user .bubble {
                background: linear-gradient(135deg, var(--primary), #818cf8);
                border-bottom-right-radius: 4px;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
            }

            .message.bot .bubble {
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255,255,255,0.05);
                border-bottom-left-radius: 4px;
                backdrop-filter: blur(5px);
            }

            .typing-indicator {
                display: none;
                gap: 6px;
                padding: 12px 18px;
                background: rgba(255,255,255,0.05);
                border-radius: 20px;
                width: fit-content;
                margin-left: 24px;
                margin-bottom: 12px;
            }
            .dot { width: 6px; height: 6px; background: rgba(255,255,255,0.6); border-radius: 50%; animation: bounce 1.4s infinite; }
            .dot:nth-child(2) { animation-delay: 0.2s; } 
            .dot:nth-child(3) { animation-delay: 0.4s; }
            @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

            .chat-input {
                padding: 20px;
                background: rgba(0,0,0,0.1); 
                border-top: 1px solid rgba(255,255,255,0.05);
                display: flex;
                gap: 12px;
            }
            .chat-input input {
                flex: 1;
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                padding: 12px 16px;
                border-radius: 12px;
                color: white;
                outline: none;
                transition: background 0.2s;
            }
            .chat-input input:focus { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); }
            
            .send-btn {
                background: var(--primary);
                border: none;
                width: 44px;
                height: 44px;
                border-radius: 12px;
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s;
            }
            .send-btn:hover { transform: scale(1.05); }

            @media (max-width: 480px) {
                .chat-container { width: 100%; height: 100%; right: 0; bottom: 0; border-radius: 0; }
            }
        `;
    }

    getHTML() {
        return `
            <div class="chat-launcher">
                <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            </div>
            <div class="chat-container">
                <div class="chat-header">
                    <span class="header-title">AI Assistant</span>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="chat-messages"></div>
                <div class="typing-indicator"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
                <div class="chat-input">
                    <input type="text" placeholder="Type a message..." />
                    <button class="send-btn">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                    </button>
                </div>
            </div>
        `;
    }
}
