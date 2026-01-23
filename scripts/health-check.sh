#!/bin/bash

# React ADK-WEB Health Check Script
# Used by Docker health checks to verify application health

# Exit immediately if any command fails
set -e

# Health check function
check_health() {
    # Check if nginx is running
    if ! pgrep -x "nginx" > /dev/null; then
        echo "NGINX is not running"
        exit 1
    fi

    # Check if required files exist
    if [ ! -f "/usr/share/nginx/html/index.html" ]; then
        echo "Index file not found"
        exit 1
    fi

    # Check memory usage
    MEMORY_USAGE=$(free -m | awk '/Mem:/ {printf("%.1f", $3/$2 * 100)}')
    if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
        echo "High memory usage: ${MEMORY_USAGE}%"
        exit 1
    fi

    # Check disk space
    DISK_USAGE=$(df -h / | awk '/\// {print $(NF-1)}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 90 ]; then
        echo "High disk usage: ${DISK_USAGE}%"
        exit 1
    fi

    # Check if port is listening
    if ! netstat -tuln | grep ":3000" > /dev/null; then
        echo "Port 3000 is not listening"
        exit 1
    fi

    echo "Health check passed: All systems operational"
    exit 0
}

# Run health check
check_health