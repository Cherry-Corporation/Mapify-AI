let cy = cytoscape({
    container: document.getElementById('cy'),
    style: [
        {
            selector: 'node',
            style: {
                'label': 'data(label)',
                'background-color': '#53354a',
                'color': '#fff',
                'text-valign': 'center',
                'text-halign': 'center',
                'width': 'label',
                'height': 'label',
                'padding': '10px',
                'shape': 'ellipse',
                'font-size': '12px',
                'border-width': '2px',
                'border-color': '#e94560',
                'grabbable': 'false'  // Disable node dragging
            }
        },
        {
            selector: 'edge',
            style: {
                'line-color': '#e94560',
                'target-arrow-color': '#e94560',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier'
            }
        }
    ]
});


let isEditing = false;
let selectedNode = null;
let selectedEdge = null;
let isCreatingEdge = false;
let firstNode = null;

// Handle keydown events
document.addEventListener('keydown', function(event) {
    if (event.key === 'e') {
        isEditing = !isEditing;  // Toggle editing mode
        console.log('Editing mode:', isEditing ? 'Enabled' : 'Disabled');
    }

    if (event.key === 'n' && !isEditing) {
        createNode();  // Create a new node with the "n" key, only if not editing
    }

    if (event.key === 'Backspace') {
        if (selectedNode) {
            deleteSelectedNode();  // Delete the selected node
        } else if (selectedEdge) {
            deleteSelectedEdge();  // Delete the selected edge
        }
    }
});

// Handle node click for editing and selecting
cy.on('tap', 'node', function(evt) {
    if (isEditing) {
        // When "e" key is pressed, allow editing of a node
        if (!selectedNode) {
            selectedNode = evt.target;
            openEditPopup(selectedNode);  // Open the edit popup for the first click
        }
    } else if (!isCreatingEdge) {
        // Not in editing mode and not creating an edge, just normal clicking
        if (firstNode && firstNode.id() !== evt.target.id()) {
            // Prevent connecting a node to itself
            createEdge(firstNode, evt.target);
            firstNode = null;  // Reset first node after creating the edge
        } else {
            // Set the first node to start creating an edge
            firstNode = evt.target;
        }
    }
    selectedNode = evt.target;  // Update selected node
    selectedEdge = null;  // Deselect edge when a node is selected
});

// Handle edge click for selecting
cy.on('tap', 'edge', function(evt) {
    selectedEdge = evt.target;  // Update selected edge
    selectedNode = null;  // Deselect node when an edge is selected
});

// Open the popup for editing the node
function openEditPopup(node) {
    const currentLabel = node.data('label');
    
    let popup = document.createElement('div');
    popup.id = 'edit-popup';
    popup.style.position = 'fixed';
    popup.style.left = '50%';
    popup.style.top = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = '#34495e';
    popup.style.color = '#fff';
    popup.style.padding = '20px';
    popup.style.borderRadius = '10px';
    popup.style.zIndex = '1000';
    popup.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.3)';
    
    let inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = currentLabel;
    inputField.style.padding = '10px';
    inputField.style.fontSize = '14px';
    inputField.style.backgroundColor = '#2c3e50';
    inputField.style.border = '1px solid #e74c3c';
    inputField.style.color = '#fff';
    popup.appendChild(inputField);

    let saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.style.marginTop = '10px';
    saveButton.style.backgroundColor = '#16a085';
    saveButton.style.color = '#fff';
    saveButton.style.border = 'none';
    saveButton.style.padding = '10px';
    saveButton.style.borderRadius = '5px';
    saveButton.addEventListener('click', function() {
        saveNodeLabel(inputField, node);
        document.body.removeChild(popup);
        isEditing = false;  // Disable editing mode after saving
        selectedNode = null; // Reset selected node
    });
    popup.appendChild(saveButton);

    let cancelButton = document.createElement('button');
    cancelButton.innerText = 'Cancel';
    cancelButton.style.marginTop = '10px';
    cancelButton.style.backgroundColor = '#e74c3c';
    cancelButton.style.color = '#fff';
    cancelButton.style.border = 'none';
    cancelButton.style.padding = '10px';
    cancelButton.style.borderRadius = '5px';
    cancelButton.addEventListener('click', function() {
        document.body.removeChild(popup);
        selectedNode = null; // Reset selected node
        isEditing = false;  // Disable editing mode
    });
    popup.appendChild(cancelButton);

    document.body.appendChild(popup);

    inputField.focus();
}

