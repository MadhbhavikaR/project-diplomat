#!/bin/bash

# ADK-WEB React Application Deployment Script
# Main deployment script for production environment

set -euo pipefail

# Configuration
APP_NAME="adk-web"
NAMESPACE="adk-web-production"
DEPLOYMENT_NAME="adk-web"
CANARY_DEPLOYMENT_NAME="adk-web-canary"
DOCKER_IMAGE="your-registry.io/adk-web-react"
DOCKER_REGISTRY="your-registry.io"
KUBE_CONFIG="~/.kube/config"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed. Please install kubectl and try again."
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "docker is not installed. Please install docker and try again."
        exit 1
    fi
    
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        log_error "jq is not installed. Please install jq and try again."
        exit 1
    fi
    
    # Check if kubeconfig exists
    if [ ! -f "$KUBE_CONFIG" ]; then
        log_error "Kubeconfig file not found at $KUBE_CONFIG"
        exit 1
    fi
    
    log_success "All prerequisites are met."
}

# Login to Docker registry
docker_login() {
    log_info "Logging in to Docker registry..."
    
    if [ -z "${DOCKER_USERNAME:-}" ] || [ -z "${DOCKER_PASSWORD:-}" ]; then
        log_error "Docker credentials not provided. Set DOCKER_USERNAME and DOCKER_PASSWORD environment variables."
        exit 1
    fi
    
    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin "$DOCKER_REGISTRY"
    
    log_success "Successfully logged in to Docker registry."
}

# Build Docker image
build_docker_image() {
    local version="$1"
    local git_sha="$2"
    
    log_info "Building Docker image with version: $version, git SHA: $git_sha"
    
    docker build \
        --file Dockerfile.production \
        --tag "$DOCKER_IMAGE:$version" \
        --tag "$DOCKER_IMAGE:$git_sha" \
        --tag "$DOCKER_IMAGE:latest" \
        --build-arg NODE_ENV=production \
        --build-arg BUILD_NUMBER="$version" \
        --build-arg GIT_SHA="$git_sha" \
        .
    
    log_success "Successfully built Docker image: $DOCKER_IMAGE:$version"
}

# Push Docker image
push_docker_image() {
    local version="$1"
    local git_sha="$2"
    
    log_info "Pushing Docker images to registry..."
    
    docker push "$DOCKER_IMAGE:$version"
    docker push "$DOCKER_IMAGE:$git_sha"
    docker push "$DOCKER_IMAGE:latest"
    
    log_success "Successfully pushed Docker images to registry."
}

# Deploy to staging
deploy_to_staging() {
    log_info "Deploying to staging environment..."
    
    # Apply staging configuration
    kubectl apply -f kubernetes/staging/
    
    # Wait for deployment to complete
    kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE --timeout=5m
    
    # Verify deployment
    local pods=$(kubectl get pods -n $NAMESPACE -l app=$DEPLOYMENT_NAME --field-selector=status.phase=Running --no-headers | wc -l)
    if [ "$pods" -lt 2 ]; then
        log_error "Staging deployment failed. Expected at least 2 running pods, found $pods."
        exit 1
    fi
    
    log_success "Successfully deployed to staging environment."
}

# Run health checks
run_health_checks() {
    log_info "Running health checks..."
    
    # Check if health endpoint is accessible
    local health_url="https://staging.adk-web.production/health"
    local response
    
    for i in {1..10}; do
        response=$(curl -s -o /dev/null -w "%{http_code}" "$health_url")
        if [ "$response" -eq 200 ]; then
            log_success "Health check passed: Application is healthy"
            return 0
        fi
        log_warning "Health check attempt $i failed with status: $response. Retrying in 10 seconds..."
        sleep 10
    done
    
    log_error "Health check failed after 10 attempts."
    exit 1
}

