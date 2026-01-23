"""
Kafka Event Consumer - Phase 5.5
Processes async events for notifications, analytics, and recurring tasks
"""

import json
import os
import asyncio
from typing import Callable, Dict

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "localhost:9092")
KAFKA_ENABLED = os.getenv("KAFKA_ENABLED", "false").lower() == "true"
CONSUMER_GROUP = "todo-app-consumers"


class EventConsumer:
    """Kafka event consumer for processing task events"""

    def __init__(self):
        self._consumer = None
        self._handlers: Dict[str, Callable] = {}
        self._running = False

    def register_handler(self, event_type: str, handler: Callable):
        """Register an event handler for a specific event type"""
        self._handlers[event_type] = handler

    async def connect(self, topics: list):
        """Initialize Kafka consumer"""
        if not KAFKA_ENABLED:
            return

        try:
            from aiokafka import AIOKafkaConsumer
            self._consumer = AIOKafkaConsumer(
                *topics,
                bootstrap_servers=KAFKA_BROKER,
                group_id=CONSUMER_GROUP,
                value_deserializer=lambda v: json.loads(v.decode("utf-8")),
                auto_offset_reset="earliest"
            )
            await self._consumer.start()
            print(f"[Kafka] Consumer connected, topics: {topics}")
        except Exception as e:
            print(f"[Kafka] Consumer connection failed: {e}")

    async def start_consuming(self):
        """Start consuming messages"""
        if not self._consumer:
            return

        self._running = True
        try:
            async for msg in self._consumer:
                if not self._running:
                    break

                event = msg.value
                event_type = event.get("event", "unknown")

                handler = self._handlers.get(event_type)
                if handler:
                    try:
                        await handler(event)
                    except Exception as e:
                        print(f"[Kafka] Handler error for {event_type}: {e}")
        except Exception as e:
            print(f"[Kafka] Consumer error: {e}")

    async def stop(self):
        """Stop consuming"""
        self._running = False
        if self._consumer:
            await self._consumer.stop()


# Event Handlers
async def handle_task_completed(event: dict):
    """Process task completion - analytics, notifications"""
    print(f"[Analytics] Task completed: {event.get('title')} by user {event.get('user_id')}")


async def handle_reminder_due(event: dict):
    """Process reminder notifications"""
    print(f"[Notification] Reminder: {event.get('title')} due in {event.get('minutes_before')}min")


# Singleton
event_consumer = EventConsumer()
event_consumer.register_handler("task.completed", handle_task_completed)
event_consumer.register_handler("reminder.due", handle_reminder_due)
