from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # ✅ Permette richieste dal tuo client (CORS)

@app.route('/api/test', methods=['POST'])
def test_endpoint():
    data = request.get_json()  # Legge JSON dal body
    print("📥 Dati ricevuti dal client:", data)

    # Risposta JSON
    response = {
        "status": "ok",
        "message": f"Ciao {data.get('name', 'anonimo')}!",
        "received": data
    }
    return jsonify(response), 200

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
