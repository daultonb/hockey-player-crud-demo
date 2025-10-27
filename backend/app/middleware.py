"""
Custom middleware for the FastAPI application.

This module contains middleware for:
- Performance monitoring and timing of API requests
- Request/response logging
"""

import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from app.performance import PerformanceMonitor


class PerformanceMiddleware(BaseHTTPMiddleware):
    """
    Middleware to track and log performance metrics for all API requests.

    Automatically logs:
    - Request start time
    - Request method and path
    - Response status code
    - Total request duration

    Only active when DEBUG_MODE=true in .env
    """

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process the request and measure its duration."""
        if not PerformanceMonitor.enabled:
            return await call_next(request)

        # Start timing
        start_time = time.time()
        request_id = id(request)  # Unique ID for this request

        # Log request start
        method = request.method
        path = request.url.path
        query = str(request.url.query) if request.url.query else ""
        full_path = f"{path}?{query}" if query else path

        PerformanceMonitor.log(f"[{request_id}] {method} {full_path} - REQUEST START")

        # Process the request
        response = await call_next(request)

        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000

        # Log request completion
        status = response.status_code
        status_emoji = "✅" if 200 <= status < 300 else "⚠️" if 400 <= status < 500 else "❌"
        PerformanceMonitor.log(
            f"[{request_id}] {method} {path} - {status_emoji} {status}",
            duration_ms
        )

        # Add performance header to response
        response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"

        return response
