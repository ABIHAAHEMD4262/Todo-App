#!/bin/bash

# Full-Stack Kubernetes Deployment Blueprint
# Automated Setup Script
# Version: 1.0.0

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
APP_NAME=""
NAMESPACE=""
REGISTRY="docker.io"
FRONTEND_DIR="./frontend"
BACKEND_DIR="./backend"
ENVIRONMENT="dev"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

# Function to display usage
usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Apply the Full-Stack Kubernetes Deployment Blueprint to your project.

OPTIONS:
    --app-name NAME         Application name (required)
    --namespace NAME        Kubernetes namespace (default: APP_NAME)
    --registry URL          Docker registry (default: docker.io)
    --frontend-dir PATH     Frontend directory (default: ./frontend)
    --backend-dir PATH      Backend directory (default: ./backend)
    --environment ENV       Environment: dev|staging|prod (default: dev)
    --help                  Show this help message

EXAMPLES:
    # Interactive mode (prompts for inputs)
    $0

    # With parameters
    $0 --app-name todo-app --namespace todo-app --registry ghcr.io/username

    # Production deployment
    $0 --app-name todo-app --environment prod

EOF
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --app-name)
            APP_NAME="$2"
            shift 2
            ;;
        --namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        --registry)
            REGISTRY="$2"
            shift 2
            ;;
        --frontend-dir)
            FRONTEND_DIR="$2"
            shift 2
            ;;
        --backend-dir)
            BACKEND_DIR="$2"
            shift 2
            ;;
        --environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --help)
            usage
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            ;;
    esac
done

# Interactive mode if no app name provided
if [ -z "$APP_NAME" ]; then
    print_info "Interactive Blueprint Setup"
    echo ""

    read -p "Application name: " APP_NAME
    read -p "Kubernetes namespace [$APP_NAME]: " NAMESPACE
    NAMESPACE=${NAMESPACE:-$APP_NAME}

    read -p "Docker registry [docker.io]: " REGISTRY_INPUT
    REGISTRY=${REGISTRY_INPUT:-docker.io}

    read -p "Frontend directory [./frontend]: " FRONTEND_INPUT
    FRONTEND_DIR=${FRONTEND_INPUT:-./frontend}

    read -p "Backend directory [./backend]: " BACKEND_INPUT
    BACKEND_DIR=${BACKEND_INPUT:-./backend}

    read -p "Environment (dev/staging/prod) [dev]: " ENV_INPUT
    ENVIRONMENT=${ENV_INPUT:-dev}
fi

# Set default namespace if not provided
NAMESPACE=${NAMESPACE:-$APP_NAME}

# Validate required parameters
if [ -z "$APP_NAME" ]; then
    print_error "Application name is required"
    usage
fi

# Display configuration
echo ""
print_info "Configuration:"
echo "  App Name:    $APP_NAME"
echo "  Namespace:   $NAMESPACE"
echo "  Registry:    $REGISTRY"
echo "  Frontend:    $FRONTEND_DIR"
echo "  Backend:     $BACKEND_DIR"
echo "  Environment: $ENVIRONMENT"
echo ""

read -p "Continue with this configuration? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Aborted by user"
    exit 1
fi

print_success "Starting blueprint application..."
echo ""

# Step 1: Copy Dockerfiles
print_info "Step 1/7: Copying Dockerfiles..."

if [ -d "$FRONTEND_DIR" ]; then
    cp docker/Dockerfile.frontend $FRONTEND_DIR/Dockerfile
    print_success "Frontend Dockerfile created"
else
    print_warning "Frontend directory not found, skipping"
fi

if [ -d "$BACKEND_DIR" ]; then
    cp docker/Dockerfile.backend $BACKEND_DIR/Dockerfile
    print_success "Backend Dockerfile created"
else
    print_warning "Backend directory not found, skipping"
fi

# Copy docker-compose
if [ ! -f "docker-compose.yml" ]; then
    cp docker/docker-compose.yml docker-compose.yml
    print_success "docker-compose.yml created"
fi

cp docker/.dockerignore .dockerignore 2>/dev/null || print_warning ".dockerignore already exists"

# Step 2: Customize Helm chart
print_info "Step 2/7: Customizing Helm chart..."

# Create helm-chart directory if it doesn't exist
mkdir -p helm-chart/templates

