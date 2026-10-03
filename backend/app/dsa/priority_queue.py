"""
Priority Queue (Binary Max-Heap) for Triage and Urgent Medical Alerts
"""
from typing import Any, List, Optional
import time

class PriorityItem:
    def __init__(self, priority: float, data: Any, timestamp: Optional[float] = None):
        self.priority = priority # Higher number = higher priority
        self.data = data
        self.timestamp = timestamp or time.time()

    def __lt__(self, other: 'PriorityItem') -> bool:
        # If priorities are equal, earlier timestamp wins
        if self.priority == other.priority:
            return self.timestamp < other.timestamp
        return self.priority > other.priority # Max-heap condition

class MaxPriorityQueue:
    def __init__(self):
        self.heap: List[PriorityItem] = []

    def push(self, priority: float, data: Any) -> None:
        """Insert item into the max-heap."""
        item = PriorityItem(priority, data)
        self.heap.append(item)
        self._sift_up(len(self.heap) - 1)

    def pop(self) -> Optional[Any]:
        """Extract the highest priority item."""
        if not self.heap:
            return None
        if len(self.heap) == 1:
            return self.heap.pop().data

        root = self.heap[0]
        self.heap[0] = self.heap.pop()
        self._sift_down(0)
        return root.data

    def peek(self) -> Optional[Any]:
        """Inspect the highest priority item without removal."""
        return self.heap[0].data if self.heap else None

    def is_empty(self) -> bool:
        return len(self.heap) == 0

    def size(self) -> int:
        return len(self.heap)

    def to_sorted_list(self) -> List[Any]:
        """Returns all items in priority order without modifying the heap."""
        copy_q = MaxPriorityQueue()
        copy_q.heap = list(self.heap)
        items = []
        while not copy_q.is_empty():
            items.append(copy_q.pop())
        return items

    def _sift_up(self, index: int) -> None:
        parent = (index - 1) // 2
        while index > 0 and self.heap[index].priority > self.heap[parent].priority:
            self.heap[index], self.heap[parent] = self.heap[parent], self.heap[index]
            index = parent
            parent = (index - 1) // 2

    def _sift_down(self, index: int) -> None:
        size = len(self.heap)
        while True:
            left = 2 * index + 1
            right = 2 * index + 2
            largest = index

            if left < size and self.heap[left].priority > self.heap[largest].priority:
                largest = left
            if right < size and self.heap[right].priority > self.heap[largest].priority:
                largest = right

            if largest != index:
                self.heap[index], self.heap[largest] = self.heap[largest], self.heap[index]
                index = largest
            else:
                break
