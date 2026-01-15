# Helm Charts Skill

## Description
Expert knowledge for creating production-ready Helm charts for deploying applications to Kubernetes. Covers chart structure, templating, values files, dependencies, and release management based on latest Helm documentation (2025).

## Capabilities
- Generate complete Helm chart directory structure
- Create Chart.yaml with proper metadata and dependencies
- Generate values.yaml with sensible defaults
- Create Kubernetes resource templates with Helm templating
- Implement template helpers and functions
- Configure multiple values files (dev, staging, prod)
- Manage chart dependencies
- Implement Helm hooks for lifecycle management
- Version and package charts

## Usage

This skill is invoked when:
- User asks to "create Helm charts"
- User requests "package the application for Kubernetes"
- User wants to "deploy with Helm"
- Implementation requires Helm-based deployment for Phase 4

## Knowledge Base

### Helm Chart Directory Structure

```
helm-chart/
├── Chart.yaml                    # Chart metadata
├── values.yaml                   # Default values
├── values-dev.yaml               # Development overrides
├── values-staging.yaml           # Staging overrides
├── values-prod.yaml              # Production overrides
├── charts/                       # Chart dependencies (optional)
├── templates/                    # Kubernetes manifest templates
│   ├── NOTES.txt                # Post-install instructions
│   ├── _helpers.tpl             # Template helpers
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── deployment-frontend.yaml
│   ├── deployment-backend.yaml
│   ├── service-frontend.yaml
│   ├── service-backend.yaml
│   ├── ingress.yaml
│   ├── hpa-frontend.yaml
│   └── hpa-backend.yaml
└── .helmignore                  # Files to ignore
```

### Chart.yaml (Latest Format)

```yaml
apiVersion: v2
name: todo-app
description: AI-powered Todo application with chatbot interface
type: application
version: 1.0.0
appVersion: "1.0.0"

keywords:
  - todo
  - ai
  - chatbot
  - fastapi
  - nextjs
  - fullstack

home: https://github.com/yourusername/todo-app
sources:
  - https://github.com/yourusername/todo-app

maintainers:
  - name: Your Name
    email: your@email.com
    url: https://github.com/yourusername

icon: https://raw.githubusercontent.com/yourusername/todo-app/main/icon.png

# Kubernetes version compatibility
kubeVersion: ">=1.25.0-0"

# Dependencies (if any)
dependencies: []
#  - name: postgresql
#    version: "12.1.0"
#    repository: "https://charts.bitnami.com/bitnami"
#    condition: postgresql.enabled

annotations:
  category: Application
  licenses: MIT
```

### values.yaml (Complete Example)

```yaml
# Global settings
global:
  namespace: todo-app
  imagePullPolicy: IfNotPresent
  storageClass: standard

# Image registry
imageRegistry: docker.io
imageTag: v1.0.0

# Frontend configuration
frontend:
  enabled: true
  name: frontend
  replicaCount: 2

  image:
    repository: yourusername/todo-frontend
    tag: "" # defaults to global.imageTag
    pullPolicy: "" # defaults to global.imagePullPolicy

  service:
    type: ClusterIP
    port: 3000
    targetPort: 3000
    annotations: {}

  resources:
    requests:
      memory: "256Mi"
      cpu: "250m"
    limits:
      memory: "512Mi"
      cpu: "500m"

  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 80

  # Health checks
  livenessProbe:
    httpGet:
      path: /api/health
      port: 3000
    initialDelaySeconds: 30
    periodSeconds: 10
    timeoutSeconds: 5
    failureThreshold: 3

  readinessProbe:
    httpGet:
      path: /api/health
      port: 3000
    initialDelaySeconds: 10
    periodSeconds: 5
    timeoutSeconds: 3
    failureThreshold: 3

  startupProbe:
    httpGet:
      path: /api/health
      port: 3000
    initialDelaySeconds: 0
    periodSeconds: 10
    timeoutSeconds: 3
    failureThreshold: 30

  # Security context
  securityContext:
    runAsNonRoot: true
    runAsUser: 1001
    fsGroup: 1001
    capabilities:
      drop:
        - ALL

  # Pod anti-affinity
  affinity:
    enabled: true

# Backend configuration
backend:
  enabled: true
  name: backend
  replicaCount: 2

  image:
    repository: yourusername/todo-backend
    tag: ""
    pullPolicy: ""

  service:
    type: ClusterIP
    port: 8000
    targetPort: 8000
    annotations: {}

  resources:
    requests:
      memory: "512Mi"
      cpu: "500m"
    limits:
      memory: "1Gi"
      cpu: "1000m"

  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 20
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 80

  livenessProbe:
    httpGet:
      path: /health
      port: 8000
    initialDelaySeconds: 30
    periodSeconds: 10
    timeoutSeconds: 5
    failureThreshold: 3

  readinessProbe:
    httpGet:
      path: /health
      port: 8000
    initialDelaySeconds: 10
    periodSeconds: 5
    timeoutSeconds: 3
    failureThreshold: 3

  startupProbe:
    httpGet:
      path: /health
      port: 8000
    initialDelaySeconds: 0
    periodSeconds: 10
    timeoutSeconds: 3
    failureThreshold: 30

  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 1000
    capabilities:
      drop:
        - ALL

  affinity:
    enabled: true

# Ingress configuration
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: letsencrypt-prod

  hosts:
    - host: todo.example.com
      paths:
        - path: /api
          pathType: Prefix
          backend: backend
        - path: /
          pathType: Prefix
          backend: frontend

  tls:
    - secretName: todo-tls-cert
      hosts:
        - todo.example.com

# ConfigMap (non-sensitive configuration)
config:
  logLevel: info
  environment: production
  frontendUrl: "http://todo-frontend:3000"
  apiUrl: "http://todo-backend:8000"

# Secrets (should be provided via --set or external secrets)
secrets:
  # WARNING: Do not commit real secrets to values.yaml
  # Use --set flags or external secret management
  databaseUrl: ""
  betterAuthSecret: ""
  openaiApiKey: ""

# Pod Disruption Budget
podDisruptionBudget:
  enabled: true
  minAvailable: 1

# Service Account
serviceAccount:
  create: true
  annotations: {}
  name: "todo-app-sa"

# Network Policy
networkPolicy:
  enabled: false
  policyTypes:
    - Ingress
    - Egress
```