// Save the new label on the node
function saveNodeLabel(inputField, node) {
    const newLabel = inputField.value.trim();
    if (newLabel) {
        node.data('label', newLabel);
        showMessage(`Node label updated to '${newLabel}'.`);
    }
}

// Create a new node at a random position
function createNode() {
    const newNode = cy.add({
        group: 'nodes',
        data: { label: 'New Node' },
        position: { x: Math.random() * 500, y: Math.random() * 500 }
    });

    showMessage('New node created!');
}

// Create an edge between two nodes
function createEdge(node1, node2) {
    cy.add({
        group: 'edges',
        data: { source: node1.id(), target: node2.id() }
    });
    showMessage('Edge created between nodes.');
}

// Delete the selected node
function deleteSelectedNode() {
    if (selectedNode) {
        selectedNode.remove();  // Remove the selected node
        showMessage('Node deleted.');
        selectedNode = null;  // Reset selected node after deletion
    }
}

// Delete the selected edge
function deleteSelectedEdge() {
    if (selectedEdge) {
        selectedEdge.remove();  // Remove the selected edge
        showMessage('Edge deleted.');
        selectedEdge = null;  // Reset selected edge after deletion
    }
}

// Show a message at the bottom of the screen
function showMessage(message) {
    const msgElement = document.getElementById('message');
    msgElement.textContent = message;
    msgElement.style.backgroundColor = '#4caf50';
    msgElement.style.display = 'block';
    setTimeout(() => msgElement.style.display = 'none', 5000);
}

// Save the current mind map
function saveMindmap() {
    const mindmapName = document.getElementById('mindmap-name').value.trim();

    if (!mindmapName) {
        showMessage("Please enter a mind map name to save.", true);
        return;
    }

    const mindmap = {
        name: mindmapName,
        nodes: cy.nodes().map(node => ({
            id: node.id(),
            label: node.data('label'),
            color: node.style('background-color'),
            position: node.position()
        })),
        edges: cy.edges().map(edge => ({
            source: edge.source().id(),
            target: edge.target().id()
        }))
    };

    fetch('/save-mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mindmap)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save mind map. Server responded with status: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showMessage(`Mind map '${mindmapName}' saved successfully.`);
        } else {
            showMessage(`Error: ${data.message || 'Failed to save mind map.'}`, true);
        }
    })
    .catch(err => {
        console.error('Error saving mind map:', err);
        showMessage("Error saving mind map.", true);
    });
}

// Load the list of mind maps from the server
function loadMindmapList() {
    fetch('/mindmaps')
        .then(response => response.json())
        .then(data => {
            if (data.mindmaps) {
                const mindmapsList = document.getElementById('mindmaps-list');
                mindmapsList.innerHTML = '';  // Clear existing items

                data.mindmaps.forEach(mindmap => {
                    const listItem = document.createElement('li');
                    listItem.textContent = mindmap;
                    listItem.onclick = () => {
                        document.getElementById('mindmap-name').value = mindmap;
                        loadMindmap(); // Load the selected mind map
                    };
                    mindmapsList.appendChild(listItem);
                });
            } else {
                showMessage("No mind maps found.", true);
            }
        })
        .catch(err => showMessage("Error loading mind map list.", true));
}

// Load a specific mind map from the server
function loadMindmap() {
    const name = document.getElementById('mindmap-name').value.trim();
    if (!name) {
        showMessage("Please enter a mind map name to load.", true);
        return;
    }

    console.log("Loading mind map with name:", name);  // Log to check the name being passed

    fetch(`/mindmap/${name}`)
        .then(response => response.json())
        .then(data => {
            if (data.mindmap) {
                cy.elements().remove();  // Clear the current mind map
                data.mindmap.nodes.forEach(node => {
                    cy.add({
                        group: 'nodes',
                        data: { id: node.id, label: node.label },
                        style: { 'background-color': node.color },
                        position: node.position
                    });
                });
                data.mindmap.edges.forEach(edge => {
                    cy.add({
                        group: 'edges',
                        data: { source: edge.source, target: edge.target }
                    });
                });
                showMessage("Mind map loaded successfully.");
            } else {
                showMessage("Mind map not found.", true);
            }
        })
        .catch(err => showMessage("Error loading mind map.", true));
}

// Load the mind map list when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadMindmapList();
});
