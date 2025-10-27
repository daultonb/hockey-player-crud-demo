"""
Performance monitoring and logging utilities.

Centralized performance tracking that can be easily enabled/disabled via environment variables.
Use this to measure and log timing information for API requests and database queries.
"""

import time
from functools import wraps
from typing import Callable, Optional

from app.config import settings


class PerformanceMonitor:
    """
    Centralized performance monitoring for timing critical operations.

    Enable/disable via DEBUG_MODE in .env file.
    All logs include timestamps and duration in milliseconds.
    """

    enabled = settings.debug_mode

    @staticmethod
    def log(message: str, duration_ms: Optional[float] = None):
        """
        Log a performance message with optional duration.

        Args:
            message: The message to log
            duration_ms: Optional duration in milliseconds
        """
        if not PerformanceMonitor.enabled:
            return

        timestamp = time.strftime("%H:%M:%S")
        if duration_ms is not None:
            print(f"⏱️  [{timestamp}] {message} | {duration_ms:.2f}ms")
        else:
            print(f"⏱️  [{timestamp}] {message}")

    @staticmethod
    def timer(operation_name: str):
        """
        Decorator to time function execution.

        Usage:
            @PerformanceMonitor.timer("fetch_players")
            def get_players(...):
                ...

        Args:
            operation_name: Name of the operation being timed
        """
        def decorator(func: Callable) -> Callable:
            @wraps(func)
            def wrapper(*args, **kwargs):
                if not PerformanceMonitor.enabled:
                    return func(*args, **kwargs)

                start_time = time.time()
                PerformanceMonitor.log(f"{operation_name} - START")

                try:
                    result = func(*args, **kwargs)
                    return result
                finally:
                    duration_ms = (time.time() - start_time) * 1000
                    PerformanceMonitor.log(f"{operation_name} - COMPLETE", duration_ms)

            return wrapper
        return decorator

    @staticmethod
    def async_timer(operation_name: str):
        """
        Decorator to time async function execution.

        Usage:
            @PerformanceMonitor.async_timer("fetch_players_async")
            async def get_players(...):
                ...

        Args:
            operation_name: Name of the operation being timed
        """
        def decorator(func: Callable) -> Callable:
            @wraps(func)
            async def wrapper(*args, **kwargs):
                if not PerformanceMonitor.enabled:
                    return await func(*args, **kwargs)

                start_time = time.time()
                PerformanceMonitor.log(f"{operation_name} - START")

                try:
                    result = await func(*args, **kwargs)
                    return result
                finally:
                    duration_ms = (time.time() - start_time) * 1000
                    PerformanceMonitor.log(f"{operation_name} - COMPLETE", duration_ms)

            return wrapper
        return decorator


class RequestTimer:
    """
    Context manager for timing operations within a request.

    Usage:
        with RequestTimer("database_query") as timer:
            # ... do work ...
            timer.checkpoint("query_complete")
            # ... more work ...
    """

    def __init__(self, operation_name: str):
        self.operation_name = operation_name
        self.start_time: Optional[float] = None
        self.checkpoints: list[tuple[str, float]] = []

    def __enter__(self):
        if PerformanceMonitor.enabled:
            self.start_time = time.time()
            PerformanceMonitor.log(f"{self.operation_name} - START")
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if PerformanceMonitor.enabled and self.start_time:
            duration_ms = (time.time() - self.start_time) * 1000
            PerformanceMonitor.log(f"{self.operation_name} - COMPLETE", duration_ms)

            # Log any checkpoints
            if self.checkpoints:
                for checkpoint_name, checkpoint_time in self.checkpoints:
                    checkpoint_ms = (checkpoint_time - self.start_time) * 1000
                    PerformanceMonitor.log(f"  └─ {checkpoint_name}", checkpoint_ms)

    def checkpoint(self, name: str):
        """Record a checkpoint within the timed operation."""
        if PerformanceMonitor.enabled and self.start_time:
            self.checkpoints.append((name, time.time()))
