#!/bin/bash

# ADK-WEB React Application Monitoring Script
# Script for monitoring application health and performance

set -euo pipefail

# Configuration
APP_NAME="adk-web"
NAMESPACE="adk-web-production"
HEALTH_URL="https://adk-web.production/health"
METRICS_URL="https://adk-web.production/metrics"
LOG_LEVEL="info"

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

# Check application health
check_health() {
    log_info "Checking application health..."
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")
    
    if [ "$response" -eq 200 ]; then
        log_success "Health check passed: Application is healthy"
        return 0
    else
        log_error "Health check failed with status: $response"
        return 1
    fi
}

# Get application metrics
get_metrics() {
    log_info "Getting application metrics..."
    
    local metrics=$(curl -s "$METRICS_URL")
    
    if [ -z "$metrics" ]; then
        log_error "Failed to retrieve metrics"
        return 1
    fi
    
    echo "Application Metrics:"
    echo "$metrics" | grep -E "(requests_total|response_time|error_rate|memory_usage|cpu_usage)" || echo "No metrics available"
    
    return 0
}

# Check Kubernetes pod status
check_pod_status() {
    log_info "Checking Kubernetes pod status..."
    
    local pods=$(kubectl get pods -n "$NAMESPACE" -l app="$APP_NAME" --no-headers)
    
    if [ -z "$pods" ]; then
        log_error "No pods found for application $APP_NAME"
        return 1
    fi
    
    echo "Pod Status:"
    echo "$pods"
    
    local running_pods=$(echo "$pods" | grep -c "Running")
    local total_pods=$(echo "$pods" | wc -l)
    
    if [ "$running_pods" -lt "$total_pods" ]; then
        log_warning "Only $running_pods out of $total_pods pods are running"
        return 1
    fi
    
    log_success "All $total_pods pods are running"
    return 0
}

# Check resource usage
check_resource_usage() {
    log_info "Checking resource usage..."
    
    local resources=$(kubectl top pods -n "$NAMESPACE" -l app="$APP_NAME" --no-headers)
    
    if [ -z "$resources" ]; then
        log_error "Failed to retrieve resource usage"
        return 1
    fi
    
    echo "Resource Usage:"
    echo "$resources"
    
    return 0
}

# Check application logs
check_logs() {
    local pod_name="$1"
    local lines="${2:-50}"
    
    log_info "Checking logs for pod $pod_name (last $lines lines)..."
    
    local logs=$(kubectl logs "$pod_name" -n "$NAMESPACE" --tail="$lines")
    
    if [ -z "$logs" ]; then
        log_error "Failed to retrieve logs for pod $pod_name"
        return 1
    fi
    
    echo "Logs for $pod_name:"
    echo "$logs"
    
    # Check for error patterns
    local error_count=$(echo "$logs" | grep -c -i "error\|exception\|fail\|crash" || true)
    
    if [ "$error_count" -gt 0 ]; then
        log_warning "Found $error_count potential error entries in logs"
        return 1
    fi
    
    log_success "No errors found in logs"
    return 0
}

# Monitor application
monitor() {
    local interval="${1:-60}"
    local duration="${2:-3600}"
    
    log_info "Starting monitoring for $duration seconds with $interval second intervals..."
    
    local end_time=$((SECONDS + duration))
    
    while [ $SECONDS -lt $end_time ]; do
        local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
        echo -e "\n${BLUE}=== Monitoring Cycle: $timestamp ===${NC}"
        
        # Run all checks
        check_health
        check_pod_status
        check_resource_usage
        get_metrics
        
        # Check logs for one pod
        local pod_name=$(kubectl get pods -n "$NAMESPACE" -l app="$APP_NAME" --no-headers | awk 'NR==1{print $1}')
        if [ -n "$pod_name" ]; then
            check_logs "$pod_name" 20
        fi
        
        # Wait for next interval
        if [ $SECONDS -lt $end_time ]; then
            sleep "$interval"
        fi
    done
    
    log_success "Monitoring completed"
}

# Main monitoring function
main() {
    local command="${1:-monitor}"
    
    case "$command" in
        "health")
            check_health
            ;;
        "metrics")
            get_metrics
            ;;
        "pods")
            check_pod_status
            ;;
        "resources")
            check_resource_usage
            ;;
        "logs")
            local pod_name="${2:-}"
            local lines="${3:-50}"
            if [ -z "$pod_name" ]; then
                echo "Usage: $0 logs <pod_name> [lines]"
                exit 1
            fi
            check_logs "$pod_name" "$lines"
            ;;
        "monitor")
            local interval="${2:-60}"
            local duration="${3:-3600}"
            monitor "$interval" "$duration"
            ;;
        *)
            echo "Usage: $0 [command]"
            echo "Commands:"
            echo "  health        - Check application health"
            echo "  metrics       - Get application metrics"
            echo "  pods          - Check Kubernetes pod status"
            echo "  resources     - Check resource usage"
            echo "  logs <pod> [lines] - Check application logs"
            echo "  monitor [interval] [duration] - Continuous monitoring"
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"