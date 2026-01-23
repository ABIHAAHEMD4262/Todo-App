
# Phase 5: Advanced Cloud Deployment - Technical Plan

**Referencing**: @specs/phase5-advanced-cloud/spec.md

---

## 1. Scope and Dependencies

### In Scope
- Advanced task features (due dates, priorities, recurring, tags, search, filter, sort)
- Event-driven architecture with Kafka
- Dapr integration for distributed runtime
- Cloud Kubernetes deployment (Oracle OKE / Google GKE / Azure AKS)
- CI/CD pipeline with GitHub Actions
- Monitoring with Prometheus + Grafana

### Out of Scope
- Mobile app
- Offline support
- Multi-tenancy
- Real-time WebSocket notifications (future enhancement)

### External Dependencies

| Dependency | Purpose | Owner |
|------------|---------|-------|
| Neon PostgreSQL | Primary database | Existing |
| OpenAI API | Chatbot intelligence | Existing |
| Kafka (Redpanda/Strimzi) | Event streaming | New |
| Dapr | Distributed runtime | New |
| Cloud K8s (OKE/GKE/AKS) | Production deployment | New |
| GitHub Actions | CI/CD | New |

---

## 2. Architecture Overview

### Current Architecture (Phase 3)
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Frontend   │────▶│  Backend    │────▶│  Neon DB    │
│  (Next.js)  │     │  (FastAPI)  │     │ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
```

### Target Architecture (Phase 5)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         KUBERNETES CLUSTER                                     │
│                                                                               │
│  ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────────────────┐ │
│  │  Frontend Pod   │   │  Backend Pod    │   │      KAFKA CLUSTER          │ │
│  │ ┌─────┐ ┌─────┐ │   │ ┌─────┐ ┌─────┐ │   │  ┌───────────────────────┐  │ │
│  │ │Next │ │Dapr │ │   │ │Fast │ │Dapr │ │   │  │ Topics:               │  │ │
│  │ │ JS  │◀┼▶Side│ │   │ │ API │◀┼▶Side│ │   │  │ - task-events         │  │ │
│  │ └─────┘ └─────┘ │   │ └─────┘ └─────┘ │   │  │ - reminders           │  │ │
│  └────────┬────────┘   └────────┬────────┘   │  │ - task-updates        │  │ │
│           │                     │            │  └───────────────────────┘  │ │
│           │                     │            └─────────────┬───────────────┘ │
│           │                     │                          │                 │
│           │                     ▼                          ▼                 │
│           │              ┌─────────────┐          ┌─────────────────┐       │
│           │              │  Neon DB    │          │ Notification    │       │
│           │              │ (External)  │          │ Service Pod     │       │
│           │              └─────────────┘          └─────────────────┘       │
│           │                                                                  │
│           └──────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                         DAPR COMPONENTS                                  │ │
│  │  pubsub.kafka │ state.postgresql │ bindings.cron │ secretstores.k8s    │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Decisions and Rationale

### Decision 1: Kafka vs RabbitMQ vs Redis Pub/Sub

| Option | Pros | Cons |
|--------|------|------|
| **Kafka (Chosen)** | Durable, scalable, replay capability | More complex |
| RabbitMQ | Simpler, flexible routing | Less scalable |
| Redis Pub/Sub | Fast, simple | No persistence |

**Rationale**: Kafka provides durability and replay capability needed for audit trails and event sourcing patterns.

### Decision 2: Dapr vs Direct Kafka Client

| Option | Pros | Cons |
|--------|------|------|
| **Dapr (Chosen)** | Abstraction, portable, built-in features | Learning curve |
| Direct Client | Full control, no extra dependency | Vendor lock-in |

**Rationale**: Dapr abstracts infrastructure, allowing easy swap of Kafka for other pub/sub systems without code changes.

### Decision 3: Cloud Provider

| Option | Free Tier | Pros | Cons |
|--------|-----------|------|------|
| **Oracle OKE (Recommended)** | Always Free | No expiry, 4 OCPUs | Smaller ecosystem |
| Google GKE | $300/90 days | Best K8s experience | Credits expire |
| Azure AKS | $200/30 days | Good integration | Credits expire quickly |

**Rationale**: Oracle OKE provides always-free tier, best for learning without time pressure.

### Decision 4: Database Schema Evolution

**Approach**: Add new columns to existing `tasks` table + new `tags` and `task_tags` tables.

**Rationale**:
- Minimal migration risk
- Backward compatible
- No data loss

---

## 4. Database Design

### Schema Changes

#### Modified Table: `tasks`
```sql
-- New columns for Phase 5
ALTER TABLE tasks ADD COLUMN due_date TIMESTAMP NULL;
ALTER TABLE tasks ADD COLUMN reminder_minutes INTEGER NULL;
ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'none';
ALTER TABLE tasks ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN recurrence_pattern VARCHAR(50) NULL;
ALTER TABLE tasks ADD COLUMN recurrence_interval INTEGER NULL;
ALTER TABLE tasks ADD COLUMN recurrence_end_date TIMESTAMP NULL;
ALTER TABLE tasks ADD COLUMN parent_task_id INTEGER NULL REFERENCES tasks(id);

-- Indexes
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);
```

#### New Table: `tags`
```sql
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) DEFAULT '#808080',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE INDEX idx_tags_user_id ON tags(user_id);
```

#### New Table: `task_tags` (Junction)
```sql
CREATE TABLE task_tags (
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);
```

#### New Table: `reminders`
```sql
CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    remind_at TIMESTAMP NOT NULL,
    sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reminders_remind_at ON reminders(remind_at);
