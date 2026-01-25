# Monitoring Stack

Prometheus + Grafana monitoring for Todo App.

## Quick Start

```bash
# Deploy monitoring stack
kubectl apply -f k8s/monitoring/

# Access endpoints (Docker Desktop)
# Prometheus: http://localhost:30090
# Grafana: http://localhost:30030 (admin/admin)
```

## Components

### Prometheus (Port 30090)
- Scrapes metrics from backend and frontend pods
- 7-day retention
- Auto-discovery via Kubernetes labels

### Grafana (Port 30030)
- Pre-configured Prometheus datasource
- Todo App Dashboard included
- Default credentials: admin/admin

## Dashboard Panels

1. **Backend Status** - Up/Down indicator
2. **Frontend Status** - Up/Down indicator
3. **Request Rate** - HTTP requests per second (5m average)
4. **Response Time P95** - 95th percentile latency
5. **Memory Usage** - Backend memory consumption

## Adding Custom Metrics

To expose metrics from the backend, add prometheus-client:

```python
# backend/app/main.py
from prometheus_client import Counter, Histogram, generate_latest
from fastapi.responses import PlainTextResponse

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'HTTP request latency')

@app.get("/metrics")
async def metrics():
    return PlainTextResponse(generate_latest())
```

## Cleanup

```bash
kubectl delete -f k8s/monitoring/
```