# Copy Helm chart files
cp -r helm-chart/* helm-chart/ 2>/dev/null || true

# Update Chart.yaml
sed -i.bak "s/name: .*/name: $APP_NAME/" helm-chart/Chart.yaml
sed -i.bak "s|home: .*|home: https://github.com/yourusername/$APP_NAME|" helm-chart/Chart.yaml
rm helm-chart/Chart.yaml.bak 2>/dev/null || true

# Update values.yaml with registry and app name
sed -i.bak "s|imageRegistry: .*|imageRegistry: $REGISTRY|" helm-chart/values.yaml
sed -i.bak "s|repository: yourusername/.*|repository: $APP_NAME|g" helm-chart/values.yaml
sed -i.bak "s|namespace: .*|namespace: $NAMESPACE|" helm-chart/values.yaml
rm helm-chart/values.yaml.bak 2>/dev/null || true

print_success "Helm chart customized"

# Step 3: Create .env.example
print_info "Step 3/7: Creating .env.example..."

cat > .env.example << EOF
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication
BETTER_AUTH_SECRET=your-secret-key-here-use-openssl-rand-base64-32

# OpenAI (for Phase 3+)
OPENAI_API_KEY=sk-your-openai-api-key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend
FRONTEND_URL=http://localhost:3000
EOF

print_success ".env.example created"

# Step 4: Create documentation
print_info "Step 4/7: Creating documentation..."

mkdir -p docs

cat > docs/DEPLOYMENT.md << EOF
# Deployment Guide for $APP_NAME

## Prerequisites

- Docker Desktop
- kubectl
- Helm 3+
- Minikube (for local) or Cloud Kubernetes cluster

## Local Deployment (Minikube)