CREATE INDEX idx_reminders_sent ON reminders(sent);
```

---

## 5. API Design

### New/Updated Endpoints

#### Tasks (Enhanced)
| Method | Endpoint | Changes |
|--------|----------|---------|
| GET | `/api/{user_id}/tasks` | Add filters: priority, tags, due_from, due_to, search, sort |
| POST | `/api/{user_id}/tasks` | Add fields: due_date, priority, is_recurring, tag_ids |
| PUT | `/api/{user_id}/tasks/{id}` | Add fields: due_date, priority, is_recurring, tag_ids |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Trigger recurring task creation |

#### Tags (New)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{user_id}/tags` | List user's tags |
| POST | `/api/{user_id}/tags` | Create tag |
| PUT | `/api/{user_id}/tags/{id}` | Update tag |
| DELETE | `/api/{user_id}/tags/{id}` | Delete tag |

#### Search (New)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{user_id}/tasks/search?q=keyword` | Search tasks |

---

## 6. Event-Driven Architecture

### Kafka Topics

| Topic | Events | Producer | Consumers |
|-------|--------|----------|-----------|
| `task-events` | created, updated, completed, deleted | Backend API | Audit Service, Recurring Task Service |
| `reminders` | reminder.scheduled, reminder.due | Backend API | Notification Service |

### Event Schemas

**TaskEvent**
```json
{
  "event_id": "uuid",
  "event_type": "task.created|task.updated|task.completed|task.deleted",
  "timestamp": "2026-01-22T10:00:00Z",
  "user_id": "user123",
  "task_id": 123,
  "data": {
    "title": "Task title",
    "priority": "high",
    "due_date": "2026-01-25T14:00:00Z"
  }
}
```

**ReminderEvent**
```json
{
  "event_id": "uuid",
  "event_type": "reminder.due",
  "timestamp": "2026-01-22T13:00:00Z",
  "user_id": "user123",
  "task_id": 123,
  "data": {
    "title": "Task title",
    "due_at": "2026-01-22T14:00:00Z"
  }
}
```

---

## 7. Dapr Integration

### Components

#### 1. Pub/Sub (Kafka)
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "kafka:9092"
    - name: consumerGroup
      value: "todo-app"
```

#### 2. State Store (PostgreSQL)
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.postgresql
  version: v1
  metadata:
    - name: connectionString
      secretKeyRef:
        name: db-secrets
        key: connection-string
```

#### 3. Cron Binding (Reminder Check)
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: reminder-cron
spec:
  type: bindings.cron
  version: v1
  metadata:
    - name: schedule
      value: "*/5 * * * *"  # Every 5 minutes
```

---

## 8. CI/CD Pipeline

### GitHub Actions Workflow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Push   │───▶│  Test   │───▶│  Build  │───▶│  Push   │───▶│ Deploy  │
│ to main │    │  Suite  │    │ Images  │    │Registry │    │  to K8s │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
```

### Stages

1. **Test**: Run pytest, lint, type check
2. **Build**: Build Docker images for frontend/backend
3. **Push**: Push to container registry (GHCR/DockerHub)
4. **Deploy**: Apply Kubernetes manifests to cluster

---

## 9. Deployment Strategy

### Phase 5A: Local Testing (Minikube)
1. Deploy Kafka using Strimzi
2. Deploy Dapr
3. Deploy application with Dapr sidecars
4. Test event flow

### Phase 5B: Cloud Deployment (OKE/GKE/AKS)
1. Create cloud K8s cluster
2. Install Dapr
3. Deploy Kafka (managed or self-hosted)
4. Deploy application
5. Configure ingress/load balancer
6. Set up monitoring

---

## 10. Monitoring Stack

### Components
- **Prometheus**: Metrics collection
- **Grafana**: Dashboards
- **Loki** (optional): Log aggregation

### Key Metrics
- Request latency (p50, p95, p99)
- Error rate
- Pod resource usage
- Kafka lag
- Database connection pool

---

## 11. Risk Analysis

| Risk | Impact | Mitigation |
|------|--------|------------|
| Kafka complexity | High | Start with simple topics, use Dapr abstraction |
| Cloud costs | Medium | Use free tiers, set up billing alerts |
| Migration issues | High | Test migrations on staging first |
| Dapr learning curve | Medium | Follow official tutorials, start simple |

---

## 12. Implementation Phases

### Phase 5.1: Advanced Features (Backend)
- Database schema updates
- API endpoints for new features
- MCP tools updates

### Phase 5.2: Advanced Features (Frontend)
- UI for due dates, priorities
- Tag management UI
- Search and filter UI

### Phase 5.3: Kafka Integration
- Set up Kafka (local first)
- Implement event publishing
- Create notification service

### Phase 5.4: Dapr Integration
- Install Dapr
- Configure components
- Migrate to Dapr APIs

### Phase 5.5: Cloud Deployment
- Set up cloud K8s
- CI/CD pipeline
- Monitoring

---

## 13. Success Criteria

- [ ] All advanced features working (due dates, priorities, recurring, tags, search)
- [ ] Events published to Kafka for all task operations
- [ ] Dapr sidecars running with Pub/Sub
- [ ] Deployed to cloud Kubernetes
- [ ] CI/CD pipeline auto-deploys on push
- [ ] Monitoring dashboard operational
- [ ] Demo video under 90 seconds

---

**Created**: 2026-01-22
**Status**: Ready for Tasks Breakdown
**Next Step**: Create tasks.md with actionable implementation tasks
