"""
Kafka Event Producer - Phase 5.5
Publishes task lifecycle events to Kafka topics
"""

import json
import os
from datetime import datetime
from typing import Optional

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "localhost:9092")
KAFKA_ENABLED = os.getenv("KAFKA_ENABLED", "false").lower() == "true"

# Event Topics
TOPIC_TASK_CREATED = "todo.task.created"
TOPIC_TASK_UPDATED = "todo.task.updated"
TOPIC_TASK_COMPLETED = "todo.task.completed"
TOPIC_TASK_DELETED = "todo.task.deleted"
TOPIC_TAG_CREATED = "todo.tag.created"
TOPIC_REMINDER_DUE = "todo.reminder.due"


class EventProducer:
    """Kafka event producer for task lifecycle events"""

    def __init__(self):
        self._producer = None

    async def connect(self):
        """Initialize Kafka producer connection"""
        if not KAFKA_ENABLED:
            return

        try:
            from aiokafka import AIOKafkaProducer
            self._producer = AIOKafkaProducer(
                bootstrap_servers=KAFKA_BROKER,
                value_serializer=lambda v: json.dumps(v).encode("utf-8")
            )
            await self._producer.start()
            print(f"[Kafka] Producer connected to {KAFKA_BROKER}")
        except Exception as e:
            print(f"[Kafka] Producer connection failed: {e}")
            self._producer = None

    async def disconnect(self):
        """Close Kafka producer"""
        if self._producer:
            await self._producer.stop()

    async def publish(self, topic: str, event: dict):
        """Publish event to Kafka topic"""
        if not self._producer:
            # Log event locally when Kafka is disabled
            print(f"[Event] {topic}: {json.dumps(event)[:200]}")
            return

        try:
            await self._producer.send_and_wait(topic, event)
        except Exception as e:
            print(f"[Kafka] Publish error on {topic}: {e}")

    async def task_created(self, user_id: str, task_id: int, title: str, priority: str):
        await self.publish(TOPIC_TASK_CREATED, {
            "event": "task.created",
            "user_id": user_id,
            "task_id": task_id,
            "title": title,
            "priority": priority,
            "timestamp": datetime.utcnow().isoformat()
        })

    async def task_updated(self, user_id: str, task_id: int, changes: dict):
        await self.publish(TOPIC_TASK_UPDATED, {
            "event": "task.updated",
            "user_id": user_id,
            "task_id": task_id,
            "changes": changes,
            "timestamp": datetime.utcnow().isoformat()
        })

    async def task_completed(self, user_id: str, task_id: int, title: str, is_recurring: bool):
        await self.publish(TOPIC_TASK_COMPLETED, {
            "event": "task.completed",
            "user_id": user_id,
            "task_id": task_id,
            "title": title,
            "is_recurring": is_recurring,
            "timestamp": datetime.utcnow().isoformat()
        })

    async def task_deleted(self, user_id: str, task_id: int):
        await self.publish(TOPIC_TASK_DELETED, {
            "event": "task.deleted",
            "user_id": user_id,
            "task_id": task_id,
            "timestamp": datetime.utcnow().isoformat()
        })

    async def reminder_due(self, user_id: str, task_id: int, title: str, minutes_before: int):
        await self.publish(TOPIC_REMINDER_DUE, {
            "event": "reminder.due",
            "user_id": user_id,
            "task_id": task_id,
            "title": title,
            "minutes_before": minutes_before,
            "timestamp": datetime.utcnow().isoformat()
        })


# Singleton instance
event_producer = EventProducer()
