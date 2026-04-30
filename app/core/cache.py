import time
from typing import Any, Optional

class SimpleCache:
    """
    A simple in-memory cache to reduce API latency.
    Stores data with a TTL (Time To Live).
    """
    def __init__(self, default_ttl: int = 600):
        self._cache = {}
        self.default_ttl = default_ttl

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        expire_at = time.time() + (ttl or self.default_ttl)
        self._cache[key] = (value, expire_at)

    def get(self, key: str) -> Optional[Any]:
        if key not in self._cache:
            return None
        
        value, expire_at = self._cache[key]
        if time.time() > expire_at:
            del self._cache[key]
            return None
            
        return value

    def clear(self):
        self._cache.clear()

# Global cache instance
cache = SimpleCache()