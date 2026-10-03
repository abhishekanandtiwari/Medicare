"""
Medical Knowledge Graph
Models relationships between Symptoms, Conditions, Specialties, and Risk Factors.
Supports Breadth-First Search (BFS) and Depth-First Search (DFS) for medical exploration.
"""
from typing import Dict, List, Set, Any, Optional

class MedicalGraph:
    def __init__(self):
        # Adjacency list: node -> dict of (neighbor -> weight/relation)
        self.adj: Dict[str, Dict[str, Dict[str, Any]]] = {}
        self.node_types: Dict[str, str] = {} # "symptom", "condition", "specialty"

    def add_node(self, node: str, node_type: str = "concept"):
        clean_node = node.strip().lower()
        if clean_node not in self.adj:
            self.adj[clean_node] = {}
            self.node_types[clean_node] = node_type

    def add_edge(self, u: str, v: str, weight: float = 1.0, relation: str = "related_to", directed: bool = False):
        u_clean = u.strip().lower()
        v_clean = v.strip().lower()
        if u_clean not in self.adj:
            self.add_node(u_clean)
        if v_clean not in self.adj:
            self.add_node(v_clean)

        self.adj[u_clean][v_clean] = {"weight": weight, "relation": relation}
        if not directed:
            self.adj[v_clean][u_clean] = {"weight": weight, "relation": relation}

    def get_related_symptoms(self, symptom: str) -> List[str]:
        """Finds related symptoms linked to the given symptom."""
        s_clean = symptom.strip().lower()
        if s_clean not in self.adj:
            return []
        
        related = []
        for neighbor, data in self.adj[s_clean].items():
            if self.node_types.get(neighbor) == "symptom":
                related.append(neighbor.title())
        return related

    def explore_conditions_and_specialties(self, symptoms: List[str]) -> Dict[str, Any]:
        """
        Traverse the graph given a set of symptoms and aggregate potential conditions
        and matching doctor specialties using graph neighborhood scoring.
        """
        condition_scores: Dict[str, float] = {}
        specialty_scores: Dict[str, float] = {}

        for symptom in symptoms:
            s_clean = symptom.strip().lower()
            if s_clean not in self.adj:
                continue

            for neighbor, edge_data in self.adj[s_clean].items():
                n_type = self.node_types.get(neighbor)
                weight = edge_data.get("weight", 1.0)
                if n_type == "condition":
                    condition_scores[neighbor] = condition_scores.get(neighbor, 0.0) + weight
                elif n_type == "specialty":
                    specialty_scores[neighbor] = specialty_scores.get(neighbor, 0.0) + weight

        # Sort descending
        top_conditions = sorted(condition_scores.items(), key=lambda x: x[1], reverse=True)
        top_specialties = sorted(specialty_scores.items(), key=lambda x: x[1], reverse=True)

        return {
            "conditions": [{"name": k.title(), "score": round(v, 2)} for k, v in top_conditions[:5]],
            "specialties": [{"name": k.title(), "score": round(v, 2)} for k, v in top_specialties[:3]]
        }

    def bfs_traversal(self, start_node: str, max_depth: int = 2) -> List[Dict[str, Any]]:
        """Breadth-First Search traversal to explore clinical connections."""
        start_clean = start_node.strip().lower()
        if start_clean not in self.adj:
            return []

        visited: Set[str] = {start_clean}
        queue: List[tuple[str, int, str]] = [(start_clean, 0, "root")] # (node, depth, relation)
        result: List[Dict[str, Any]] = []

        while queue:
            curr, depth, rel = queue.pop(0)
            if depth > 0:
                result.append({
                    "node": curr.title(),
                    "type": self.node_types.get(curr, "concept"),
                    "depth": depth,
                    "relation": rel
                })
            
            if depth < max_depth:
                for neighbor, edge_info in self.adj[curr].items():
                    if neighbor not in visited:
                        visited.add(neighbor)
                        queue.append((neighbor, depth + 1, edge_info.get("relation", "connected")))

        return result


