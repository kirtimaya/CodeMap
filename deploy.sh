#!/bin/bash
# Run from your Mac to deploy the backend to OCI.
# Usage: ./deploy.sh /path/to/your-ssh-key

set -e

SSH_KEY=${1:-~/.ssh/id_rsa}
OCI_USER="opc"
OCI_HOST="140.245.201.63"
REMOTE="$OCI_USER@$OCI_HOST"

echo "==> Building JAR locally..."
cd "$(dirname "$0")/backend"
mvn package -DskipTests -q
JAR=$(ls target/codemap-backend-*.jar | head -1)
echo "    Built: $JAR"

echo "==> Copying JAR to OCI..."
scp -i "$SSH_KEY" "$JAR" "$REMOTE:/home/opc/codemap/codemap-backend.jar"

echo "==> Restarting service..."
ssh -i "$SSH_KEY" "$REMOTE" "sudo systemctl restart codemap && sleep 3 && sudo systemctl is-active codemap"

echo ""
echo "Done! Health check:"
sleep 3
curl -s "http://$OCI_HOST/actuator/health" | python3 -m json.tool 2>/dev/null || \
  echo "(nginx may take a moment — try: curl http://$OCI_HOST/actuator/health)"
