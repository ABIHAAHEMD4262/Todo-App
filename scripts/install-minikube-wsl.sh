#!/bin/bash
# Install Minikube on WSL/Ubuntu
# Run this script inside WSL: bash install-minikube-wsl.sh

set -e

echo "🚀 Installing Minikube on WSL/Ubuntu..."

# Install Minikube
echo "📦 Downloading Minikube..."
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube
rm minikube-linux-amd64

# Verify installation
echo "✅ Minikube installed:"
minikube version

# Install kubectl (if not already installed)
if ! command -v kubectl &> /dev/null; then
    echo "📦 Installing kubectl..."
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
    rm kubectl
    echo "✅ kubectl installed:"
    kubectl version --client
else
    echo "✅ kubectl already installed"
fi

# Install Helm (for Phase 4)
if ! command -v helm &> /dev/null; then
    echo "📦 Installing Helm..."
    curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
    echo "✅ Helm installed:"
    helm version
else
    echo "✅ Helm already installed"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "1. Start Minikube: minikube start --driver=docker --cpus=2 --memory=4096"
echo "2. Enable addons: minikube addons enable ingress metrics-server"
echo "3. Check status: minikube status"
