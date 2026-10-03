"""
Sorting and Searching Algorithms
Provides MergeSort, QuickSort, and Binary Search for health metrics, appointment schedules, and records.
"""
from typing import List, Any, Callable, Optional

def mergesort(arr: List[Any], key: Optional[Callable[[Any], Any]] = None, reverse: bool = False) -> List[Any]:
    """Stable O(N log N) Merge Sort implementation."""
    if len(arr) <= 1:
        return list(arr)

    get_key = key if key else (lambda x: x)
    mid = len(arr) // 2
    left = mergesort(arr[:mid], key=key, reverse=reverse)
    right = mergesort(arr[mid:], key=key, reverse=reverse)

    return _merge(left, right, get_key, reverse)

def _merge(left: List[Any], right: List[Any], key_fn: Callable, reverse: bool) -> List[Any]:
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        left_val = key_fn(left[i])
        right_val = key_fn(right[j])

        condition = (left_val >= right_val) if reverse else (left_val <= right_val)
        if condition:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    result.extend(left[i:])
    result.extend(right[j:])
    return result

def quicksort(arr: List[Any], key: Optional[Callable[[Any], Any]] = None, reverse: bool = False) -> List[Any]:
    """In-place or partitioned O(N log N) QuickSort implementation."""
    if len(arr) <= 1:
        return list(arr)

    get_key = key if key else (lambda x: x)
    pivot = arr[len(arr) // 2]
    pivot_val = get_key(pivot)

    if not reverse:
        less = [x for x in arr if get_key(x) < pivot_val]
        equal = [x for x in arr if get_key(x) == pivot_val]
        greater = [x for x in arr if get_key(x) > pivot_val]
        return quicksort(less, key=key, reverse=reverse) + equal + quicksort(greater, key=key, reverse=reverse)
    else:
        greater = [x for x in arr if get_key(x) > pivot_val]
        equal = [x for x in arr if get_key(x) == pivot_val]
        less = [x for x in arr if get_key(x) < pivot_val]
        return quicksort(greater, key=key, reverse=reverse) + equal + quicksort(less, key=key, reverse=reverse)

def binary_search(sorted_arr: List[Any], target_val: Any, key: Optional[Callable[[Any], Any]] = None) -> int:
    """
    Binary search in sorted list. Returns index of match or -1 if not found.
    O(log N) time complexity.
    """
    get_key = key if key else (lambda x: x)
    low = 0
    high = len(sorted_arr) - 1

    while low <= high:
        mid = (low + high) // 2
        mid_val = get_key(sorted_arr[mid])

        if mid_val == target_val:
            return mid
        elif mid_val < target_val:
            low = mid + 1
        else:
            high = mid - 1

    return -1
