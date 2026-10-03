"""
Trie Data Structure for High-Performance Autocomplete and Prefix Search
Supports symptom autocomplete, doctor search, and medical terms.
"""
from typing import List, Dict, Any, Optional

class TrieNode:
    def __init__(self):
        self.children: Dict[str, TrieNode] = {}
        self.is_end_of_word: bool = False
        self.metadata: Optional[Dict[str, Any]] = None
        self.frequency: int = 0  # For ranking popular symptoms / terms

class Trie:
    def __init__(self):
        self.root = TrieNode()
        self._count = 0

    def insert(self, word: str, metadata: Optional[Dict[str, Any]] = None, frequency: int = 1) -> None:
        """Insert a word with optional metadata and search frequency."""
        if not word:
            return
        node = self.root
        word_clean = word.strip().lower()
        for char in word_clean:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_of_word = True
        node.metadata = metadata or {"title": word}
        node.frequency += frequency
        self._count += 1

    def search(self, word: str) -> Optional[Dict[str, Any]]:
        """Exact match search."""
        node = self.root
        for char in word.strip().lower():
            if char not in node.children:
                return None
            node = node.children[char]
        return node.metadata if node.is_end_of_word else None

    def autocomplete(self, prefix: str, max_results: int = 8) -> List[Dict[str, Any]]:
        """Return autocomplete suggestions matching the prefix, sorted by frequency."""
        results: List[Dict[str, Any]] = []
        if not prefix:
            return results

        prefix_clean = prefix.strip().lower()
        node = self.root
        for char in prefix_clean:
            if char not in node.children:
                return results  # Prefix not found
            node = node.children[char]

        # DFS to collect all words starting with this prefix
        items: List[tuple[int, str, Dict[str, Any]]] = []
        self._dfs(node, prefix_clean, items)

        # Sort by frequency descending
        items.sort(key=lambda x: x[0], reverse=True)
        return [item[2] for item in items[:max_results]]

    def _dfs(self, node: TrieNode, current_word: str, results: List[tuple[int, str, Dict[str, Any]]]) -> None:
        if node.is_end_of_word and node.metadata:
            results.append((node.frequency, current_word, node.metadata))

        for char, child_node in node.children.items():
            self._dfs(child_node, current_word + char, results)

    def size(self) -> int:
        return self._count


# Pre-populated global instances for symptoms and medical terms
symptom_trie = Trie()

SAMPLE_SYMPTOMS = [
    {"name": "Headache", "category": "Neurological", "severity_base": "Mild", "urgency": "Low"},
    {"name": "Head congestion", "category": "Respiratory", "severity_base": "Mild", "urgency": "Low"},
    {"name": "Head injury", "category": "Trauma", "severity_base": "Severe", "urgency": "High"},
    {"name": "Headache with nausea", "category": "Neurological", "severity_base": "Moderate", "urgency": "Moderate"},
    {"name": "Fever", "category": "General", "severity_base": "Moderate", "urgency": "Low"},
    {"name": "High Fever with chills", "category": "Infectious", "severity_base": "Moderate", "urgency": "Moderate"},
    {"name": "Shortness of breath", "category": "Cardiopulmonary", "severity_base": "Severe", "urgency": "Urgent"},
    {"name": "Chest pain", "category": "Cardiovascular", "severity_base": "Severe", "urgency": "Urgent"},
    {"name": "Chest tightness", "category": "Cardiovascular", "severity_base": "Moderate", "urgency": "High"},
    {"name": "Dizziness", "category": "Neurological", "severity_base": "Mild", "urgency": "Low"},
    {"name": "Severe Dizziness with fainting", "category": "Neurological", "severity_base": "Severe", "urgency": "Urgent"},
    {"name": "Fatigue and weakness", "category": "General", "severity_base": "Mild", "urgency": "Low"},
    {"name": "Abdominal pain", "category": "Gastrointestinal", "severity_base": "Moderate", "urgency": "Moderate"},
    {"name": "Acute lower right abdominal pain", "category": "Gastrointestinal", "severity_base": "Severe", "urgency": "Urgent"},
    {"name": "Cough (dry)", "category": "Respiratory", "severity_base": "Mild", "urgency": "Low"},
    {"name": "Cough with blood", "category": "Respiratory", "severity_base": "Severe", "urgency": "Urgent"},
    {"name": "Cough with yellow/green phlegm", "category": "Respiratory", "severity_base": "Moderate", "urgency": "Low"},
    {"name": "Sore throat", "category": "ENT", "severity_base": "Mild", "urgency": "Low"},
    {"name": "Difficulty swallowing", "category": "ENT", "severity_base": "Moderate", "urgency": "Moderate"},
    {"name": "Nausea and vomiting", "category": "Gastrointestinal", "severity_base": "Moderate", "urgency": "Moderate"},
    {"name": "Diarrhea", "category": "Gastrointestinal", "severity_base": "Moderate", "urgency": "Low"},
    {"name": "Joint pain", "category": "Orthopedic", "severity_base": "Mild", "urgency": "Low"},
    {"name": "Lower back pain", "category": "Orthopedic", "severity_base": "Mild", "urgency": "Low"},
    {"name": "Skin rash", "category": "Dermatological", "severity_base": "Mild", "urgency": "Low"},
    {"name": "Sudden rash with facial swelling", "category": "Immunological", "severity_base": "Severe", "urgency": "Urgent"},
    {"name": "Blurred vision", "category": "Ophthalmological", "severity_base": "Moderate", "urgency": "Moderate"},
    {"name": "Sudden loss of vision", "category": "Ophthalmological", "severity_base": "Severe", "urgency": "Urgent"},
    {"name": "Numbness in face or arm", "category": "Neurological", "severity_base": "Severe", "urgency": "Urgent"},
    {"name": "Palpitations / Rapid heartbeat", "category": "Cardiovascular", "severity_base": "Moderate", "urgency": "Moderate"},
    {"name": "Insomnia", "category": "Sleep", "severity_base": "Mild", "urgency": "Low"},
    {"name": "Anxiety and restlessness", "category": "Psychological", "severity_base": "Mild", "urgency": "Low"},
    {"name": "Loss of taste or smell", "category": "ENT", "severity_base": "Mild", "urgency": "Low"},
]

for s in SAMPLE_SYMPTOMS:
    symptom_trie.insert(s["name"], metadata=s, frequency=10)
