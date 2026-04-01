from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/status")
def status():
    return jsonify({"status": "running"})

app.run(port=5000)