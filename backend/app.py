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

# ✅ Home route
@app.route("/", methods=["GET"])
def serve():
    return send_from_directory(app.static_folder, "index.html")

# ✅ Summarization endpoint
@app.route("/api/summarize", methods=["POST"])
def summarize():
    data = request.get_json()
    input_text = data.get("note")

    if not input_text:
        return jsonify({"error": "Missing 'note' field in request"}), 400

    try:
        response = requests.post(API_URL, headers=HEADERS, json={"inputs": input_text})
        result = response.json()

        # ✅ Log the HuggingFace response to debug issues
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

# ✅ Fallback for React Router (404s)
@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, "index.html")

# ✅ Run app
if __name__ == "__main__":
    app.run(debug=True)
