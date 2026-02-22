# Use Node as the base
FROM node:20-slim

# Install Python and Chromium for Puppeteer
RUN apt-get update && apt-get install -y \
    python3 python3-pip \
    chromium \
    fonts-freefont-ttf \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm install

# Install Python dependencies
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt --break-system-packages

# CRITICAL: Install Playwright browsers/drivers
RUN playwright install --with-deps chromium
# Copy code
COPY . .

# Environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Port for Render (FastAPI)
EXPOSE 8000

# Start both Node (Bot) and Python (API)
CMD ["sh", "-c", "node bot.js & uvicorn main:app --host 0.0.0.0 --port 8000"]