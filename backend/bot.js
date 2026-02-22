const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

/**
 * SOCIAL SAVER - WHATSAPP BOT
 * Optimized for both Windows (Local) and Linux (Render)
 */

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        // Critical flags for Render's 512MB RAM limit
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-extensions',
            '--disable-gpu',
            '--no-zygote',
            '--single-process'
        ],
        /* SMART PATH LOGIC:
           1. If on Windows (win32), let Puppeteer find Chrome automatically (null).
           2. If on Linux (Render), use the chromium path defined in our Dockerfile.
        */
        executablePath: process.platform === 'win32'
            ? null
            : (process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium')
    }
});

// --- CONFIGURATION ---
// Change this to your Vercel URL when you deploy the frontend
const DASHBOARD_URL = "https://social-saver-git-main-sakinas-projects-00bf43f6.vercel.app";
// 127.0.0.1 works for both local and Render's internal container networking
const PYTHON_BACKEND = "http://127.0.0.1:8000";

// --- QR CODE HANDLING ---
client.on('qr', qr => {
    console.log('---------------------------------------------------------');
    console.log('SCAN THIS QR CODE WITH WHATSAPP:');
    console.log('---------------------------------------------------------');

    qrcode.generate(qr, { small: true });

    console.log('---------------------------------------------------------');
    if (process.platform !== 'win32') {
        console.log('💡 RENDER TIP: Zoom out browser to 50% to align QR.');
    }
});

client.on('ready', () => {
    console.log('✅ Success! WhatsApp Bot is LIVE and connected.');
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
client.initialize();