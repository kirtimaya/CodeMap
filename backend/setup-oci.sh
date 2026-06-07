#!/bin/bash
# One-time setup for OCI Oracle Linux instance (user: opc).
# Run this after SSH-ing in:
#   chmod +x setup-oci.sh && ./setup-oci.sh

set -e

echo "==> Updating system packages"
sudo dnf update -y -q

echo "==> Installing Java 21"
sudo dnf install -y java-21-openjdk java-21-openjdk-devel
java -version

echo "==> Installing nginx"
sudo dnf install -y nginx

echo "==> Creating app directory"
mkdir -p /home/opc/codemap

echo "==> Writing .env (edit this with your values)"
if [ ! -f /home/opc/codemap/.env ]; then
cat > /home/opc/codemap/.env << 'EOF'
GEMINI_API_KEY=replace-with-your-key
CORS_ALLOWED_ORIGINS=https://code-map-alpha.vercel.app
EOF
chmod 600 /home/opc/codemap/.env
echo "   Created .env — edit it with your GEMINI_API_KEY"
else
  echo "   .env already exists, skipping"
fi

echo "==> Installing systemd service"
sudo tee /etc/systemd/system/codemap.service > /dev/null << 'EOF'
[Unit]
Description=CodeMap Spring Boot Backend
After=network.target

[Service]
User=opc
WorkingDirectory=/home/opc/codemap
EnvironmentFile=/home/opc/codemap/.env
ExecStart=/usr/bin/java -jar /home/opc/codemap/codemap-backend.jar
SuccessExitStatus=143
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable codemap

echo "==> Configuring nginx"
sudo tee /etc/nginx/conf.d/codemap.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    # SSE grading stream — disable buffering so tokens reach the client immediately
    location /api/grade {
        proxy_pass http://localhost:8080/api/grade;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 120s;
        chunked_transfer_encoding on;
        add_header Cache-Control no-cache;
        add_header X-Accel-Buffering no;
    }

    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

sudo systemctl enable nginx
sudo systemctl restart nginx

echo "==> Opening firewall ports (Oracle Linux uses firewalld)"
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload
sudo firewall-cmd --list-all

echo ""
echo "=========================================="
echo " Setup complete!"
echo " Next steps:"
echo "  1. Edit /home/opc/codemap/.env"
echo "     → Confirm GEMINI_API_KEY is set"
echo "     → Confirm CORS_ALLOWED_ORIGINS is set"
echo "  2. Wait for GitHub Actions to deploy the JAR"
echo "  3. sudo systemctl start codemap"
echo "  4. Check: sudo systemctl status codemap"
echo "  5. Check: curl http://localhost:8080/actuator/health"
echo "=========================================="
