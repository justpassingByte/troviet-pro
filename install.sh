#!/usr/bin/env bash
set -e

echo "================================================================"
echo "          TROVIET PRO - 1-CLICK LINUX VPS INSTALLER             "
echo "================================================================"

# Check Docker & Docker Compose
if ! command -v docker &> /dev/null; then
    echo "[*] Docker not found. Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
    echo "[*] Installing docker-compose..."
    apt-get update && apt-get install -y docker-compose-plugin
fi

echo "[*] Building and starting TroViet Pro containers..."
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "================================================================"
echo " [SUCCESS] TroViet Pro is now running 24/7 on your VPS!"
echo " Access Dashboard at: http://$(curl -s ifconfig.me || echo 'YOUR_SERVER_IP')"
echo "================================================================"
