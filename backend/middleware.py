"""
Rate limiting middleware
Proteção contra abuse
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse

limiter = Limiter(key_func=get_remote_address)

def rate_limit_error_handler(request, exc: RateLimitExceeded):
    """
    Handler customizado para erros de rate limit
    """
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Rate limit exceeded. Try again later.",
            "retry_after": request.headers.get("retry-after", "60")
        }
    )