# Initialize and seed medical knowledge graph
medical_graph = MedicalGraph()

_GRAPH_SEED_DATA = [
    # Headache relationships
    ("headache", "symptom", "migraine", "condition", 2.0, "suggests"),
    ("headache", "symptom", "tension headache", "condition", 1.8, "suggests"),
    ("headache", "symptom", "hypertension", "condition", 1.2, "possible_indicator"),
    ("headache", "symptom", "neurology", "specialty", 1.5, "consult"),
    ("headache", "symptom", "general medicine", "specialty", 1.2, "consult"),
    ("headache", "symptom", "dizziness", "symptom", 1.0, "co-occurs"),
    ("headache", "symptom", "nausea and vomiting", "symptom", 1.2, "co-occurs"),

    # Fever relationships
    ("fever", "symptom", "viral infection", "condition", 2.0, "suggests"),
    ("fever", "symptom", "flu / influenza", "condition", 2.0, "suggests"),
    ("fever", "symptom", "general medicine", "specialty", 2.0, "consult"),
    ("fever", "symptom", "chills", "symptom", 1.5, "co-occurs"),
    ("fever", "symptom", "fatigue and weakness", "symptom", 1.4, "co-occurs"),
    ("fever", "symptom", "cough (dry)", "symptom", 1.3, "co-occurs"),

    # Chest pain & shortness of breath
    ("chest pain", "symptom", "angina / cardiac event", "condition", 3.0, "emergency_indicator"),
    ("chest pain", "symptom", "gastroesophageal reflux", "condition", 1.1, "suggests"),
    ("chest pain", "symptom", "cardiology", "specialty", 3.0, "consult"),
    ("chest pain", "symptom", "emergency medicine", "specialty", 3.0, "urgent_care"),
    ("chest pain", "symptom", "shortness of breath", "symptom", 2.5, "co-occurs"),
    ("shortness of breath", "symptom", "asthma / copd", "condition", 2.2, "suggests"),
    ("shortness of breath", "symptom", "pulmonology", "specialty", 2.5, "consult"),
    ("shortness of breath", "symptom", "cardiology", "specialty", 2.0, "consult"),

    # Gastrointestinal
    ("abdominal pain", "symptom", "gastritis", "condition", 1.8, "suggests"),
    ("abdominal pain", "symptom", "appendicitis", "condition", 2.2, "differential"),
    ("abdominal pain", "symptom", "gastroenterology", "specialty", 2.5, "consult"),
    ("abdominal pain", "symptom", "nausea and vomiting", "symptom", 1.5, "co-occurs"),
    ("diarrhea", "symptom", "gastroenteritis", "condition", 2.0, "suggests"),
    ("diarrhea", "symptom", "general medicine", "specialty", 1.5, "consult"),

    # Joint & back pain
    ("joint pain", "symptom", "osteoarthritis", "condition", 2.0, "suggests"),
    ("joint pain", "symptom", "rheumatoid arthritis", "condition", 1.7, "suggests"),
    ("joint pain", "symptom", "orthopedics", "specialty", 2.5, "consult"),
    ("lower back pain", "symptom", "lumbar strain / disc herniation", "condition", 2.2, "suggests"),
    ("lower back pain", "symptom", "orthopedics", "specialty", 2.5, "consult"),

    # Dermatological
    ("skin rash", "symptom", "contact dermatitis", "condition", 2.0, "suggests"),
    ("skin rash", "symptom", "allergic reaction", "condition", 2.2, "suggests"),
    ("skin rash", "symptom", "dermatology", "specialty", 3.0, "consult"),
]

for u, u_type, v, v_type, weight, rel in _GRAPH_SEED_DATA:
    medical_graph.add_node(u, u_type)
    medical_graph.add_node(v, v_type)
    medical_graph.add_edge(u, v, weight=weight, relation=rel)
