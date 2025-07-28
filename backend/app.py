from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

# ✅ Load environment variables from .env
load_dotenv()

# ✅ Flask app setup
app = Flask(__name__, static_folder="../frontend/build", static_url_path="/")
CORS(app)

# ✅ HuggingFace API config
HF_TOKEN = os.getenv("HF_TOKEN")
API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"}

# ✅ Serve React frontend
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

# ✅ Summarization API endpoint
@app.route("/api/summarize", methods=["POST"])
def summarize():
    data = request.get_json()
    input_text = data.get("note")

    if not input_text:
        return jsonify({"error": "Missing 'note' field in request"}), 400

    try:
        response = requests.post(API_URL, headers=HEADERS, json={"inputs": input_text})
        result = response.json()

        # ✅ Log the HuggingFace response
        print("\n[DEBUG] HuggingFace API Response:")
        print(result)

        if response.status_code == 200 and isinstance(result, list) and result and "summary_text" in result[0]:
            return jsonify({"summary": result[0]["summary_text"]})
        else:
            return jsonify({
                "error": "Unexpected response from HuggingFace API",
                "status_code": response.status_code,
                "details": result
            }), 500

    except requests.exceptions.RequestException as req_err:
        return jsonify({"error": "Request to HuggingFace API failed", "details": str(req_err)}), 500
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred", "details": str(e)}), 500

# ✅ Run app (with port for Render)
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))  # Render sets PORT
    app.run(host="0.0.0.0", port=port)