# Deploy canary
deploy_canary() {
    log_info "Deploying canary release..."
    
    # Apply canary configuration
    kubectl apply -f kubernetes/canary/
    
    # Wait for canary deployment to complete
    kubectl rollout status deployment/$CANARY_DEPLOYMENT_NAME -n $NAMESPACE --timeout=5m
    
    # Verify canary deployment
    local pods=$(kubectl get pods -n $NAMESPACE -l app=$DEPLOYMENT_NAME,deployment=canary --field-selector=status.phase=Running --no-headers | wc -l)
    if [ "$pods" -lt 1 ]; then
        log_error "Canary deployment failed. Expected at least 1 running pod, found $pods."
        exit 1
    fi
    
    log_success "Successfully deployed canary release."
}

# Monitor canary
monitor_canary() {
    log_info "Monitoring canary release for 5 minutes..."
    
    # Simple monitoring - in production you would integrate with monitoring tools
    sleep 300
    
    # Check canary health
    local canary_url="https://adk-web.production/health"
    local response=$(curl -s -o /dev/null -w "%{http_code}" -H "X-Canary: enabled" "$canary_url")
    
    if [ "$response" -ne 200 ]; then
        log_error "Canary health check failed with status: $response"
        exit 1
    fi
    
    log_success "Canary monitoring completed successfully."
}

# Gradual rollout
gradual_rollout() {
    local target_percentage="$1"
    
    log_info "Performing gradual rollout to $target_percentage%..."
    
    # Update production deployment
    kubectl apply -f kubernetes/production/
    
    # Wait for rollout to complete
    kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE --timeout=10m
    
    # Verify production deployment
    local pods=$(kubectl get pods -n $NAMESPACE -l app=$DEPLOYMENT_NAME --field-selector=status.phase=Running --no-headers | wc -l)
    local expected_pods=$((target_percentage * 12 / 100))
    
    if [ "$pods" -lt "$expected_pods" ]; then
        log_error "Production deployment failed. Expected at least $expected_pods running pods, found $pods."
        exit 1
    fi
    
    log_success "Successfully completed rollout to $target_percentage%."
}

# Verify production deployment
verify_production() {
    log_info "Verifying production deployment..."
    
    # Check production health
    local production_url="https://adk-web.production/health"
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$production_url")
    
    if [ "$response" -ne 200 ]; then
        log_error "Production health check failed with status: $response"
        exit 1
    fi
    
    # Check if all pods are running
    local pods=$(kubectl get pods -n $NAMESPACE -l app=$DEPLOYMENT_NAME --field-selector=status.phase=Running --no-headers | wc -l)
    if [ "$pods" -lt 4 ]; then
        log_error "Production deployment verification failed. Expected at least 4 running pods, found $pods."
        exit 1
    fi
    
    log_success "Production deployment verified successfully."
}

# Rollback deployment
rollback_deployment() {
    log_info "Rolling back deployment..."
    
    kubectl rollout undo deployment/$DEPLOYMENT_NAME -n $NAMESPACE
    kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE --timeout=5m
    
    log_success "Successfully rolled back deployment."
}

# Main deployment function
deploy() {
    local version="$1"
    local git_sha="$2"
    local environment="$3"
    
    log_info "Starting deployment process for version $version (git SHA: $git_sha) to $environment environment"
    
    # Check prerequisites
    check_prerequisites
    
    # Docker operations
    docker_login
    build_docker_image "$version" "$git_sha"
    push_docker_image "$version" "$git_sha"
    
    # Environment-specific deployment
    case "$environment" in
        "staging")
            deploy_to_staging
            run_health_checks
            ;;
        "production")
            deploy_to_staging
            run_health_checks
            
            # Canary deployment
            deploy_canary
            monitor_canary
            
            # Gradual rollout
            gradual_rollout 25
            gradual_rollout 50
            gradual_rollout 75
            gradual_rollout 100
            
            # Verify production
            verify_production
            ;;
        *)
            log_error "Invalid environment: $environment. Use 'staging' or 'production'."
            exit 1
            ;;
    esac
    
    log_success "Deployment completed successfully!"
}

# Parse command line arguments
if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <version> <git_sha> [environment]"
    echo "Example: $0 1.0.0 abc123def production"
    echo "Environment options: staging (default), production"
    exit 1
fi

VERSION="$1"
GIT_SHA="$2"
ENVIRONMENT="${3:-staging}"

# Execute deployment
deploy "$VERSION" "$GIT_SHA" "$ENVIRONMENT"