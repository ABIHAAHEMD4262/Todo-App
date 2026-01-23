"""
Dapr Client Integration - Phase 5.6
Pub/Sub, State Management, and Bindings via Dapr sidecar
"""

import os
import json
import httpx
from typing import Optional, Any

DAPR_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_URL = f"http://localhost:{DAPR_PORT}"
DAPR_ENABLED = os.getenv("DAPR_ENABLED", "false").lower() == "true"

PUBSUB_NAME = "todo-pubsub"
STATE_STORE = "todo-statestore"


class DaprClient:
    """Lightweight Dapr HTTP client for sidecar communication"""

    def __init__(self):
        self._base_url = DAPR_URL
        self._enabled = DAPR_ENABLED

    async def publish_event(self, topic: str, data: dict):
        """Publish event via Dapr Pub/Sub"""
        if not self._enabled:
            print(f"[Dapr] Event (local): {topic} -> {json.dumps(data)[:100]}")
            return

        async with httpx.AsyncClient() as client:
            url = f"{self._base_url}/v1.0/publish/{PUBSUB_NAME}/{topic}"
            await client.post(url, json=data)

    async def save_state(self, key: str, value: Any):
        """Save state via Dapr State Store"""
        if not self._enabled:
            return

        async with httpx.AsyncClient() as client:
            url = f"{self._base_url}/v1.0/state/{STATE_STORE}"
            await client.post(url, json=[{"key": key, "value": value}])

    async def get_state(self, key: str) -> Optional[Any]:
        """Get state from Dapr State Store"""
        if not self._enabled:
            return None

        async with httpx.AsyncClient() as client:
            url = f"{self._base_url}/v1.0/state/{STATE_STORE}/{key}"
            response = await client.get(url)
            if response.status_code == 200:
                return response.json()
            return None

    async def invoke_service(self, app_id: str, method: str, data: dict = None):
        """Invoke another service via Dapr service invocation"""
        if not self._enabled:
            return None

        async with httpx.AsyncClient() as client:
            url = f"{self._base_url}/v1.0/invoke/{app_id}/method/{method}"
            if data:
                response = await client.post(url, json=data)
            else:
                response = await client.get(url)
            return response.json() if response.status_code == 200 else None


# Singleton
dapr_client = DaprClient()
