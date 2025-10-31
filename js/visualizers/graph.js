function setupGraphPage() {
    // --- METADATA ---
    const graphDefinition = "A non-linear data structure consisting of nodes (or vertices) and edges that connect pairs of nodes. Graphs can be directed or undirected, and edges can have weights.";

    // --- PAGE SETUP ---
    const appContainer = document.getElementById('app-container');
    appContainer.innerHTML = `
        <div id="graph-controls" class="panel">
            <h3 class="panel-title">Controls</h3>
            <div class="algo-description-box" style="margin-bottom: 1rem;">${graphDefinition}</div>
            <div class="control-group">
                <label for="graph-type-select">Graph Type</label>
                <select id="graph-type-select">
                    <option value="undirected">Undirected</option>
                    <option value="directed">Directed</option>
                </select>
            </div>
            <h4 class="panel-subtitle" style="margin-top:1rem;">Actions</h4>
            <p style="font-size: 0.8rem; color: var(--text-light); margin-bottom: 0.5rem;">Click on the visualization area to add a node. Click two nodes to add an edge.</p>
             <div class="control-group">
                <label for="edge-weight">Edge Weight (optional)</label>
                <input type="number" id="edge-weight" placeholder="e.g., 5" value="1">
            </div>
            <h4 class="panel-subtitle" style="margin-top:1rem;">Traversal & Pathfinding</h4>
            <div class="control-group">
                <label for="start-node">Start Node</label>
                <input type="number" id="start-node" placeholder="Node ID">
            </div>
            <div class="button-group">
                <button id="graph-bfs-btn" class="btn-secondary btn">Run BFS</button>
                <button id="graph-dfs-btn" class="btn-secondary btn">Run DFS</button>
            </div>
             <div class="control-group" style="margin-top:0.5rem;">
                <label for="end-node">End Node (for Dijkstra)</label>
                <input type="number" id="end-node" placeholder="Node ID">
            </div>
            <button id="graph-dijkstra-btn" class="btn-primary btn" style="width:100%; margin-top:0.5rem;">Run Dijkstra's</button>
            <hr>
            <button id="graph-reset-btn" class="btn btn-secondary">Reset Graph</button>
        </div>
        <div id="visualization-panel" class="panel">
            <h3 class="panel-title">Visualization</h3>
            <div id="graph-container">
                <svg id="graph-svg-container">
                     <defs><marker id="arrowhead" markerWidth="5" markerHeight="3.5" refX="5" refY="1.75" orient="auto"><polygon points="0 0, 5 1.75, 0 3.5" /></marker></defs>
                </svg>
            </div>
        </div>
        <div id="information-panel" class="panel">
            <h3 class="panel-title">Information</h3>
            <div class="info-box">
                <h3>Operation Steps</h3>
                <p id="animation-steps">Click on the canvas to create your graph.</p>
            </div>
            <div class="info-box">
                <h3>Adjacency List</h3>
                <pre id="adjacency-list"><code>{}</code></pre>
            </div>
        </div>
    `;

    // --- DOM REFERENCES ---
    const graphContainer = document.getElementById('graph-container');
    const svgContainer = document.getElementById('graph-svg-container');
    const animationStepsP = document.getElementById('animation-steps');
    const adjacencyListPre = document.getElementById('adjacency-list').querySelector('code');
    const allButtons = document.querySelectorAll('#graph-controls button');
    
    let isAnimating = false;
    let nodeCounter = 0;
    let nodes = {};
    let adj = {};
    let selectedNode = null;
    
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // --- UI & RENDER FUNCTIONS ---
    function disableControls() { isAnimating = true; allButtons.forEach(b => b.disabled = true); }
    function enableControls() { isAnimating = false; allButtons.forEach(b => b.disabled = false); }
    
    function updateAdjacencyList() {
        let text = "{\n";
        for (const node in adj) {
            text += `  ${node}: [${adj[node].map(e => `${e.neighbor}(${e.weight})`).join(', ')}]\n`;
        }
        text += "}";
        adjacencyListPre.textContent = text;
    }

    function drawEdges() {
        svgContainer.innerHTML = '<defs><marker id="arrowhead" markerWidth="5" markerHeight="3.5" refX="5" refY="1.75" orient="auto"><polygon points="0 0, 5 1.75, 0 3.5" /></marker></defs>';
        const isDirected = document.getElementById('graph-type-select').value === 'directed';

        for (const u in adj) {
            for (const edge of adj[u]) {
                const v = edge.neighbor;
                if (!isDirected && u > v) continue;
                const nodeU = nodes[u];
                const nodeV = nodes[v];
                
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', nodeU.x);
                line.setAttribute('y1', nodeU.y);
                line.setAttribute('x2', nodeV.x);
                line.setAttribute('y2', nodeV.y);
                line.id = `edge-${u}-${v}`;
                if (isDirected) line.setAttribute('marker-end', 'url(#arrowhead)');
                svgContainer.appendChild(line);

                const weightText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                weightText.setAttribute('x', (nodeU.x + nodeV.x) / 2);
                weightText.setAttribute('y', (nodeU.y + nodeV.y) / 2 - 5);
                weightText.textContent = edge.weight;
                svgContainer.appendChild(weightText);
            }
        }
    }

    function clearDistances() {
        document.querySelectorAll('.node-distance').forEach(el => el.remove());
    }

    // --- EVENT HANDLERS ---
    graphContainer.addEventListener('click', (e) => {
        if (isAnimating) return;
        if (e.target.classList.contains('graph-node')) return;

        const rect = graphContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const newNodeId = nodeCounter++;
        const nodeEl = document.createElement('div');
        nodeEl.className = 'graph-node';
        nodeEl.textContent = newNodeId;
        nodeEl.style.left = `${x - 22.5}px`;
        nodeEl.style.top = `${y - 22.5}px`;
        nodeEl.dataset.id = newNodeId;
        
        graphContainer.appendChild(nodeEl);
        nodes[newNodeId] = { x: x, y: y, element: nodeEl };
        adj[newNodeId] = [];

        nodeEl.addEventListener('click', onNodeClick);
        updateAdjacencyList();
    });

    function onNodeClick(e) {
        if (isAnimating) return;
        const clickedNodeId = e.target.dataset.id;
        
        if (selectedNode === null) {
            selectedNode = clickedNodeId;
            nodes[selectedNode].element.classList.add('selected');
            animationStepsP.innerText = `Node ${selectedNode} selected. Click another node to create an edge.`;
        } else {
            if (selectedNode === clickedNodeId) {
                nodes[selectedNode].element.classList.remove('selected');
                selectedNode = null;
                animationStepsP.innerText = `Node selection cancelled.`;
                return;
            }
            const weightInput = document.getElementById('edge-weight');
            const weight = parseInt(weightInput.value);
            if(isNaN(weight)) {
                animationStepsP.innerText = "Please enter a valid edge weight.";
                return;
            }
            adj[selectedNode].push({ neighbor: clickedNodeId, weight: weight });
            if (document.getElementById('graph-type-select').value === 'undirected') {
                adj[clickedNodeId].push({ neighbor: selectedNode, weight: weight });
            }
            
            animationStepsP.innerText = `Edge created between ${selectedNode} and ${clickedNodeId}.`;
            nodes[selectedNode].element.classList.remove('selected');
            selectedNode = null;
            
            drawEdges();
            updateAdjacencyList();
            weightInput.value = 1;
        }
    }

    // --- ALGORITHMS ---
    async function runTraversal(algo) {
        const startNodeId = parseInt(document.getElementById('start-node').value);
        if (isNaN(startNodeId) || !nodes[startNodeId]) {
            animationStepsP.innerText = "Please enter a valid start node ID.";
            return;
        }
        handleReset(false); // Soft reset to clear colors
        disableControls();
        animationStepsP.innerText = `Starting ${algo.toUpperCase()} from node ${startNodeId}...`;
        const visited = new Set();
        let traversalResult = [];

        if (algo === 'bfs') {
            const queue = [startNodeId];
            visited.add(String(startNodeId));
            while (queue.length > 0) {
                const u = queue.shift();
                traversalResult.push(u);
                nodes[u].element.style.backgroundColor = '#22C55E';
                await sleep(500);
                for (const edge of adj[u]) {
                    const v = edge.neighbor;
                    if (!visited.has(String(v))) {
                        visited.add(String(v));
                        document.getElementById(`edge-${u}-${v}`)?.setAttribute('stroke', '#F59E0B');
                        await sleep(300);
                        queue.push(v);
                    }
                }
            }
        } else { // DFS
            const stack = [startNodeId];
            while(stack.length > 0) {
                const u = stack.pop();
                if(!visited.has(String(u))) {
                    visited.add(String(u));
                    traversalResult.push(u);
                    nodes[u].element.style.backgroundColor = '#22C55E';
                    await sleep(500);
                    const neighbors = adj[u].map(e => e.neighbor).reverse();
                    for (const v of neighbors) {
                        if (!visited.has(String(v))) {
                            document.getElementById(`edge-${u}-${v}`)?.setAttribute('stroke', '#F59E0B');
                            await sleep(300);
                            stack.push(v);
                        }
                    }
                }
            }
        }
        animationStepsP.innerText = `${algo.toUpperCase()} Result: ${traversalResult.join(' → ')}`;
        enableControls();
    }
    
    async function runDijkstra() {
        const startNodeId = parseInt(document.getElementById('start-node').value);
        const endNodeId = parseInt(document.getElementById('end-node').value);
        if (isNaN(startNodeId) || !nodes[startNodeId] || isNaN(endNodeId) || !nodes[endNodeId]) {
            animationStepsP.innerText = "Please enter valid Start and End node IDs.";
            return;
        }
        
        handleReset(false); // Soft reset
        disableControls();
        animationStepsP.innerText = `Running Dijkstra from ${startNodeId} to ${endNodeId}...`;

        let distances = {};
        let prev = {};
        let pq = new Set();

        for (const nodeId in nodes) {
            distances[nodeId] = Infinity;
            prev[nodeId] = null;
            pq.add(nodeId);
        }
        distances[startNodeId] = 0;

        while (pq.size > 0) {
            let u = null;
            // Get node with smallest distance
            for (const nodeId of pq) {
                if (u === null || distances[nodeId] < distances[u]) {
                    u = nodeId;
                }
            }

            if (u === null || distances[u] === Infinity) break;

            pq.delete(u);
            nodes[u].element.style.backgroundColor = '#3B82F6'; // Visited color

            // Update distance on UI
            const distEl = document.createElement('div');
            distEl.className = 'node-distance';
            distEl.textContent = distances[u];
            nodes[u].element.appendChild(distEl);

            if (u == endNodeId) {
                animationStepsP.innerText = `Reached destination! Shortest distance: ${distances[u]}.`;
                break;
            }
            
            await sleep(500);

            for (const edge of adj[u]) {
                const v = edge.neighbor;
                if (pq.has(String(v))) {
                    let alt = distances[u] + edge.weight;
                    if (alt < distances[v]) {
                        distances[v] = alt;
                        prev[v] = u;
                        document.getElementById(`edge-${u}-${v}`)?.setAttribute('stroke', '#F59E0B');
                        animationStepsP.innerText = `Found shorter path to ${v}. New distance: ${alt}`;
                        await sleep(400);
                    }
                }
            }
        }

        // Reconstruct and highlight the path
        let path = [];
        let current = String(endNodeId);
        while (current !== null) {
            path.unshift(current);
            current = prev[current];
        }

        if (path[0] == startNodeId) {
            for (let i = 0; i < path.length - 1; i++) {
                const u = path[i];
                const v = path[i + 1];
                document.getElementById(`edge-${u}-${v}`)?.classList.add('path');
                document.getElementById(`edge-${v}-${u}`)?.classList.add('path');
                nodes[v].element.style.backgroundColor = '#F59E0B';
            }
            nodes[startNodeId].element.style.backgroundColor = '#F59E0B';
        } else {
             animationStepsP.innerText += ` No path found from ${startNodeId} to ${endNodeId}.`;
        }
        
        enableControls();
    }
    
    function handleReset(fullReset = true) {
        isAnimating = false;
        if (fullReset) {
            nodeCounter = 0;
            nodes = {}; adj = {}; selectedNode = null;
            graphContainer.innerHTML = '<svg id="graph-svg-container"><defs><marker id="arrowhead" markerWidth="5" markerHeight="3.5" refX="5" refY="1.75" orient="auto"><polygon points="0 0, 5 1.75, 0 3.5" /></marker></defs></svg>';
            updateAdjacencyList();
            animationStepsP.innerText = "Graph has been reset.";
        } else { // Soft reset for clearing colors/distances
            clearDistances();
            drawEdges();
            for(const nodeId in nodes) {
                nodes[nodeId].element.style.backgroundColor = '';
            }
        }
    }

    // --- EVENT LISTENERS ---
    document.getElementById('graph-bfs-btn').addEventListener('click', () => runTraversal('bfs'));
    document.getElementById('graph-dfs-btn').addEventListener('click', () => runTraversal('dfs'));
    document.getElementById('graph-dijkstra-btn').addEventListener('click', runDijkstra);
    document.getElementById('graph-reset-btn').addEventListener('click', () => handleReset(true));
    document.getElementById('graph-type-select').addEventListener('change', () => handleReset(true));
}