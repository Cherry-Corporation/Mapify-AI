from flask import Flask, request, jsonify, send_from_directory
import os
import json
import requests

app = Flask(__name__)
DATA_FILE = "mindmaps.json"
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "templates")

from flask_cors import CORS
CORS(app)

@app.route("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")

# Initialize the data file if it doesn't exist
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'w') as f:
        json.dump({}, f)

def log_debug(message, color="white"):
    colors = {
        "white": "\033[37m", "red": "\033[31m", "green": "\033[32m", "yellow": "\033[33m",
        "blue": "\033[34m", "magenta": "\033[35m", "cyan": "\033[36m", "reset": "\033[0m"
    }
    print(f"{colors.get(color, colors['white'])}{message}{colors['reset']}")

@app.route('/save-mindmap', methods=['POST'])
def save_mindmap():
    try:
        data = request.json
        if not data:
            return jsonify({"message": "Invalid data"}), 400

        mindmap_name = data.get('name')
        if not mindmap_name:
            return jsonify({"message": "Mind map name is required"}), 400

        # Load or create mindmaps.json
        with open(DATA_FILE, 'r') as f:
            mindmaps = json.load(f)

        mindmaps[mindmap_name] = {
            "nodes": data['nodes'],
            "edges": data['edges']
        }

        # Save updated mind maps
        with open(DATA_FILE, 'w') as f:
            json.dump(mindmaps, f, indent=4)

        log_debug(f"Mind map '{mindmap_name}' saved successfully.", "green")
        return jsonify({"success": True, "message": f"Mind map '{mindmap_name}' saved successfully."}), 200
    except Exception as e:
        log_debug(f"Error saving mind map: {str(e)}", "red")
        return jsonify({"success": False, "message": f"Error saving mind map: {str(e)}"}), 500

@app.route('/mindmap/<title>', methods=['GET'])
def load_mindmap(title):
    try:
        log_debug(f"Request received to load mind map with title: {title}", "blue")

        with open(DATA_FILE, 'r') as f:
            mindmaps = json.load(f)

        if title in mindmaps:
            log_debug(f"Mind map '{title}' loaded successfully.", "green")
            return jsonify({"mindmap": mindmaps[title]}), 200
        else:
            log_debug(f"Mind map '{title}' not found.", "yellow")
            return jsonify({"message": f"Mind map '{title}' not found."}), 404
    except Exception as e:
        log_debug(f"Error loading mind map: {str(e)}", "red")
        return jsonify({"message": f"Error loading mind map: {str(e)}"}), 500

@app.route('/mindmaps', methods=['GET'])
def list_mindmaps():
    try:
        with open(DATA_FILE, 'r') as f:
            mindmaps = json.load(f)
        return jsonify({"mindmaps": list(mindmaps.keys())}), 200
    except Exception as e:
        log_debug(f"Error listing mind maps: {str(e)}", "red")
        return jsonify({"message": f"Error listing mind maps: {str(e)}"}), 500



OLLAMA_API_URL = "http://localhost:11434/api/generate"  # Adjust if Ollama's API URL is different

@app.route('/generate-mindmap', methods=['POST'])
def generate_mindmap():
    try:
        # Get the topic from the request JSON
        data = request.json
        topic_name = data.get("topic", "").strip()

        if not topic_name:
            return jsonify({"success": False, "message": "Topic is required."}), 400

        # Prepare the prompt with the topic
        prompt = f"""
        Please create a mind map in the following JSON format for the topic of **{topic_name}**.

        The mind map should include:

        1. **Main Topic** (centered at the start).
        2. **Key subtopics** that are essential to the topic. For example, in the case of Photosynthesis, the subtopics would include:
           - **Definition/Overview** of {topic_name}.
           - **Importance/Significance** of {topic_name}.
           - **Core Processes** (e.g., if it's Photosynthesis, include subtopics like Light Reaction and Calvin Cycle).
           - **Examples** related to {topic_name} in real-world applications.
           - Additional relevant subtopics as necessary.

        Each subtopic should be linked to the main topic with connections (edges) that make sense for the relationships.

        The mind map structure should follow this JSON format:

        {{
          "mindmap": {{
            "nodes": [
              {{
                "id": "main-topic",
                "label": "{topic_name}",
                "color": "rgb(83,53,74)",
                "position": {{
                  "x": 500,
                  "y": 300
                }}
              }}
            ],
            "edges": [
              {{
                "source": "main-topic",
                "target": "subtopic1"
              }}
            ]
          }}
        }}

        Ensure that the nodes are organized clearly with an appropriate distance between them, and edges indicate logical relationships between concepts.ALSO JUST PUT THE JSON NO TEXT BEFORE!!
        """

        # Send request to Ollama API
        headers = {'Content-Type': 'application/json'}
        request_data = {
            "model": "llama3.1:8b",
            "prompt": prompt,
            "stream": False
        }

        response = requests.post(OLLAMA_API_URL, headers=headers, data=json.dumps(request_data))
        
        # Check the response status and handle it
        if response.status_code == 200:
            response_data = response.json()

            if "response" in response_data:
                mindmap_json = response_data["response"]
                return jsonify({"done": True, "mindmap": mindmap_json}), 200
            else:
                return jsonify({"done": False, "message": "Failed to generate mind map."}), 500
        else:
            return jsonify({"done": False, "message": f"Error: {response.status_code}, {response.text}"}), 500

    except requests.exceptions.RequestException as e:
        return jsonify({"success": False, "message": f"Network error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"success": False, "message": f"Internal server error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
