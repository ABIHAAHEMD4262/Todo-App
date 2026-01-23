# Phase 5: Advanced Cloud Deployment - Tasks

**Referencing**:
- @specs/phase5-advanced-cloud/spec.md
- @specs/phase5-advanced-cloud/plan.md

---

## Phase 5.1: Database Schema Updates

### Task 5.1.1: Update Task Model
**Description**: Add Phase 5 fields to the Task model
**Files**: `backend/app/models.py`
**Changes**:
- Add `due_date: Optional[datetime]`
- Add `reminder_minutes: Optional[int]`
- Add `priority: str` (default: "none")
- Add `is_recurring: bool` (default: False)
- Add `recurrence_pattern: Optional[str]`
- Add `recurrence_interval: Optional[int]`
- Add `recurrence_end_date: Optional[datetime]`
- Add `parent_task_id: Optional[int]`

**Test Cases**:
- [ ] Task can be created with due_date
- [ ] Task can be created with priority
- [ ] Task can be created with recurrence settings
- [ ] Parent-child relationship works for recurring tasks

---

### Task 5.1.2: Create Tag Model
**Description**: Add Tag model for task categorization
**Files**: `backend/app/models.py`
**Changes**:
- Create `Tag` model with id, user_id, name, color, created_at
- Add unique constraint on (user_id, name)

**Test Cases**:
- [ ] Tag can be created
- [ ] Duplicate tag name for same user is rejected
- [ ] Different users can have same tag name

---

### Task 5.1.3: Create TaskTag Junction Model
**Description**: Add many-to-many relationship between Task and Tag
**Files**: `backend/app/models.py`
**Changes**:
- Create `TaskTag` model with task_id, tag_id
- Add relationships to Task and Tag models

**Test Cases**:
- [ ] Task can have multiple tags
- [ ] Tag can be assigned to multiple tasks
- [ ] Deleting task removes task_tags
- [ ] Deleting tag removes task_tags

---

### Task 5.1.4: Create Reminder Model
**Description**: Add Reminder model for notifications
**Files**: `backend/app/models.py`
**Changes**:
- Create `Reminder` model with id, user_id, task_id, remind_at, sent, created_at

**Test Cases**:
- [ ] Reminder can be created
- [ ] Reminder is deleted when task is deleted

---

### Task 5.1.5: Create Database Migration
**Description**: Create Alembic migration for schema changes
**Files**: `backend/migrations/versions/`
**Commands**:
```bash
cd backend
alembic revision --autogenerate -m "Phase 5 schema updates"
alembic upgrade head
```

**Test Cases**:
- [ ] Migration runs without errors
- [ ] Existing data is preserved
- [ ] New columns have correct defaults
- [ ] Rollback works correctly

---

## Phase 5.2: Update Pydantic Schemas

### Task 5.2.1: Update Task Schemas
**Description**: Add Phase 5 fields to request/response schemas
**Files**: `backend/app/schemas.py`
**Changes**:
- Add Priority enum
- Add RecurrencePattern enum
- Update TaskCreate with new fields
- Update TaskUpdate with new fields
- Update TaskResponse with new fields + tags

**Test Cases**:
- [ ] TaskCreate accepts due_date, priority, recurrence fields
- [ ] TaskResponse includes all Phase 5 fields
- [ ] Validation works for all new fields

---

### Task 5.2.2: Create Tag Schemas
**Description**: Add schemas for tag operations
**Files**: `backend/app/schemas.py`
**Changes**:
- Create TagCreate schema
- Create TagUpdate schema
- Create TagResponse schema
- Create TagListResponse schema

