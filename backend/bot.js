const { Client, LocalAuth } = require('whatsapp-web.js');
const axios = require('axios');

/**
 * SOCIAL SAVER - WHATSAPP BOT
 * Optimized for Render logs and memory management
 */

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-gpu',
            '--no-zygote',
            '--single-process',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-breakpad',
            '--disable-component-extensions-with-background-pages',
            '--disable-features=TranslateUI,BlinkGenPropertyTrees',
            '--disable-ipc-flooding-protection',
            '--disable-renderer-backgrounding',
            '--enable-features=NetworkService,NetworkServiceInProcess',
            '--force-fieldtrials=SiteIsolationExtensions/Control',
            '--mute-audio'
        ],
        executablePath: process.platform === 'win32'
            ? null
            : (process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium')
    }
});

const DASHBOARD_URL = "https://social-saver-git-main-sakinas-projects-00bf43f6.vercel.app";
const PYTHON_BACKEND = "http://127.0.0.1:8000";

// --- QR CODE HANDLING (OPTIMIZED FOR RENDER) ---
let qrCount = 0;
const MAX_QR_ATTEMPTS = 5;

client.on('qr', qr => {
    qrCount++;
    if (qrCount > MAX_QR_ATTEMPTS) {
        console.log('🚨 MAX QR ATTEMPTS REACHED. Stopping bot to save memory.');
        client.destroy();
        process.exit(1);
    }

    console.log(`[${qrCount}/${MAX_QR_ATTEMPTS}] 🔗 SCAN QR CODE AT THIS LINK:`);
    console.log(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}`);
});

client.on('ready', () => {
    console.log('✅ Success! WhatsApp Bot is LIVE and connected.');
});

// Added a listener for connection failure to help debugging
client.on('auth_failure', msg => {
    console.error('❌ AUTHENTICATION FAILURE:', msg);
});

client.on('message', async msg => {
    // 1. COMMAND: /link user@email.com
    if (msg.body.startsWith('/link ')) {
        const email = msg.body.split(' ')[1];
        if (!email || !email.includes('@')) {
            return msg.reply("❌ *Invalid Format*\nPlease use: `/link your-email@gmail.com`", undefined, { sendSeen: false });
        }

        try {
            console.log(`🔗 Linking ${msg.from} to ${email}...`);
            await axios.post(`${PYTHON_BACKEND}/link-user`, {
                phone: msg.from,
                email: email
            });

            return msg.reply(
                `✅ *Account Linked!*\n\nLinks you send now will appear in the dashboard for *${email}*.\n\n🔗 ${DASHBOARD_URL}`,
                undefined,
                { sendSeen: false }
            );
        } catch (err) {
            console.error("Link Error:", err.message);
            return msg.reply("⚠️ *Connection Error*\nCould not reach the database. Is the backend running?", undefined, { sendSeen: false });
        }
    }

    // 2. DETECT LINKS
    if (msg.body.includes('http')) {
        msg.reply("🤖 *Processing your save...* \nI'm extracting the 'vibe' and organizing this into your digital brain.", undefined, { sendSeen: false });

        try {
            console.log(`📩 Incoming link from ${msg.from}`);
            await axios.post(`${PYTHON_BACKEND}/webhook`, {
                url: msg.body,
                sender: msg.from
            });

            setTimeout(() => {
                msg.reply(`✅ *Saved successfully!*\n\nView it here:\n🔗 ${DASHBOARD_URL}`, undefined, { sendSeen: false });
            }, 3000);
        } catch (err) {
            console.error("❌ Webhook Error:", err.message);
            msg.reply("⚠️ *Brain Freeze!*\nI couldn't reach my processing unit.", undefined, { sendSeen: false });
        }
    }
});

// Initialization
console.log(`🚀 Starting Bot on ${process.platform === 'win32' ? 'Windows' : 'Linux'}...`);
client.initialize().catch(err => console.error('❌ Failed to initialize:', err));