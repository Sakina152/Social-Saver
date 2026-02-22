# Use a Node image that includes Python
FROM node:20-slim

# Install Python and Chrome dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    python3 python3-pip \
    chromium \
    fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm install

# Install Python dependencies
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt --break-system-packages

# Copy the rest of the code
COPY . .

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Expose the FastAPI port
EXPOSE 8000

# Start both Node (Bot) and Python (API)
CMD ["sh", "-c", "node bot.js & uvicorn main:app --host 0.0.0.0 --port 8000"]