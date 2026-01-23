#!/bin/bash

# ADK-WEB React Application Rollback Script
# Script for rolling back deployments

set -euo pipefail

# Configuration
NAMESPACE="adk-web-production"
DEPLOYMENT_NAME="adk-web"
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
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed. Please install kubectl and try again."
        exit 1
    fi
    
    if [ ! -f "$KUBE_CONFIG" ]; then
        log_error "Kubeconfig file not found at $KUBE_CONFIG"
        exit 1
    fi
    
    log_success "All prerequisites are met."
}

# Get current deployment status
get_deployment_status() {
    log_info "Getting current deployment status..."
    
    kubectl get deployment "$DEPLOYMENT_NAME" -n "$NAMESPACE" -o json | jq '{
        name: .metadata.name,
        namespace: .metadata.namespace,
        replicas: .spec.replicas,
        availableReplicas: .status.availableReplicas,
        readyReplicas: .status.readyReplicas,
        updatedReplicas: .status.updatedReplicas,
        conditions: .status.conditions
    }'
}

# Rollback deployment
rollback_deployment() {
    local revision="$1"
    
    log_info "Rolling back deployment to revision $revision..."
    
    if [ -z "$revision" ]; then
        # Rollback to previous revision
        kubectl rollout undo deployment/"$DEPLOYMENT_NAME" -n "$NAMESPACE"
    else
        # Rollback to specific revision
        kubectl rollout undo deployment/"$DEPLOYMENT_NAME" -n "$NAMESPACE" --to-revision="$revision"
    fi
    
    # Wait for rollout to complete
    kubectl rollout status deployment/"$DEPLOYMENT_NAME" -n "$NAMESPACE" --timeout=5m
    
    log_success "Successfully rolled back deployment to revision $revision."
}

# Get deployment history
get_deployment_history() {
    log_info "Getting deployment history..."
    
    kubectl rollout history deployment/"$DEPLOYMENT_NAME" -n "$NAMESPACE"
}

# Verify rollback
verify_rollback() {
    log_info "Verifying rollback..."
    
    # Check if deployment is healthy
    local pods=$(kubectl get pods -n "$NAMESPACE" -l app="$DEPLOYMENT_NAME" --field-selector=status.phase=Running --no-headers | wc -l)
    
    if [ "$pods" -lt 4 ]; then
        log_error "Rollback verification failed. Expected at least 4 running pods, found $pods."
        exit 1
    fi
    
    # Check application health
    local health_url="https://adk-web.production/health"
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$health_url")
    
    if [ "$response" -ne 200 ]; then
        log_error "Rollback health check failed with status: $response"
        exit 1
    fi
    
    log_success "Rollback verified successfully."
}

# Main rollback function
rollback() {
    local revision="$1"
    
    log_info "Starting rollback process..."
    
    # Check prerequisites
    check_prerequisites
    
    # Show current status
    get_deployment_status
    
    # Show deployment history
    get_deployment_history
    
    # Perform rollback
    rollback_deployment "$revision"
    
    # Verify rollback
    verify_rollback
    
    log_success "Rollback completed successfully!"
}

# Parse command line arguments
if [ "$#" -gt 1 ]; then
    echo "Usage: $0 [revision]"
    echo "Example: $0 5"
    echo "If no revision is specified, rolls back to the previous revision."
    exit 1
fi

REVISION="${1:-}"

# Execute rollback
rollback "$REVISION"