### values-dev.yaml (Development Overrides)

```yaml
global:
  namespace: todo-app-dev

imageTag: latest

frontend:
  replicaCount: 1
  autoscaling:
    enabled: false
  resources:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "250m"

backend:
  replicaCount: 1
  autoscaling:
    enabled: false
  resources:
    requests:
      memory: "256Mi"
      cpu: "200m"
    limits:
      memory: "512Mi"
      cpu: "500m"

ingress:
  hosts:
    - host: todo-dev.local
      paths:
        - path: /api
          pathType: Prefix
          backend: backend
        - path: /
          pathType: Prefix
          backend: frontend
  tls: []

config:
  environment: development
  logLevel: debug
```

### values-prod.yaml (Production Overrides)

```yaml
global:
  namespace: todo-app-prod

imageTag: v1.0.0

frontend:
  replicaCount: 3
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 20

backend:
  replicaCount: 3
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 50

podDisruptionBudget:
  enabled: true
  minAvailable: 2

config:
  environment: production
  logLevel: warn
```

### _helpers.tpl (Template Helpers)

```yaml
{{/*
Expand the name of the chart.
*/}}
{{- define "todo-app.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "todo-app.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "todo-app.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "todo-app.labels" -}}
helm.sh/chart: {{ include "todo-app.chart" . }}
{{ include "todo-app.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "todo-app.selectorLabels" -}}
app.kubernetes.io/name: {{ include "todo-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Frontend labels
*/}}
{{- define "todo-app.frontend.labels" -}}
{{ include "todo-app.labels" . }}
app.kubernetes.io/component: frontend
{{- end }}

{{/*
Backend labels
*/}}
{{- define "todo-app.backend.labels" -}}
{{ include "todo-app.labels" . }}
app.kubernetes.io/component: backend
{{- end }}

{{/*
Get image tag
*/}}
{{- define "todo-app.imageTag" -}}
{{- .Values.imageTag | default .Chart.AppVersion }}
{{- end }}

{{/*
Get image pull policy
*/}}
{{- define "todo-app.imagePullPolicy" -}}
{{- .Values.global.imagePullPolicy | default "IfNotPresent" }}
{{- end }}
```

### deployment-frontend.yaml (Using Templates)

