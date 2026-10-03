"""
Custom Hash Map Implementation with Separate Chaining Collision Resolution
Demonstrates O(1) average lookup, insertion, and deletion for in-memory session caching.
"""
from typing import Any, List, Optional, Tuple

class HashNode:
    def __init__(self, key: str, value: Any):
        self.key = key
        self.value = value
        self.next: Optional['HashNode'] = None

class CustomHashMap:
    def __init__(self, capacity: int = 64, load_factor: float = 0.75):
        self.capacity = capacity
        self.load_factor = load_factor
        self.size = 0
        self.buckets: List[Optional[HashNode]] = [None] * self.capacity

    def _hash(self, key: str) -> int:
        """Polynomial rolling hash function."""
        p = 31
        m = self.capacity
        hash_val = 0
        for char in str(key):
            hash_val = (hash_val * p + ord(char)) % m
        return hash_val

    def put(self, key: str, value: Any) -> None:
        """Insert or update key-value pair."""
        if (self.size + 1) / self.capacity >= self.load_factor:
            self._resize()

        idx = self._hash(key)
        head = self.buckets[idx]

        curr = head
        while curr:
            if curr.key == key:
                curr.value = value
                return
            curr = curr.next

        # Insert at head of bucket chain
        new_node = HashNode(key, value)
        new_node.next = self.buckets[idx]
        self.buckets[idx] = new_node
        self.size += 1

    def get(self, key: str, default: Any = None) -> Any:
        """Retrieve value by key in O(1) average time."""
        idx = self._hash(key)
        curr = self.buckets[idx]
        while curr:
            if curr.key == key:
                return curr.value
            curr = curr.next
        return default

    def contains(self, key: str) -> bool:
        return self.get(key) is not None

    def remove(self, key: str) -> bool:
        """Delete key-value pair."""
        idx = self._hash(key)
        curr = self.buckets[idx]
        prev = None

        while curr:
            if curr.key == key:
                if prev:
                    prev.next = curr.next
                else:
                    self.buckets[idx] = curr.next
                self.size -= 1
                return True
            prev = curr
            curr = curr.next
        return False

    def _resize(self) -> None:
        old_buckets = self.buckets
        self.capacity *= 2
        self.buckets = [None] * self.capacity
        self.size = 0

        for head in old_buckets:
            curr = head
            while curr:
                self.put(curr.key, curr.value)
                curr = curr.next

    def get_stats(self) -> dict:
        """Returns diagnostic metrics about bucket distribution and collisions."""
        chain_lengths = [0] * self.capacity
        collisions = 0
        for i, head in enumerate(self.buckets):
            length = 0
            curr = head
            while curr:
                length += 1
                curr = curr.next
            chain_lengths[i] = length
            if length > 1:
                collisions += (length - 1)

        return {
            "capacity": self.capacity,
            "size": self.size,
            "load_factor": round(self.size / self.capacity, 3),
            "max_chain_length": max(chain_lengths) if chain_lengths else 0,
            "total_collisions": collisions
        }
