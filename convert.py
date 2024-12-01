import re
import uuid
import json
import random

# Function to convert markdown to a more structured mindmap format
def markdown_to_mindmap(md_content):
    lines = md_content.split('\n')
    
    mindmap = {
        "mindmap1": {
            "nodes": [],
            "edges": []
        }
    }

    node_stack = []  # Stack to keep track of node hierarchy (parent-child relationships)
    node_counter = 1  # Counter for node IDs
    
    def create_node(label):
        nonlocal node_counter
        node_id = f"node{node_counter}"
        node_counter += 1
        node_color = "rgb(83,53,74)"  # Default color
        position = {
            "x": round(random.uniform(500, 2000), 2),
            "y": round(random.uniform(0, 1000), 2)
        }
        
        new_node = {
            "id": node_id,
            "label": label,
            "color": node_color,
            "position": position
        }
        
        # Add node to mindmap nodes list
        mindmap["mindmap1"]["nodes"].append(new_node)
        return new_node

    # Iterate through each line in markdown content
    for line in lines:
        line = line.strip()
        
        # Skip empty lines
        if not line:
            continue
        
        # Check if line is a header and determine its level
        if line.startswith("# "):  # H1
            level = 1
            label = line[2:].strip()
        elif line.startswith("## "):  # H2
            level = 2
            label = line[3:].strip()
        elif line.startswith("### "):  # H3
            level = 3
            label = line[4:].strip()
        else:
            continue  # Skip non-header lines for now
        
        # Create a new node for this header
        new_node = create_node(label)
        
        # Create edges if the node has a parent (based on header level)
        if node_stack:
            parent_node = node_stack[-1]
            mindmap["mindmap1"]["edges"].append({
                "source": parent_node["id"],
                "target": new_node["id"]
            })
        
        # Add the new node to the stack to make it the parent for future nodes
        node_stack.append(new_node)
        
        # If the level decreases, pop elements off the stack to find the correct parent
        while len(node_stack) > level:
            node_stack.pop()

    return mindmap

# Sample Markdown content (you can replace this with reading from a file)
md_content = """
# Node 1
## Subnode 1.1
### Subsubnode 1.1.1
## Subnode 1.2
# Node 2
## Subnode 2.1
"""

# Convert the markdown to a mindmap JSON
mindmap_json = markdown_to_mindmap(md_content)

# Print the resulting JSON (or save it to a file)
print(json.dumps(mindmap_json, indent=4))
