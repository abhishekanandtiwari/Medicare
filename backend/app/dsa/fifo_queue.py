"""
FIFO Queue Implementation for Appointment Waiting Lists and Notification Buffers
Uses circular array / doubly-linked nodes with constant time O(1) operations.
"""
from typing import Any, List, Optional
from collections import deque

class FIFOQueue:
    def __init__(self, max_size: Optional[int] = None):
        self._items = deque(maxlen=max_size)

    def enqueue(self, item: Any) -> bool:
        """Add item to rear of queue. Returns True on success."""
        self._items.append(item)
        return True

    def dequeue(self) -> Optional[Any]:
        """Remove and return front item."""
        if not self._items:
            return None
        return self._items.popleft()

    def peek(self) -> Optional[Any]:
        """View front item without removal."""
        return self._items[0] if self._items else None

    def size(self) -> int:
        return len(self._items)

    def is_empty(self) -> bool:
        return len(self._items) == 0

    def to_list(self) -> List[Any]:
        return list(self._items)
