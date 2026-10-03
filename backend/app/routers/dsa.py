import time
from fastapi import APIRouter
from app.dsa import (
    symptom_trie, medical_graph, emergency_triage_queue,
    appointment_waitlist, app_cache, mergesort, quicksort, binary_search
)

router = APIRouter(prefix="/dsa", tags=["DSA Diagnostics"])

@router.get("/status")
def get_dsa_diagnostics():
    """
    Returns real-time structural metrics and benchmark information for all DSA components
    utilized across Medicare-AI.
    """
    # Benchmark MergeSort vs QuickSort on 10,000 synthetic clinical IDs
    test_data = list(range(2000, 0, -1))
    
    t0 = time.perf_counter()
    _ = mergesort(test_data)
    t_merge = round((time.perf_counter() - t0) * 1000, 3)

    t0 = time.perf_counter()
    _ = quicksort(test_data)
    t_quick = round((time.perf_counter() - t0) * 1000, 3)

    # Binary search benchmark
    sorted_sample = list(range(0, 10000, 2))
    t0 = time.perf_counter()
    bs_idx = binary_search(sorted_sample, 4820)
    t_bs = round((time.perf_counter() - t0) * 1000, 4)

    return {
        "status": "Operational",
        "components": {
            "trie": {
                "name": "Prefix Trie",
                "purpose": "O(L) Instant Symptom & Medical Autocomplete",
                "total_words_indexed": symptom_trie.size(),
                "sample_query": "head",
                "sample_results_count": len(symptom_trie.autocomplete("head"))
            },
            "graph": {
                "name": "Medical Knowledge Graph",
                "purpose": "Clinical Symptom-Condition-Specialty Association Exploration (BFS/DFS)",
                "total_nodes": len(medical_graph.adj),
                "total_edges": sum(len(neighbors) for neighbors in medical_graph.adj.values()) // 2
            },
            "priority_queue": {
                "name": "Binary Max-Heap Priority Queue",
                "purpose": "Emergency SOS Triage & Urgent Notification Ordering",
                "current_size": emergency_triage_queue.size(),
                "time_complexity": "O(log N) insert and extract_max"
            },
            "fifo_queue": {
                "name": "FIFO Appointment Waitlist Queue",
                "purpose": "Walk-in & Overflow Patient Waitlist Processing",
                "current_size": appointment_waitlist.size(),
                "time_complexity": "O(1) enqueue and dequeue"
            },
            "hash_map": {
                "name": "Custom Separate-Chaining HashMap",
                "purpose": "High-Speed Session & In-Memory Entity Lookup",
                "time_complexity": "O(1) average lookup",
                "stats": app_cache.get_stats()
            },
            "sorting_algorithms": {
                "mergesort_time_ms": t_merge,
                "quicksort_time_ms": t_quick,
                "binary_search_time_ms": t_bs,
                "binary_search_found_index": bs_idx
            }
        }
    }
