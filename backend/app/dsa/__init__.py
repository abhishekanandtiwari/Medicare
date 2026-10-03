from app.dsa.trie import Trie, symptom_trie
from app.dsa.graph import MedicalGraph, medical_graph
from app.dsa.priority_queue import MaxPriorityQueue
from app.dsa.fifo_queue import FIFOQueue
from app.dsa.sorting import mergesort, quicksort, binary_search
from app.dsa.hash_map import CustomHashMap

# Global fast session/cache store
app_cache = CustomHashMap(capacity=128)

# Global waiting queue for walk-ins
appointment_waitlist = FIFOQueue()

# Global emergency triage queue
emergency_triage_queue = MaxPriorityQueue()

__all__ = [
    "Trie",
    "symptom_trie",
    "MedicalGraph",
    "medical_graph",
    "MaxPriorityQueue",
    "FIFOQueue",
    "mergesort",
    "quicksort",
    "binary_search",
    "CustomHashMap",
    "app_cache",
    "appointment_waitlist",
    "emergency_triage_queue"
]
