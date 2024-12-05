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
                'shape': 'roundrectangle',
                'font-size': '12px',
                'border-width': '2px',
                'border-color': '#e94560',
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
    ],
    wheelSensitivity: 0.1,
    userPanningEnabled: true,
});


let selectedNode = null;
let firstNode = null;

// Function to show messages
function showMessage(message) {
    const msgElement = document.getElementById('message');
    msgElement.textContent = message;
    msgElement.style.display = 'block';
    setTimeout(() => (msgElement.style.display = 'none'), 3000);
}

// Right-click to enable panning
cy.on('mousedown', function (evt) {
    if (evt.originalEvent.button === 2) {
        cy.userPanningEnabled(true);
    }
});

cy.on('mouseup', function (evt) {
    if (evt.originalEvent.button === 2) {
        cy.userPanningEnabled(false);
    }
});

cy.container().addEventListener('contextmenu', (e) => e.preventDefault());

// Node tap behavior
cy.on('tap', 'node', function (evt) {
    const clickedNode = evt.target;
    selectedNode = clickedNode;

    if (firstNode) {
        createEdge(firstNode, clickedNode);
        firstNode = null;
    } else {
        firstNode = clickedNode;
        showMessage(`First node selected: ${clickedNode.data('label')}`);
    }
});

// Open edit popup
function openEditPopup(node) {
    const currentLabel = node.data('label');
    const popup = document.createElement('div');
    popup.id = 'edit-popup';
    popup.style.position = 'fixed';
    popup.style.left = '50%';
    popup.style.top = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = '#34495e';
    popup.style.color = '#fff';
    popup.style.padding = '20px';
    popup.style.borderRadius = '10px';
    popup.style.zIndex = 1000;

    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = currentLabel;
    inputField.style.marginRight = '10px';
    popup.appendChild(inputField);

    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.style.marginRight = '5px';
    saveButton.onclick = () => {
        saveNodeLabel(inputField.value.trim(), node);
        document.body.removeChild(popup);
    };
    popup.appendChild(saveButton);

    const cancelButton = document.createElement('button');
    cancelButton.innerText = 'Cancel';
    cancelButton.onclick = () => document.body.removeChild(popup);
    popup.appendChild(cancelButton);

    document.body.appendChild(popup);
    inputField.focus();
}

function saveNodeLabel(newLabel, node) {
    if (newLabel) {
        node.data('label', newLabel);
        showMessage(`Node label updated to '${newLabel}'.`);
    }
}

function createEdge(node1, node2) {
    if (node1 === node2) {
        showMessage("Cannot connect a node to itself.");
        return;
    }
    if (cy.edges(`[source="${node1.id()}"][target="${node2.id()}"]`).length > 0) {
        showMessage("Edge already exists.");
        return;
    }

    cy.add({
        group: 'edges',
        data: { source: node1.id(), target: node2.id() }
    });
    showMessage(`Edge created between ${node1.data('label')} and ${node2.data('label')}.`);
}

// Keyboard controls
/*document.addEventListener('keydown', (event) => {
    const { key } = event;

    if (key === 'n') {
        // Create a new node at the center of the viewport
        const viewportCenter = cy.extent();
        const newNode = cy.add({
            group: 'nodes',
            data: { id: `node-${Date.now()}`, label: 'New Node' },
            position: {
                x: (viewportCenter.x1 + viewportCenter.x2) / 2,
                y: (viewportCenter.y1 + viewportCenter.y2) / 2
            }
        });
        openEditPopup(newNode);
    } else if (key === 'e' && selectedNode) {
        // Edit the selected node's label
        openEditPopup(selectedNode);
    }
});*/

// Add the message element for user feedback
const messageElement = document.createElement('div');
messageElement.id = 'message';
messageElement.style.position = 'fixed';
messageElement.style.bottom = '20px';
messageElement.style.left = '50%';
messageElement.style.transform = 'translateX(-50%)';
messageElement.style.backgroundColor = '#34495e';
messageElement.style.color = '#fff';
messageElement.style.padding = '10px';
messageElement.style.borderRadius = '5px';
messageElement.style.display = 'none';
document.body.appendChild(messageElement);

function openEditPopup(node) {
    const currentLabel = node.data('label');
    const popup = document.createElement('div');
    popup.id = 'edit-popup';
    popup.style.position = 'fixed';
    popup.style.left = '50%';
    popup.style.top = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = '#34495e';
    popup.style.color = '#fff';
    popup.style.padding = '20px';
    popup.style.borderRadius = '10px';
    popup.style.zIndex = 1000;

    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = currentLabel;
    popup.appendChild(inputField);

    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.onclick = () => {
        saveNodeLabel(inputField.value.trim(), node);
        document.body.removeChild(popup);
    };
    popup.appendChild(saveButton);

    const cancelButton = document.createElement('button');
    cancelButton.innerText = 'Cancel';
    cancelButton.onclick = () => document.body.removeChild(popup);
    popup.appendChild(cancelButton);

    document.body.appendChild(popup);
    inputField.focus();
}