**Test Cases**:
- [ ] TagCreate validates name length
- [ ] TagCreate validates color format (#RRGGBB)

---

### Task 5.2.3: Create Search/Filter Schemas
**Description**: Add schemas for search and filter parameters
**Files**: `backend/app/schemas.py`
**Changes**:
- Create TaskSearchParams schema

**Test Cases**:
- [ ] Search params validate correctly
- [ ] Sort options validate correctly

---

## Phase 5.3: Update Backend API

### Task 5.3.1: Update Task List Endpoint
**Description**: Add filtering, sorting, and search to list endpoint
**Files**: `backend/app/routes/tasks.py`
**Changes**:
- Add query params: priority, tag_ids, due_from, due_to, search, sort_by, sort_order
- Implement filtering logic
- Implement search logic
- Implement sorting logic

**Test Cases**:
- [ ] Filter by status works
- [ ] Filter by priority works
- [ ] Filter by tags works
- [ ] Filter by due date range works
- [ ] Search by keyword works
- [ ] Sort by different fields works
- [ ] Combined filters work

---

### Task 5.3.2: Update Task Create Endpoint
**Description**: Support new fields in task creation
**Files**: `backend/app/routes/tasks.py`
**Changes**:
- Accept due_date, priority, recurrence fields
- Accept tag_ids array
- Create TaskTag records
- Create Reminder record if applicable

**Test Cases**:
- [ ] Task created with due_date
- [ ] Task created with priority
- [ ] Task created with tags
- [ ] Task created with recurrence settings
- [ ] Reminder created when due_date and reminder_minutes set

---

### Task 5.3.3: Update Task Update Endpoint
**Description**: Support updating new fields
**Files**: `backend/app/routes/tasks.py`
**Changes**:
- Accept updates to all Phase 5 fields
- Update tag assignments
- Update reminder if due_date changes

**Test Cases**:
- [ ] Due date can be updated
- [ ] Priority can be updated
- [ ] Tags can be updated
- [ ] Reminder updated when due_date changes

---

### Task 5.3.4: Update Toggle Complete Endpoint
**Description**: Create next recurring task when completing
**Files**: `backend/app/routes/tasks.py`
**Changes**:
- Check if task is recurring when marking complete
- Create next occurrence with correct due_date
- Copy tags to new task

**Test Cases**:
- [ ] Completing recurring task creates next occurrence
- [ ] Next task has correct due_date based on pattern
- [ ] Tags are copied to next task
- [ ] No new task created if past recurrence_end_date

---

### Task 5.3.5: Create Tags Router
**Description**: Add CRUD endpoints for tags
**Files**: `backend/app/routes/tags.py` (new)
**Endpoints**:
- GET `/api/{user_id}/tags` - List tags
- POST `/api/{user_id}/tags` - Create tag
- PUT `/api/{user_id}/tags/{tag_id}` - Update tag
- DELETE `/api/{user_id}/tags/{tag_id}` - Delete tag

**Test Cases**:
- [ ] List tags returns user's tags only
- [ ] Create tag works
- [ ] Duplicate tag name rejected
- [ ] Update tag works
- [ ] Delete tag removes from tasks

---

### Task 5.3.6: Add Search Endpoint
**Description**: Add dedicated search endpoint
**Files**: `backend/app/routes/tasks.py`
**Endpoint**: GET `/api/{user_id}/tasks/search?q=keyword`

**Test Cases**:
- [ ] Search finds matches in title
- [ ] Search finds matches in description
- [ ] Search is case-insensitive
- [ ] Empty search returns error

---

### Task 5.3.7: Register New Routes
**Description**: Register tags router in main app
**Files**: `backend/app/main.py`
**Changes**:
- Import tags router
- Include router with prefix

**Test Cases**:
- [ ] Tags endpoints accessible
- [ ] Swagger docs show new endpoints

---

## Phase 5.4: Update Frontend

### Task 5.4.1: Update Task Types
**Description**: Add Phase 5 fields to TypeScript types
**Files**: `frontend/types/task.ts`
**Changes**:
- Add due_date, priority, recurrence fields
- Add Tag type
- Update Task interface

---

### Task 5.4.2: Update Task Form
**Description**: Add UI for new task fields
**Files**: `frontend/components/tasks/task-form.tsx`
**Changes**:
- Add due date picker
- Add priority selector
- Add tag selector
- Add recurrence options

**Test Cases**:
- [ ] Due date can be selected
- [ ] Priority can be selected
- [ ] Tags can be assigned
- [ ] Recurrence can be configured

---

### Task 5.4.3: Update Task List
**Description**: Add filtering and sorting UI
**Files**: `frontend/components/tasks/task-list.tsx`
**Changes**:
- Add filter dropdowns (status, priority, tags)
- Add date range filter
- Add search input
- Add sort options

**Test Cases**:
- [ ] Filters update task list
- [ ] Search filters in real-time
- [ ] Sort changes order

---

### Task 5.4.4: Update Task Item
**Description**: Display new fields in task item
**Files**: `frontend/components/tasks/task-item.tsx`
**Changes**:
- Display due date with overdue indicator
- Display priority badge
- Display tags
- Display recurring icon

---

### Task 5.4.5: Create Tag Management Page
**Description**: Add page to manage tags
**Files**: `frontend/app/tags/page.tsx` (new)
**Changes**:
- List user's tags
- Create new tag
- Edit tag color/name
- Delete tag

---

### Task 5.4.6: Update API Client
**Description**: Add API methods for new endpoints
**Files**: `frontend/lib/api.ts`
**Changes**:
- Add filter params to getTasks
- Add tag CRUD methods
- Add search method

---

## Phase 5.5: Kafka Integration

### Task 5.5.1: Set Up Kafka Locally
**Description**: Install Kafka for local development
**Files**: `docker-compose.yml`
**Changes**:
- Add Kafka service (using Redpanda)
- Add Kafka UI for debugging

**Test Cases**:
- [ ] Kafka starts with docker-compose
- [ ] Topics can be created
- [ ] Messages can be published

---

### Task 5.5.2: Create Event Publisher
**Description**: Add Kafka event publishing
**Files**: `backend/app/events/publisher.py` (new)
**Changes**:
- Create KafkaPublisher class
- Methods: publish_task_event, publish_reminder_event

**Test Cases**:
- [ ] Events published to correct topic
- [ ] Event schema is correct
- [ ] Publish failure is handled gracefully

---

### Task 5.5.3: Publish Task Events
**Description**: Publish events on task operations
**Files**: `backend/app/routes/tasks.py`
**Changes**:
- Publish event on create
- Publish event on update
- Publish event on complete
- Publish event on delete

**Test Cases**:
- [ ] Create task publishes task.created
- [ ] Update task publishes task.updated
- [ ] Complete task publishes task.completed
- [ ] Delete task publishes task.deleted

---

### Task 5.5.4: Create Notification Service
**Description**: Create service to consume reminder events
**Files**: `backend/app/services/notification_service.py` (new)
**Changes**:
- Consume from reminders topic
- Send notification (log for now, email/push later)

**Test Cases**:
- [ ] Service consumes events
- [ ] Notification is triggered

---

## Phase 5.6: Dapr Integration

### Task 5.6.1: Install Dapr Locally
**Description**: Set up Dapr for local development
**Commands**:
```bash
dapr init
```

**Test Cases**:
- [ ] Dapr CLI installed
- [ ] Dapr initialized

---

### Task 5.6.2: Create Dapr Components
**Description**: Configure Dapr components
**Files**: `dapr/components/`
**Components**:
- pubsub.yaml (Kafka)
- statestore.yaml (PostgreSQL)
- cron-binding.yaml (Reminder check)

**Test Cases**:
- [ ] Pub/Sub works
- [ ] State store works
- [ ] Cron binding triggers

---

### Task 5.6.3: Migrate to Dapr Pub/Sub
**Description**: Use Dapr SDK instead of direct Kafka
**Files**: `backend/app/events/publisher.py`
**Changes**:
- Replace kafka-python with Dapr SDK
- Publish via Dapr HTTP API

**Test Cases**:
- [ ] Events still published correctly
- [ ] Subscribers receive events

---

## Phase 5.7: Cloud Deployment

### Task 5.7.1: Set Up Cloud Kubernetes
**Description**: Create K8s cluster on OKE/GKE/AKS
**Steps**:
1. Create cloud account
2. Create Kubernetes cluster
3. Configure kubectl
4. Install Dapr

**Test Cases**:
- [ ] kubectl connects to cluster
- [ ] Dapr installed on cluster

---

### Task 5.7.2: Create Container Registry
**Description**: Set up container registry for images
**Options**:
- GitHub Container Registry (GHCR)
- Docker Hub
- Cloud provider registry

**Test Cases**:
- [ ] Images can be pushed
- [ ] Images can be pulled by K8s

---

### Task 5.7.3: Update Kubernetes Manifests
**Description**: Update manifests for cloud deployment
**Files**: `k8s/*.yaml`
**Changes**:
- Update image references
- Add Dapr annotations
- Configure resource limits
- Add cloud-specific settings

---

### Task 5.7.4: Create GitHub Actions Workflow
**Description**: Set up CI/CD pipeline
**Files**: `.github/workflows/deploy.yml`
**Stages**:
1. Test
2. Build images
3. Push to registry
4. Deploy to K8s

**Test Cases**:
- [ ] Workflow triggers on push
- [ ] Tests pass
- [ ] Images built and pushed
- [ ] Deployment successful

---

### Task 5.7.5: Deploy to Cloud
**Description**: Deploy application to cloud K8s
**Steps**:
1. Apply secrets
2. Deploy Kafka
3. Deploy Dapr components
4. Deploy application
5. Configure ingress

**Test Cases**:
- [ ] All pods running
- [ ] Application accessible
- [ ] Events flowing

---

### Task 5.7.6: Set Up Monitoring
**Description**: Configure Prometheus + Grafana
**Files**: `k8s/monitoring/`
**Changes**:
- Deploy Prometheus
- Deploy Grafana
- Create dashboards

**Test Cases**:
- [ ] Metrics collected
- [ ] Dashboards show data

---

## Phase 5.8: Documentation & Demo

### Task 5.8.1: Update README
**Description**: Document Phase 5 features
**Files**: `README.md`

---

### Task 5.8.2: Create Demo Video
**Description**: Record 90-second demo
**Content**:
1. Show new features (due dates, priorities, tags)
2. Show recurring task creation
3. Show search and filter
4. Show cloud deployment
5. Show monitoring dashboard

---

## Summary

| Phase | Tasks | Status |
|-------|-------|--------|
| 5.1 Database Schema | 5 tasks | Pending |
| 5.2 Pydantic Schemas | 3 tasks | Pending |
| 5.3 Backend API | 7 tasks | Pending |
| 5.4 Frontend | 6 tasks | Pending |
| 5.5 Kafka | 4 tasks | Pending |
| 5.6 Dapr | 3 tasks | Pending |
| 5.7 Cloud | 6 tasks | Pending |
| 5.8 Docs & Demo | 2 tasks | Pending |
| **TOTAL** | **36 tasks** | |

---

**Created**: 2026-01-22
**Status**: Ready for Implementation
**Next Step**: Start with Phase 5.1 (Database Schema Updates)
