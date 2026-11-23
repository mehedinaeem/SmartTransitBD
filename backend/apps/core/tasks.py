from celery import shared_task


@shared_task
def worker_health():
    """Explicit worker diagnostic; no periodic jobs or ingestion are enabled."""
    return {"status": "ok", "stage": "foundation"}
