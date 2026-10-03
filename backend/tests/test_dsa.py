from app.dsa import (
    Trie, MedicalGraph, MaxPriorityQueue, FIFOQueue,
    CustomHashMap, mergesort, quicksort, binary_search
)

def test_trie_insert_and_autocomplete():
    trie = Trie()
    trie.insert("headache", {"title": "Headache"}, frequency=5)
    trie.insert("head congestion", {"title": "Head Congestion"}, frequency=3)
    trie.insert("heart palpitation", {"title": "Heart Palpitation"}, frequency=4)

    results = trie.autocomplete("head")
    assert len(results) == 2
    # "headache" has higher frequency, so it should rank first
    assert results[0]["title"] == "Headache"
    assert results[1]["title"] == "Head Congestion"

    no_match = trie.autocomplete("stomach")
    assert len(no_match) == 0

def test_priority_queue_heap():
    pq = MaxPriorityQueue()
    pq.push(20.0, "low priority alert")
    pq.push(100.0, "critical emergency")
    pq.push(60.0, "moderate notification")

    assert pq.peek() == "critical emergency"
    assert pq.pop() == "critical emergency"
    assert pq.pop() == "moderate notification"
    assert pq.pop() == "low priority alert"
    assert pq.is_empty() is True

def test_fifo_queue():
    q = FIFOQueue()
    q.enqueue("patient_1")
    q.enqueue("patient_2")
    q.enqueue("patient_3")

    assert q.peek() == "patient_1"
    assert q.dequeue() == "patient_1"
    assert q.dequeue() == "patient_2"
    assert q.size() == 1

def test_custom_hashmap():
    hmap = CustomHashMap(capacity=8)
    hmap.put("user_101", {"name": "Alice", "role": "patient"})
    hmap.put("user_102", {"name": "Bob", "role": "doctor"})

    assert hmap.contains("user_101") is True
    assert hmap.get("user_101")["name"] == "Alice"
    assert hmap.get("user_999") is None

    hmap.remove("user_101")
    assert hmap.contains("user_101") is False

def test_sorting_and_binary_search():
    arr = [45, 12, 85, 32, 89, 39, 69, 44, 42, 1, 99]
    sorted_merge = mergesort(arr)
    sorted_quick = quicksort(arr)
    expected = sorted(arr)

    assert sorted_merge == expected
    assert sorted_quick == expected

    idx = binary_search(sorted_merge, 42)
    assert idx != -1
    assert sorted_merge[idx] == 42
    assert binary_search(sorted_merge, 1000) == -1

def test_medical_knowledge_graph():
    graph = MedicalGraph()
    graph.add_node("fever", "symptom")
    graph.add_node("viral infection", "condition")
    graph.add_node("general medicine", "specialty")
    graph.add_edge("fever", "viral infection", weight=2.0)
    graph.add_edge("fever", "general medicine", weight=1.5)

    findings = graph.explore_conditions_and_specialties(["fever"])
    assert len(findings["conditions"]) > 0
    assert findings["conditions"][0]["name"] == "Viral Infection"
