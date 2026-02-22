const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// backend/bot.js
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, // or 'new' depending on your puppeteer version
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-extensions',
            '--disable-gpu',
            '--no-zygote' // This helps with network stability on Windows
        ]
    }
});

client.on('qr', qr => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('✅ WhatsApp Bot is LIVE!'));

client.on('message', async msg => {
    // Only process links
    if (msg.body.includes('http')) {
        msg.reply("🤖 I'm on it! Extracting the 'vibe' and saving it to your dashboard...");

        try {
            // Forwarding the link to your Python FastAPI backend
            await axios.post('http://127.0.0.1:8000/webhook', {
                url: msg.body,
                sender: msg.from
            });
        } catch (err) {
            console.error("Couldn't reach Python backend. Is it running?");
        }
    }
});

client.initialize();