function setupBstPage() {
    // --- METADATA & DEFINITIONS ---
    const bstDefinition = "A node-based binary tree which has the following properties: the left subtree of a node contains only nodes with keys lesser than the node's key; the right subtree contains only nodes with keys greater than the node's key; and both the left and right subtrees must also be binary search trees.";

    // --- PAGE SETUP ---
    const appContainer = document.getElementById('app-container');
    appContainer.innerHTML = `
        <div id="bst-controls" class="panel">
            <h3 class="panel-title">Controls</h3>
            <div class="algo-description-box" style="margin-bottom: 1rem;">${bstDefinition}</div>
            <div class="control-group">
                <label for="bst-value">Node Value (Number)</label>
                <input type="number" id="bst-value" placeholder="e.g., 50">
            </div>
            <div class="button-group">
                <button id="bst-insert-btn" class="btn btn-primary">Insert</button>
                <button id="bst-delete-btn" class="btn btn-primary">Delete</button>
            </div>
            <button id="bst-search-btn" class="btn btn-primary" style="width:100%; margin-top:0.5rem;">Search</button>
            <h4 class="panel-subtitle" style="margin-top:1rem;">Traversal</h4>
            <div class="button-group">
                <button id="bst-inorder-btn" class="btn btn-secondary">In-Order</button>
                <button id="bst-preorder-btn" class="btn btn-secondary">Pre-Order</button>
            </div>
            <div class="button-group" style="margin-top:0.5rem;">
                <button id="bst-postorder-btn" class="btn btn-secondary">Post-Order</button>
                <button id="bst-bfs-btn" class="btn btn-secondary">BFS</button>
            </div>
            <hr>
            <button id="bst-reset-btn" class="btn btn-secondary">Reset Tree</button>
        </div>
        <div id="visualization-panel" class="panel">
            <h3 class="panel-title">Visualization</h3>
            <div id="bst-container">
                <svg id="bst-svg-container"></svg>
            </div>
        </div>
        <div id="information-panel" class="panel">
            <h3 class="panel-title">Information</h3>
            <div class="info-box">
                <h3>Operation Steps</h3>
                <p id="animation-steps">Tree is empty. Insert a node to begin.</p>
            </div>
            <div class="info-box">
                <h3>Complexity (Average)</h3>
                <p><strong>Access/Search:</strong> O(log n)</p>
                <p><strong>Insert/Delete:</strong> O(log n)</p>
                <p><strong>Space:</strong> O(n)</p>
            </div>
        </div>
    `;

    // --- DOM REFERENCES ---
    const valueInput = document.getElementById('bst-value');
    const bstContainer = document.getElementById('bst-container');
    const animationStepsP = document.getElementById('animation-steps');
    const allButtons = document.querySelectorAll('#bst-controls button');
    
    let isAnimating = false;
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // --- BST DATA STRUCTURE ---
    class Node {
        constructor(value) {
            this.value = value;
            this.left = null;
            this.right = null;
            this.element = null;
        }
    }
    class BinarySearchTree { constructor() { this.root = null; } }
    let bst = new BinarySearchTree();

    // --- UI & RENDER FUNCTIONS ---
    function disableControls() { isAnimating = true; allButtons.forEach(b => b.disabled = true); }
    function enableControls() { isAnimating = false; allButtons.forEach(b => b.disabled = false); }

    async function highlightNode(node, color = '#F59E0B', duration = 500) {
        if (!node || !node.element) return;
        const originalColor = node.element.style.backgroundColor;
        node.element.style.backgroundColor = color;
        node.element.style.transform = 'scale(1.1)';
        await sleep(duration);
        node.element.style.backgroundColor = originalColor;
        node.element.style.transform = '';
    }
    
    function renderTree() {
        bstContainer.innerHTML = '<svg id="bst-svg-container"></svg>';
        const svg = document.getElementById('bst-svg-container');
        
        function renderNodeRecursive(node, x, y, level, parentX, parentY) {
            if (!node) return;
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'bst-node';
            nodeDiv.textContent = node.value;
            nodeDiv.id = `bst-node-${node.value}`;
            nodeDiv.style.setProperty('--left-pos', `${x}%`);
            nodeDiv.style.setProperty('--top-pos', `${y}px`);
            bstContainer.appendChild(nodeDiv);
            node.element = nodeDiv;

            if (parentX !== null) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                const containerRect = bstContainer.getBoundingClientRect();
                const startX = parentX / 100 * containerRect.width;
                const startY = parentY + 25;
                const endX = x / 100 * containerRect.width;
                const endY = y + 25;
                line.setAttribute('x1', startX);
                line.setAttribute('y1', startY);
                line.setAttribute('x2', endX);
                line.setAttribute('y2', endY);
                svg.appendChild(line);
            }
            const horizontalGap = 100 / Math.pow(2, level + 2);
            renderNodeRecursive(node.left, x - horizontalGap, y + 80, level + 1, x, y);
            renderNodeRecursive(node.right, x + horizontalGap, y + 80, level + 1, x, y);
        }
        
        // This is the line that was fixed. It now correctly calls the recursive helper.
        renderNodeRecursive(bst.root, 50, 30, 0, null, null);
    }
    
    // --- OPERATION LOGIC ---
    async function handleInsert() {
        const value = parseInt(valueInput.value);
        if (isNaN(value)) { animationStepsP.innerText = "Please enter a valid number."; return; }
        disableControls();
        animationStepsP.innerText = `Inserting ${value}...`;
        if (!bst.root) {
            bst.root = new Node(value);
            animationStepsP.innerText = `${value} inserted as the root.`;
        } else {
            let current = bst.root;
            while (true) {
                await highlightNode(current);
                if (value < current.value) {
                    animationStepsP.innerText = `${value} < ${current.value}, going left.`;
                    if (current.left === null) {
                        current.left = new Node(value);
                        animationStepsP.innerText = `Inserted ${value} as the left child of ${current.value}.`;
                        break;
                    }
                    current = current.left;
                } else if (value > current.value) {
                     animationStepsP.innerText = `${value} > ${current.value}, going right.`;
                    if (current.right === null) {
                        current.right = new Node(value);
                        animationStepsP.innerText = `Inserted ${value} as the right child of ${current.value}.`;
                        break;
                    }
                    current = current.right;
                } else {
                    animationStepsP.innerText = `Value ${value} already exists in the tree.`;
                    break;
                }
            }
        }
        renderTree();
        valueInput.value = '';
        enableControls();
    }

    async function handleSearch() {
        const value = parseInt(valueInput.value);
        if (isNaN(value)) { animationStepsP.innerText = "Please enter a valid number."; return; }
        if (!bst.root) { animationStepsP.innerText = "Tree is empty."; return; }
        disableControls();
        animationStepsP.innerText = `Searching for ${value}...`;
        let current = bst.root;
        let found = false;
        while (current) {
            await highlightNode(current);
            if (value === current.value) {
                animationStepsP.innerText = `Found ${value}!`;
                await highlightNode(current, '#22C55E');
                found = true;
                break;
            } else if (value < current.value) {
                current = current.left;
            } else {
                current = current.right;
            }
        }
        if (!found) { animationStepsP.innerText = `${value} not found in the tree.`; }
        valueInput.value = '';
        enableControls();
    }

    async function handleDelete() {
        const value = parseInt(valueInput.value);
        if (isNaN(value)) { animationStepsP.innerText = "Please enter a valid number."; return; }
        disableControls();
        animationStepsP.innerText = `Attempting to delete ${value}...`;
        function findMin(node) {
            while (node.left) node = node.left;
            return node;
        }
        async function deleteNodeRecursive(node, val) {
            if (!node) { animationStepsP.innerText = `${val} not found in tree.`; return null; }
            await highlightNode(node);
            if (val < node.value) {
                node.left = await deleteNodeRecursive(node.left, val);
            } else if (val > node.value) {
                node.right = await deleteNodeRecursive(node.right, val);
            } else {
                await highlightNode(node, '#EF4444');
                if (!node.left) return node.right;
                if (!node.right) return node.left;
                const successor = findMin(node.right);
                await highlightNode(successor, '#3B82F6');
                node.value = successor.value;
                node.right = await deleteNodeRecursive(node.right, successor.value);
            }
            return node;
        }
        bst.root = await deleteNodeRecursive(bst.root, value);
        renderTree();
        valueInput.value = '';
        enableControls();
    }
    
    async function handleTraversal(type) {
        if (!bst.root || isAnimating) return;
        disableControls();
        animationStepsP.innerText = `Performing ${type} traversal...`;
        let result = [];
        async function inorder(node) {
            if (!node) return;
            await inorder(node.left);
            result.push(node.value);
            await highlightNode(node, '#3B82F6');
            await inorder(node.right);
        }
        async function preorder(node) {
            if (!node) return;
            result.push(node.value);
            await highlightNode(node, '#3B82F6');
            await preorder(node.left);
            await preorder(node.right);
        }
        async function postorder(node) {
            if (!node) return;
            await postorder(node.left);
            await postorder(node.right);
            result.push(node.value);
            await highlightNode(node, '#3B82F6');
        }
        async function bfs() {
            let queue = [bst.root];
            while (queue.length > 0) {
                let node = queue.shift();
                result.push(node.value);
                await highlightNode(node, '#3B82F6');
                if (node.left) queue.push(node.left);
                if (node.right) queue.push(node.right);
            }
        }
        switch(type) {
            case 'In-Order': await inorder(bst.root); break;
            case 'Pre-Order': await preorder(bst.root); break;
            case 'Post-Order': await postorder(bst.root); break;
            case 'BFS': await bfs(); break;
        }
        animationStepsP.innerText = `Traversal Result: ${result.join(' → ')}`;
        enableControls();
    }
    
    // --- EVENT LISTENERS ---
    document.getElementById('bst-insert-btn').addEventListener('click', handleInsert);
    document.getElementById('bst-search-btn').addEventListener('click', handleSearch);
    document.getElementById('bst-delete-btn').addEventListener('click', handleDelete);
    document.getElementById('bst-reset-btn').addEventListener('click', () => { bst = new BinarySearchTree(); renderTree(); animationStepsP.innerText = "Tree has been reset."; });
    document.getElementById('bst-inorder-btn').addEventListener('click', () => handleTraversal('In-Order'));
    document.getElementById('bst-preorder-btn').addEventListener('click', () => handleTraversal('Pre-Order'));
    document.getElementById('bst-postorder-btn').addEventListener('click', () => handleTraversal('Post-Order'));
    document.getElementById('bst-bfs-btn').addEventListener('click', () => handleTraversal('BFS'));
}