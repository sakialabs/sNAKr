"""
Celery application for background task processing.
"""
import os
from celery import Celery

# Get Redis URL from environment
REDIS_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")

# Create Celery app
app = Celery(
    "snakr",
    broker=REDIS_URL,
    backend=os.getenv("CELERY_RESULT_BACKEND", REDIS_URL),
    include=["tasks.receipt_processing", "tasks.inventory_updates"]
)

# Configure Celery
app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes
    task_soft_time_limit=240,  # 4 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Task routes
app.conf.task_routes = {
    "tasks.receipt_processing.*": {"queue": "receipts"},
    "tasks.inventory_updates.*": {"queue": "inventory"},
}

if __name__ == "__main__":
    app.start()
