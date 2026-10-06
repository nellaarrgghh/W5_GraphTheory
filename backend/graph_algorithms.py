import numpy as np
import networkx as nx

def parse_adjacency_matrix(adj_matrix):
    adj = np.array(adj_matrix)
    num_nodes = adj.shape[0]
    G = nx.Graph()
    G.add_nodes_from(range(1, num_nodes + 1))
    
    edges = []
    edge_index = 1
    # For undirected graph, parse upper triangle to avoid duplicate edges
    for i in range(num_nodes):
        for j in range(i, num_nodes):
            if adj[i][j] != 0:
                u, v = i + 1, j + 1
                edges.append((u, v, edge_index))
                G.add_edge(u, v, index=edge_index)
                edge_index += 1
                
    return G, edges

def parse_incidence_matrix(inc_matrix):
    inc = np.array(inc_matrix)
    num_nodes, num_edges = inc.shape
    G = nx.Graph()
    G.add_nodes_from(range(1, num_nodes + 1))
    
    edges = []
    for j in range(num_edges):
        col = inc[:, j]
        nodes = np.where(col != 0)[0]
        if len(nodes) == 2:
            u, v = nodes[0] + 1, nodes[1] + 1
            edges.append((u, v, j + 1))
            G.add_edge(u, v, index=j + 1)
        elif len(nodes) == 1:
            # Self loop
            u = nodes[0] + 1
            edges.append((u, u, j + 1))
            G.add_edge(u, u, index=j + 1)
            
    return G, edges

def get_fundamental_matrices(G):
    # Find spanning forest
    T = nx.Graph()
    for component in nx.connected_components(G):
        sub_G = G.subgraph(component)
        # Use minimum_spanning_tree to get a specific spanning tree
        sub_T = nx.minimum_spanning_tree(sub_G)
        T = nx.compose(T, sub_T)
        
    num_edges = G.number_of_edges()
    
    tree_edges = [(u, v, d['index']) for u, v, d in T.edges(data=True)]
    tree_edge_indices = {d['index'] for u, v, d in T.edges(data=True)}
    
    all_edges = [(u, v, d['index']) for u, v, d in G.edges(data=True)]
    all_edges.sort(key=lambda x: x[2]) # sort by edge index
    
    non_tree_edges = [e for e in all_edges if e[2] not in tree_edge_indices]
    
    cycle_matrix = []
    cycle_labels = []
    
    for u, v, idx in non_tree_edges:
        try:
            path = nx.shortest_path(T, source=u, target=v)
        except nx.NetworkXNoPath:
            continue
            
        row = [0] * num_edges
        # the edges are 1-indexed, so edge index idx goes to column idx-1
        row[idx - 1] = 1 
        
        for i in range(len(path) - 1):
            n1, n2 = path[i], path[i+1]
            edge_data = T.get_edge_data(n1, n2)
            row[edge_data['index'] - 1] = 1
            
        cycle_matrix.append(row)
        cycle_labels.append(f"Z_{idx}")
        
    cutset_matrix = []
    cutset_labels = []
    
    for u, v, idx in tree_edges:
        T_copy = T.copy()
        T_copy.remove_edge(u, v)
        
        comp_u = nx.node_connected_component(T_copy, u)
        comp_v = nx.node_connected_component(T_copy, v)
        
        row = [0] * num_edges
        row[idx - 1] = 1 
        
        for nu, nv, nidx in non_tree_edges:
            if (nu in comp_u and nv in comp_v) or (nu in comp_v and nv in comp_u):
                row[nidx - 1] = 1
                
        cutset_matrix.append(row)
        cutset_labels.append(f"C_{idx}")
        
    return {
        "cycle_matrix": cycle_matrix,
        "cycle_labels": cycle_labels,
        "cutset_matrix": cutset_matrix,
        "cutset_labels": cutset_labels,
        "tree_edges": [idx for _, _, idx in tree_edges],
        "edges": [{"u": u, "v": v, "index": idx} for u, v, idx in all_edges],
        "nodes": list(G.nodes())
    }