```yaml
{{- if .Values.frontend.enabled }}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "todo-app.fullname" . }}-{{ .Values.frontend.name }}
  namespace: {{ .Values.global.namespace }}
  labels:
    {{- include "todo-app.frontend.labels" . | nindent 4 }}
spec:
  {{- if not .Values.frontend.autoscaling.enabled }}
  replicas: {{ .Values.frontend.replicaCount }}
  {{- end }}
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: {{ .Values.frontend.name }}
      {{- include "todo-app.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        app: {{ .Values.frontend.name }}
        {{- include "todo-app.frontend.labels" . | nindent 8 }}
    spec:
      serviceAccountName: {{ .Values.serviceAccount.name }}
      securityContext:
        runAsNonRoot: {{ .Values.frontend.securityContext.runAsNonRoot }}
        runAsUser: {{ .Values.frontend.securityContext.runAsUser }}
        fsGroup: {{ .Values.frontend.securityContext.fsGroup }}

      containers:
      - name: {{ .Values.frontend.name }}
        image: "{{ .Values.imageRegistry }}/{{ .Values.frontend.image.repository }}:{{ .Values.frontend.image.tag | default (include "todo-app.imageTag" .) }}"
        imagePullPolicy: {{ .Values.frontend.image.pullPolicy | default (include "todo-app.imagePullPolicy" .) }}

        ports:
        - name: http
          containerPort: {{ .Values.frontend.service.targetPort }}
          protocol: TCP

        env:
        - name: NODE_ENV
          value: {{ .Values.config.environment | quote }}
        - name: NEXT_PUBLIC_API_URL
          value: {{ .Values.config.apiUrl | quote }}
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: {{ include "todo-app.fullname" . }}-secrets
              key: database-url
        - name: BETTER_AUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: {{ include "todo-app.fullname" . }}-secrets
              key: better-auth-secret

        resources:
          {{- toYaml .Values.frontend.resources | nindent 10 }}

        {{- with .Values.frontend.livenessProbe }}
        livenessProbe:
          {{- toYaml . | nindent 10 }}
        {{- end }}

        {{- with .Values.frontend.readinessProbe }}
        readinessProbe:
          {{- toYaml . | nindent 10 }}
        {{- end }}

        {{- with .Values.frontend.startupProbe }}
        startupProbe:
          {{- toYaml . | nindent 10 }}
        {{- end }}

        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: false
          capabilities:
            {{- toYaml .Values.frontend.securityContext.capabilities | nindent 12 }}

      {{- if .Values.frontend.affinity.enabled }}
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - {{ .Values.frontend.name }}
              topologyKey: kubernetes.io/hostname
      {{- end }}
{{- end }}
```

### ingress.yaml (Using Templates)

```yaml
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "todo-app.fullname" . }}-ingress
  namespace: {{ .Values.global.namespace }}
  labels:
    {{- include "todo-app.labels" . | nindent 4 }}
  {{- with .Values.ingress.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  ingressClassName: {{ .Values.ingress.className }}
  {{- if .Values.ingress.tls }}
  tls:
    {{- range .Values.ingress.tls }}
    - hosts:
        {{- range .hosts }}
        - {{ . | quote }}
        {{- end }}
      secretName: {{ .secretName }}
    {{- end }}
  {{- end }}
  rules:
    {{- range .Values.ingress.hosts }}
    - host: {{ .host | quote }}
      http:
        paths:
          {{- range .paths }}
          - path: {{ .path }}
            pathType: {{ .pathType }}
            backend:
              service:
                name: {{ include "todo-app.fullname" $ }}-{{ .backend }}
                port:
                  number: {{ if eq .backend "frontend" }}{{ $.Values.frontend.service.port }}{{ else }}{{ $.Values.backend.service.port }}{{ end }}
          {{- end }}
    {{- end }}
{{- end }}
```

### secret.yaml (Using Templates)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: {{ include "todo-app.fullname" . }}-secrets
  namespace: {{ .Values.global.namespace }}
  labels:
    {{- include "todo-app.labels" . | nindent 4 }}
type: Opaque
stringData:
  database-url: {{ .Values.secrets.databaseUrl | quote }}
  better-auth-secret: {{ .Values.secrets.betterAuthSecret | quote }}
  openai-api-key: {{ .Values.secrets.openaiApiKey | quote }}
```

### NOTES.txt (Post-Install Instructions)

```
Thank you for installing {{ .Chart.Name }}!

Your release is named {{ .Release.Name }}.

To get the application URL:

