# GraphTheoryW6_Group6
---
## Group Members

| Name                     | NRP        |
| ------------------------ | ---------- |
| Lina Fatima Azzahra Badr | 5025251168 |
| Naila Sa'ada Cahyani     | 5025251258 |

---

This repository contains the backend and frontend code for the Graph Visualizer assignment (Week 5 Graph Theory).

## Prerequisite
To run the backend, you need Python and pip installed.
The frontend requires a modern web browser, and optionally a local server (like Live Server or python -m http.server).

### Install dependencies
Navigate to the `backend` directory and install the required Python packages:

```bash
cd backend
pip install -r requirements.txt
```

## How to Run
1. **Start the backend server:**
   ```bash
   cd backend
   python app.py
   ```
   The backend will run on `http://127.0.0.1:5000`.

2. **Open the frontend:**
   Navigate to the `frontend` folder and open `index.html` in your web browser. Or start a local server:
   ```bash
   cd frontend
   npx serve .
   ```

## Sample Input/Output

### `POST /api/analyze`
**Request:**
```json
{
  "type": "adjacency",
  "matrix": [
    [0, 1, 0],
    [1, 0, 1],
    [0, 1, 0]
  ]
}
```

**Response:**
```json
{
  "cutset_labels": ["C_1", "C_2"],
  "cutset_matrix": [
    [1, 0],
    [0, 1]
  ],
  "cycle_labels": [],
  "cycle_matrix": [],
  "edges": [
    {"index": 1, "u": 1, "v": 2},
    {"index": 2, "u": 2, "v": 3}
  ],
  "nodes": [1, 2, 3],
  "tree_edges": [1, 2]
}
```

The `cycle_matrix` represents the fundamental cycle matrix based on the spanning tree, and the `cutset_matrix` represents the cut-set matrix corresponding to the tree edges.

## Web Results & Example Runs

### Screenshots / UI Results
<!-- please add screenshots of the web interface results here -->
*Add images here...*

### Example Runs
<!-- please add additional example inputs and their corresponding output / visual results here -->
*Add your examples here...*
