document.getElementById("generate-mindmap").addEventListener("click", () => {
    const topic = document.getElementById("topic-input").value.trim();

    if (!topic) {
        showMessage("Please enter a topic.");
        return;
    }

    fetch("/generate-mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic })
    })
    .then(response => response.json())
    .then(data => {
        // Log the response data to inspect it
        console.log("Response from /generate-mindmap:", data);

        // Check if data.done is true and mindmap is available
        if (data.done && data.mindmap) {
            // Parse the mindmap string inside the response
            let mindmap;
            try {
                mindmap = JSON.parse(data.mindmap);  // Parsing the mindmap string into a valid object
            } catch (e) {
                console.error("Error parsing mindmap JSON:", e);
                showMessage("Error parsing mindmap data.");
                return;
            }

            // Log the parsed mindmap structure
            console.log("Parsed mindmap structure:", mindmap);

            // Check if 'nodes' and 'edges' exist and are arrays
            if (Array.isArray(mindmap.mindmap.nodes) && Array.isArray(mindmap.mindmap.edges)) {
                cy.elements().remove(); // Clear existing elements

                // Add nodes
                mindmap.mindmap.nodes.forEach(node => {
                    cy.add({
                        group: "nodes",
                        data: { id: node.id, label: node.label },
                        position: node.position
                    });
                });

                // Add edges
                mindmap.mindmap.edges.forEach(edge => {
                    cy.add({
                        group: "edges",
                        data: { source: edge.source, target: edge.target }
                    });
                });

                showMessage("Mind map generated successfully!");
            } else {
                console.error("Invalid mindmap structure: 'nodes' or 'edges' is missing or not an array.");
                showMessage("Invalid mindmap structure.");
            }
        } else {
            console.error("Invalid response data:", data);
            showMessage("Failed to generate mind map. Invalid response data.");
        }
    })
    .catch(error => {
        console.error("Error generating mind map:", error);
        showMessage("Error generating mind map.");
    });
});