{{- if .Values.ingress.enabled }}
  {{- range .Values.ingress.hosts }}
  http{{ if $.Values.ingress.tls }}s{{ end }}://{{ .host }}
  {{- end }}
{{- else if contains "LoadBalancer" .Values.frontend.service.type }}
  NOTE: It may take a few minutes for the LoadBalancer IP to be available.
        Watch the status with: kubectl get svc --namespace {{ .Values.global.namespace }} -w {{ include "todo-app.fullname" . }}-frontend

  export SERVICE_IP=$(kubectl get svc --namespace {{ .Values.global.namespace }} {{ include "todo-app.fullname" . }}-frontend --template "{{"{{ range (index .status.loadBalancer.ingress 0) }}{{.}}{{ end }}"}}")
  echo http://$SERVICE_IP:{{ .Values.frontend.service.port }}
{{- else }}
  export POD_NAME=$(kubectl get pods --namespace {{ .Values.global.namespace }} -l "app={{ .Values.frontend.name }}" -o jsonpath="{.items[0].metadata.name}")
  echo "Visit http://127.0.0.1:3000 to use your application"
  kubectl --namespace {{ .Values.global.namespace }} port-forward $POD_NAME 3000:3000
{{- end }}

To view the status of your deployment:
  kubectl get all -n {{ .Values.global.namespace }}

To view logs:
  kubectl logs -f deployment/{{ include "todo-app.fullname" . }}-frontend -n {{ .Values.global.namespace }}
  kubectl logs -f deployment/{{ include "todo-app.fullname" . }}-backend -n {{ .Values.global.namespace }}
```

## Helm Commands for Phase 4

```bash
# Create new chart (if starting from scratch)
helm create todo-app

# Lint chart (validate)
helm lint ./helm-chart

# Template rendering (dry-run)
helm template todo-app ./helm-chart
helm template todo-app ./helm-chart -f values-dev.yaml

# Install chart
helm install todo-app ./helm-chart -n todo-app --create-namespace
helm install todo-app ./helm-chart -f values-dev.yaml -n todo-app-dev --create-namespace

# Install with secrets from command line (recommended)
helm install todo-app ./helm-chart \
  --set secrets.databaseUrl="postgresql://..." \
  --set secrets.betterAuthSecret="..." \
  --set secrets.openaiApiKey="sk-..." \
  -n todo-app --create-namespace

# Upgrade release
helm upgrade todo-app ./helm-chart -f values-prod.yaml -n todo-app

# Rollback release
helm rollback todo-app 1 -n todo-app

# List releases
helm list -n todo-app
helm list --all-namespaces

# Get release values
helm get values todo-app -n todo-app

# Get release manifest
helm get manifest todo-app -n todo-app

# Uninstall release
helm uninstall todo-app -n todo-app

# Package chart
helm package ./helm-chart

# Dependency management
helm dependency update ./helm-chart
helm dependency build ./helm-chart
```

## Best Practices from Latest Helm Documentation (2025)

### Templating
- ✅ Use `{{ include "chart.name" . }}` for reusable templates
- ✅ Use `{{- ... }}` to trim whitespace
- ✅ Use `| nindent` for proper YAML indentation
- ✅ Use `| quote` for string values
- ✅ Use `| default` for default values
- ✅ Create helper templates in `_helpers.tpl`

### Values
- ✅ Provide sensible defaults in `values.yaml`
- ✅ Never commit secrets to `values.yaml`
- ✅ Use multiple values files for environments
- ✅ Document all values with comments
- ✅ Use consistent naming conventions

### Chart Structure
- ✅ Use semantic versioning for chart versions
- ✅ Include comprehensive `Chart.yaml` metadata
- ✅ Create informative `NOTES.txt`
- ✅ Use `.helmignore` to exclude unnecessary files
- ✅ Test charts with `helm lint` and `helm template`

### Security
- ✅ Never hardcode secrets in templates
- ✅ Use `--set` flags or external secrets for sensitive data
- ✅ Implement RBAC with service accounts
- ✅ Set security contexts in templates
- ✅ Use sealed-secrets or external-secrets operator

## Validation Checklist

- [ ] Chart.yaml has proper metadata
- [ ] values.yaml has all configuration options
- [ ] Multiple values files for environments (dev, prod)
- [ ] _helpers.tpl has reusable templates
- [ ] All templates use Helm functions
- [ ] Resource limits defined
- [ ] Health checks configured
- [ ] Secrets externalized (not hardcoded)
- [ ] NOTES.txt provides instructions
- [ ] Chart passes `helm lint`
- [ ] Templates render correctly (`helm template`)
- [ ] Service account created
- [ ] Ingress configured

## Related Skills
- `docker-containerization` - For container images
- `k8s-deployment` - For Kubernetes concepts
- `minikube-local-k8s` - For local testing
- `cloud-native-patterns` - For best practices

## References
- [Helm Official Documentation](https://helm.sh/docs/)
- [Helm Best Practices](https://helm.sh/docs/chart_best_practices/)
- [Chart Template Guide](https://helm.sh/docs/chart_template_guide/)
- [Values Files](https://helm.sh/docs/chart_template_guide/values_files/)
