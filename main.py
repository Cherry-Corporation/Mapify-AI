from flask import Flask, request, jsonify, send_from_directory
import os
import json

app = Flask(__name__)
DATA_FILE = "mindmaps.json"
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "templates")

# Enable Cross-Origin Resource Sharing (CORS) if needed for separate frontend/backend setups
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

if __name__ == "__main__":
    app.run(debug=True)
