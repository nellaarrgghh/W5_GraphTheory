// DOM elements
const analyzeBtn = document.getElementById('analyze-btn');
const matrixTypeSelect = document.getElementById('matrix-type');
const matrixInputText = document.getElementById('matrix-input');
const errorMessage = document.getElementById('error-message');
const cycleMatrixOut = document.getElementById('cycle-matrix-out');
const cutsetMatrixOut = document.getElementById('cutset-matrix-out');

let network = null; // Vis.js network instance

// utility to parse textarea string to a 2D array of integers
function parseMatrixText(text) {
    if (!text.trim()) return [];
    
    const rows = text.trim().split('\n');
    const matrix = rows.map(row => {
        // split by comma or space, remove empty strings, convert to numbers
        return row.split(/[\s,]+/).filter(val => val !== '').map(Number);
    });
    
    // check if it's rectangular
    const cols = matrix[0].length;
    if (matrix.some(row => row.length !== cols)) {
        throw new Error("Invalid format: All rows must have the same number of columns.");
    }
    
    return matrix;
}

// handle button click
analyzeBtn.addEventListener('click', async () => {
    errorMessage.textContent = ''; // clear old errors
    
    let matrix;
    try {
        matrix = parseMatrixText(matrixInputText.value);
        if (matrix.length === 0) {
            throw new Error("Matrix is empty.");
        }
    } catch (e) {
        errorMessage.textContent = e.message;
        return;
    }

    const payload = {
        type: matrixTypeSelect.value,
        matrix: matrix
    };

    try {
        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Analyzing...';
        
        // fetch from the Flask backend
        const response = await fetch('http://127.0.0.1:5000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Server error occurred');
        }
        
        // render results
        renderGraph(data);
        renderMatrices(data);
        
    } catch (error) {
        errorMessage.textContent = 'Connection Error: ' + error.message + ' (Is the backend running?)';
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze Graph';
    }
});

// render the visual graph using Vis.js
function renderGraph(data) {
    const { nodes, edges, tree_edges } = data;
    
    // format nodes for vis.js
    const visNodes = new vis.DataSet(
        nodes.map(nodeId => ({ 
            id: nodeId, 
            label: `v${nodeId}`,
            color: { background: '#ecf0f1', border: '#7f8c8d' },
            font: { color: '#2c3e50', size: 16 }
        }))
    );
    
    // format edges for vis.js
    const visEdges = new vis.DataSet(
        edges.map(e => {
            const isTreeEdge = tree_edges.includes(e.index);
            return {
                id: e.index,
                from: e.u,
                to: e.v,
                label: `e${e.index}`,
                font: { align: 'top' },
                // highlight spanning tree edges in red (solid), non-tree edges in blue (dashed)
                color: isTreeEdge ? { color: '#e74c3c', highlight: '#c0392b' } : { color: '#3498db', highlight: '#2980b9' },
                width: isTreeEdge ? 3 : 2,
                dashes: !isTreeEdge 
            };
        })
    );

    const container = document.getElementById('graph-network');
    const graphData = { nodes: visNodes, edges: visEdges };
    
    const options = {
        physics: {
            barnesHut: { springLength: 150, springConstant: 0.04 }
        },
        edges: {
            smooth: false
        }
    };
    
    // destroy old network if it exists to prevent memory leaks
    if (network) {
        network.destroy();
    }
    
    network = new vis.Network(container, graphData, options);
}

// generate html tables for the resulting matrices
function renderMatrices(data) {
    const { cycle_matrix, cycle_labels, cutset_matrix, cutset_labels, edges } = data;
    const numEdges = edges.length;
    
    // generate header row (e1, e2, ... en)
    let headerHTML = '<thead><tr><th></th>';
    for (let i = 1; i <= numEdges; i++) {
        headerHTML += `<th>e${i}</th>`;
    }
    headerHTML += '</tr></thead>';
    
    // generate cycle matrix table
    if (!cycle_matrix || cycle_matrix.length === 0) {
        cycleMatrixOut.innerHTML = '<i>No fundamental cycles found (Graph is a tree or forest).</i>';
    } else {
        let cycleHTML = '<table>' + headerHTML + '<tbody>';
        cycle_matrix.forEach((row, i) => {
            cycleHTML += `<tr><th>${cycle_labels[i]}</th>`;
            row.forEach(val => { cycleHTML += `<td>${val}</td>`; });
            cycleHTML += '</tr>';
        });
        cycleHTML += '</tbody></table>';
        cycleMatrixOut.innerHTML = cycleHTML;
    }
    
    // generate cut-set matrix table
    if (!cutset_matrix || cutset_matrix.length === 0) {
        cutsetMatrixOut.innerHTML = '<i>No cut-sets generated.</i>';
    } else {
        let cutsetHTML = '<table>' + headerHTML + '<tbody>';
        cutset_matrix.forEach((row, i) => {
            cutsetHTML += `<tr><th>${cutset_labels[i]}</th>`;
            row.forEach(val => { cutsetHTML += `<td>${val}</td>`; });
            cutsetHTML += '</tr>';
        });
        cutsetHTML += '</tbody></table>';
        cutsetMatrixOut.innerHTML = cutsetHTML;
    }
}

// automatically resize the graph when the browser window is resized
window.addEventListener('resize', () => {
    if (network) network.fit();
});