function saveNodeLabel(newLabel, node) {
    if (newLabel) {
        node.data('label', newLabel);
        showMessage(`Node label updated to '${newLabel}'.`);
    }
}

function createEdge(node1, node2) {
    if (node1 === node2) {
        showMessage("Cannot connect a node to itself.");
        return;
    }
    if (cy.edges(`[source="${node1.id()}"][target="${node2.id()}"]`).length > 0) {
        showMessage("Edge already exists.");
        return;
    }

    cy.add({
        group: 'edges',
        data: { source: node1.id(), target: node2.id() }
    });
    showMessage(`Edge created between ${node1.data('label')} and ${node2.data('label')}.`);
}

function deleteSelectedNodeOrEdge() {
    if (selectedNode) {
        selectedNode.remove();
        showMessage("Node deleted.");
        selectedNode = null;
    } else if (selectedEdge) {
        selectedEdge.remove();
        showMessage("Edge deleted.");
        selectedEdge = null;
    }
}

function exportMindmap(format) {
    let dataUrl;

    if (format === 'svg') {
        dataUrl = cy.svg({ full: true });
        const blob = new Blob([dataUrl], { type: 'image/svg+xml;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'mindmap.svg';
        link.click();
    } else {
        dataUrl = cy[format]({ full: true });

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `mindmap.${format}`;
        link.click();
    }

    showMessage(`Mind map exported as ${format.toUpperCase()}.`);
}

// Toggle between light and dark themes
function toggleTheme() {
    const body = document.body;

    if (isDarkTheme) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');

        cy.style()
            .selector('node')
            .style({
                'background-color': '#85c1e9',
                'color': '#2c3e50',
                'border-color': '#5dade2',
            })
            .update();

        cy.style()
            .selector('edge')
            .style({
                'line-color': '#3498db',
                'target-arrow-color': '#3498db',
            })
            .update();

        showMessage("Switched to Light Theme.");
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');

        cy.style()
            .selector('node')
            .style({
                'background-color': '#53354a',
                'color': '#fff',
                'border-color': '#e94560',
            })
            .update();

        cy.style()
            .selector('edge')
            .style({
                'line-color': '#e94560',
                'target-arrow-color': '#e94560',
            })
            .update();

        showMessage("Switched to Dark Theme.");
    }

    isDarkTheme = !isDarkTheme; // Toggle the theme state
}

// Load the mind map list on page load
function loadMindmapList() {
    fetch('/mindmaps')
        .then(response => response.json())
        .then(data => {
            if (data.mindmaps) {
                const mindmapsList = document.getElementById('mindmaps-list');
                mindmapsList.innerHTML = ''; // Clear existing list

                data.mindmaps.forEach(mindmap => {
                    const listItem = document.createElement('li');
                    listItem.textContent = mindmap;
                    listItem.onclick = () => {
                        document.getElementById('mindmap-name').value = mindmap;
                        loadMindmap();
                    };
                    mindmapsList.appendChild(listItem);
                });
            } else {
                showMessage("No mind maps found.");
            }
        })
        .catch(() => showMessage("Error loading mind maps."));
}

// Load a specific mind map
function loadMindmap() {
    const name = document.getElementById('mindmap-name').value.trim();
    if (!name) {
        showMessage("Please enter a mind map name to load.");
        return;
    }

    fetch(`/mindmap/${name}`)
        .then(response => response.json())
        .then(data => {
            if (data.mindmap) {
                cy.elements().remove(); // Clear the current map
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
                showMessage("Mind map not found.");
            }
        })
        .catch(() => showMessage("Error loading mind map."));
}

// Save the current mind map
function saveMindmap() {
    const mindmapName = document.getElementById('mindmap-name').value.trim();

    if (!mindmapName) {
        showMessage("Please enter a mind map name to save.");
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
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(`Mind map '${mindmapName}' saved successfully.`);
        } else {
            showMessage("Failed to save mind map.");
        }
    })
    .catch(() => showMessage("Error saving mind map."));
}

document.addEventListener('DOMContentLoaded', () => {
    loadMindmapList();

    // Attach export button listeners
    document.querySelector('.export-buttons #export-png').addEventListener('click', () => exportMindmap('png'));
    document.querySelector('.export-buttons #export-jpeg').addEventListener('click', () => exportMindmap('jpeg'));

    // Attach theme toggle listener
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
});
