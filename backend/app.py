from flask import Flask, request, jsonify
from flask_cors import CORS
from graph_algorithms import parse_adjacency_matrix, parse_incidence_matrix, get_fundamental_matrices

app = Flask(__name__)
CORS(app)

@app.route('/api/analyze', methods=['POST'])
def analyze_graph():
    data = request.json
    matrix_type = data.get('type') # 'adjacency' or 'incidence'
    matrix = data.get('matrix')
    
    if not matrix or not matrix_type:
        return jsonify({"error": "Matrix and type are required"}), 400
        
    try:
        if matrix_type == 'adjacency':
            G, edges = parse_adjacency_matrix(matrix)
        elif matrix_type == 'incidence':
            G, edges = parse_incidence_matrix(matrix)
        else:
            return jsonify({"error": "Invalid matrix type"}), 400
            
        result = get_fundamental_matrices(G)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
