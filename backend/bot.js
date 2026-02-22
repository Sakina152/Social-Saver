const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-extensions',
            '--disable-gpu',
            '--no-zygote'
        ]
    }
});

const DASHBOARD_URL = "http://localhost:3000";
const PYTHON_BACKEND = "http://127.0.0.1:8000";

client.on('qr', qr => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('✅ WhatsApp Bot is LIVE!'));

client.on('message', async msg => {
    const chat = await msg.getChat();

    // --- NEW: Handle the /link command ---
    if (msg.body.startsWith('/link ')) {
        const email = msg.body.split(' ')[1];

        if (!email || !email.includes('@')) {
            return msg.reply(
                "❌ *Invalid Format*\nPlease use: `/link your-email@gmail.com`",
                undefined,
                { sendSeen: false }
            );
        }

        try {
            // Tell Python to link this phone number to this email
            await axios.post(`${PYTHON_BACKEND}/link-user`, {
                phone: msg.from,
                email: email
            });

            return msg.reply(
                `✅ *Account Linked!*\n\nAny links you send now will appear in the dashboard for *${email}*.\n\n🔗 ${DASHBOARD_URL}`,
                undefined,
                { sendSeen: false }
            );
        } catch (err) {
            console.error("Link Error:", err.message);
            return msg.reply("⚠️ *Connection Error*\nCouldn't link account. Is the Python backend running?", undefined, { sendSeen: false });
        }
    }

    // --- EXISTING: Handle HTTP links ---
    if (msg.body.includes('http')) {
        // Immediate feedback
        msg.reply(
            "🤖 *Processing your save...* \nI'm extracting the 'vibe' and organizing this into your digital brain.",
            undefined,
            { sendSeen: false }
        );

        try {
            // Forwarding to Python FastAPI
            await axios.post(`${PYTHON_BACKEND}/webhook`, {
                url: msg.body,
                sender: msg.from
            });

            // Success feedback after processing delay
            setTimeout(() => {
                msg.reply(
                    `✅ *Saved successfully!*\n\nView and search your new insight here:\n🔗 ${DASHBOARD_URL}`,
                    undefined,
                    { sendSeen: false }
                );
            }, 2500);

        } catch (err) {
            console.error("❌ Backend Error:", err.message);
            msg.reply(
                "⚠️ *Brain Freeze!*\nI couldn't reach my processing unit. Please make sure the backend is running.",
                undefined,
                { sendSeen: false }
            );
        }
    }
});

client.initialize();