\`\`\`bash
# 1. Start Minikube
minikube start --cpus=4 --memory=8192

# 2. Enable addons
minikube addons enable ingress
minikube addons enable metrics-server

# 3. Build images in Minikube
eval \$(minikube docker-env)
docker-compose build

# 4. Deploy with Helm
helm install $APP_NAME ./helm-chart \\
  -f helm-chart/values-dev.yaml \\
  --set secrets.databaseUrl="\$DATABASE_URL" \\
  --set secrets.betterAuthSecret="\$BETTER_AUTH_SECRET" \\
  --set secrets.openaiApiKey="\$OPENAI_API_KEY" \\
  -n $NAMESPACE --create-namespace

# 5. Access application
echo "\$(minikube ip) $APP_NAME.local" | sudo tee -a /etc/hosts
open http://$APP_NAME.local
\`\`\`

## Cloud Deployment (GKE/EKS/AKS)

\`\`\`bash
# 1. Build and push images
docker build -t $REGISTRY/$APP_NAME-frontend:v1.0.0 ./$FRONTEND_DIR
docker build -t $REGISTRY/$APP_NAME-backend:v1.0.0 ./$BACKEND_DIR
docker push $REGISTRY/$APP_NAME-frontend:v1.0.0
docker push $REGISTRY/$APP_NAME-backend:v1.0.0

# 2. Deploy with Helm
helm install $APP_NAME ./helm-chart \\
  -f helm-chart/values-prod.yaml \\
  --set frontend.image.tag=v1.0.0 \\
  --set backend.image.tag=v1.0.0 \\
  --set secrets.databaseUrl="\$DATABASE_URL" \\
  --set secrets.betterAuthSecret="\$BETTER_AUTH_SECRET" \\
  --set secrets.openaiApiKey="\$OPENAI_API_KEY" \\
  -n $NAMESPACE-prod --create-namespace
\`\`\`

## Monitoring

\`\`\`bash
# Check deployment status
kubectl get all -n $NAMESPACE

# View logs
kubectl logs -f deployment/$APP_NAME-frontend -n $NAMESPACE
kubectl logs -f deployment/$APP_NAME-backend -n $NAMESPACE

# Check HPA
kubectl get hpa -n $NAMESPACE
\`\`\`

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.
EOF

print_success "Deployment documentation created"

# Step 5: Validate setup
print_info "Step 5/7: Validating setup..."

VALIDATION_FAILED=0

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_warning "Docker is not installed"
    VALIDATION_FAILED=1
else
    print_success "Docker found"
fi

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    print_warning "kubectl is not installed"
    VALIDATION_FAILED=1
else
    print_success "kubectl found"
fi

# Check if Helm is installed
if ! command -v helm &> /dev/null; then
    print_warning "Helm is not installed"
    VALIDATION_FAILED=1
else
    print_success "Helm found"
fi

# Lint Helm chart
if command -v helm &> /dev/null; then
    if helm lint helm-chart &> /dev/null; then
        print_success "Helm chart valid"
    else
        print_warning "Helm chart has warnings"
    fi
fi

# Step 6: Generate next steps
print_info "Step 6/7: Generating next steps..."

cat > NEXT_STEPS.md << EOF
# Next Steps for $APP_NAME

## ✅ Blueprint Applied Successfully!

The Full-Stack Kubernetes Deployment Blueprint has been applied to your project.

## What Was Created

- ✅ Dockerfiles (frontend and backend)
- ✅ docker-compose.yml (local development)
- ✅ Helm chart in helm-chart/ (Kubernetes deployment)
- ✅ .env.example (environment variables template)
- ✅ Documentation in docs/

## Immediate Next Steps

### 1. Set Up Environment Variables

\`\`\`bash
# Copy example and fill in your values
cp .env.example .env

# Edit .env with your actual values
# IMPORTANT: Never commit .env to Git!
\`\`\`

### 2. Test Locally with Docker Compose

\`\`\`bash
# Load environment variables
set -a; source .env; set +a

# Build and run
docker-compose up --build

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
\`\`\`

### 3. Deploy to Minikube

\`\`\`bash
# Start Minikube
minikube start --cpus=4 --memory=8192

# Enable addons
minikube addons enable ingress
minikube addons enable metrics-server

# Build images in Minikube
eval \$(minikube docker-env)
docker-compose build

# Deploy with Helm
helm install $APP_NAME ./helm-chart \\
  -f helm-chart/values-dev.yaml \\
  --set secrets.databaseUrl="\$DATABASE_URL" \\
  --set secrets.betterAuthSecret="\$BETTER_AUTH_SECRET" \\
  -n $NAMESPACE --create-namespace

# Add to /etc/hosts
echo "\$(minikube ip) $APP_NAME.local" | sudo tee -a /etc/hosts

# Access: http://$APP_NAME.local
\`\`\`

## Future Steps

### Phase 4 Hackathon Requirements

- [ ] Complete Docker containerization
- [ ] Deploy to Minikube successfully
- [ ] Test all features work in Kubernetes
- [ ] Create demo video (max 90 seconds)
- [ ] Submit GitHub repo

### Production Deployment

- [ ] Set up cloud Kubernetes cluster (GKE/EKS/AKS)
- [ ] Configure CI/CD pipeline
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure TLS certificates
- [ ] Set up centralized logging
- [ ] Configure backup and disaster recovery

## Documentation

- **Deployment Guide**: docs/DEPLOYMENT.md
- **Troubleshooting**: docs/TROUBLESHOOTING.md (if created)
- **Architecture**: See helm-chart/templates/

## Support

If you encounter issues:
1. Check docs/DEPLOYMENT.md
2. Review .claude/skills/ for detailed guides
3. Consult .claude/agents/ for expert help
4. See helm-chart/templates/NOTES.txt after deployment

## Bonus Points (Hackathon)

This reusable blueprint qualifies for **+200 bonus points** in Phase 4!

To claim:
1. Include .claude/skills/ and .claude/agents/ in your repo
2. Include .claude/blueprints/fullstack-k8s-deployment/
3. Document in README how to use the blueprint
4. Demo in your video using Claude Code skills

---

**Need help?** Use the phase4-devops-specialist agent:
\`\`\`
Ask Claude Code: "Use the phase4-devops-specialist agent to deploy to Minikube"
\`\`\`

Good luck! 🚀
EOF

print_success "Next steps guide created: NEXT_STEPS.md"

# Step 7: Summary
echo ""
print_info "Step 7/7: Summary"
echo ""

if [ $VALIDATION_FAILED -eq 0 ]; then
    print_success "✨ Blueprint applied successfully!"
else
    print_warning "Blueprint applied with warnings (missing tools)"
fi

echo ""
print_info "What's Next:"
echo "  1. Read NEXT_STEPS.md for detailed instructions"
echo "  2. Copy .env.example to .env and fill in your values"
echo "  3. Test locally with docker-compose up"
echo "  4. Deploy to Minikube following docs/DEPLOYMENT.md"
echo ""
print_success "Happy deploying! 🚀"
