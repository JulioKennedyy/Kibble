"""Small dependency-free production safeguards for the public API."""

from __future__ import annotations

from collections import defaultdict, deque
from threading import Lock
from time import monotonic

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse, Response


class RequestBodyLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_bytes: int) -> None:
        super().__init__(app)
        self.max_bytes = max_bytes

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                is_too_large = int(content_length) > self.max_bytes
            except ValueError:
                is_too_large = True
            if is_too_large:
                return JSONResponse(
                    status_code=413,
                    content={"detail": "O texto enviado é grande demais para esta estimativa."},
                )
        return await call_next(request)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Per-instance, per-IP limiter suitable for Kibble's single free instance."""

    def __init__(self, app, requests_per_minute: int) -> None:
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self._requests: dict[str, deque[float]] = defaultdict(deque)
        self._lock = Lock()
        self._last_cleanup = monotonic()

    @staticmethod
    def _client_ip(request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for", "")
        if forwarded:
            return forwarded.split(",", maxsplit=1)[0].strip()
        return request.client.host if request.client else "unknown"

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if request.method != "POST" or request.url.path != "/api/estimate":
            return await call_next(request)

        now = monotonic()
        client_ip = self._client_ip(request)
        with self._lock:
            if now - self._last_cleanup >= 300:
                stale_clients = [
                    ip for ip, timestamps in self._requests.items()
                    if not timestamps or now - timestamps[-1] >= 60
                ]
                for ip in stale_clients:
                    del self._requests[ip]
                self._last_cleanup = now

            recent = self._requests[client_ip]
            while recent and now - recent[0] >= 60:
                recent.popleft()
            if len(recent) >= self.requests_per_minute:
                return JSONResponse(
                    status_code=429,
                    headers={"Retry-After": "60"},
                    content={
                        "detail": "Muitas estimativas em pouco tempo. Aguarde um minuto e tente novamente."
                    },
                )
            recent.append(now)

        return await call_next(request)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response
