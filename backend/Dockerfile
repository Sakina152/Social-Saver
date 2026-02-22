FROM node:20-slim

# Install dependencies for Chrome and Python
RUN apt-get update && apt-get install -y \
    python3 python3-pip \
    chromium \
    fonts-freefont-ttf \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt --break-system-packages

COPY . .

# Crucial for Fly.io/Docker
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Run both services
CMD ["sh", "-c", "node bot.js & uvicorn main:app --host 0.0.0.0 --port 8000"]