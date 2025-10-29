function setupLinkedListPage() {
    // --- METADATA ---
    const definitions = {
        singly: "A linear data structure where elements are linked using a 'next' pointer. Traversal is unidirectional.",
        doubly: "Each element has a 'next' pointer and a 'prev' pointer, allowing for bidirectional traversal.",
        'circular-singly': "A singly linked list where the last node's 'next' pointer points back to the head node.",
        'circular-doubly': "A doubly linked list where the last node's 'next' points to the head, and the head's 'prev' points to the last node."
    };

    // --- PAGE SETUP ---
    const appContainer = document.getElementById('app-container');
    appContainer.innerHTML = `
        <div id="ll-controls" class="panel">
            <h3 class="panel-title">Controls</h3>
            <div class="control-group">
                <label for="ll-type-select">List Type</label>
                <select id="ll-type-select">
                    <option value="singly">Singly Linked List</option>
                    <option value="doubly">Doubly Linked List</option>
                    <option value="circular-singly">Circular Singly</option>
                    <option value="circular-doubly">Circular Doubly</option>
                </select>
            </div>
            <div class="algo-description-box" style="margin-bottom: 1rem;">${definitions.singly}</div>
            <div class="control-group">
                <label for="ll-value">Value</label>
                <input type="text" id="ll-value" placeholder="Enter value">
            </div>
            <div class="control-group">
                <label for="ll-index">Index (for Insert/Delete)</label>
                <input type="number" id="ll-index" placeholder="Enter index">
            </div>
            <h4 class="panel-subtitle" style="margin-top:1rem;">Operations</h4>
            <div class="button-group">
                <button id="ll-insert-head-btn" class="btn btn-primary">Insert Head</button>
                <button id="ll-insert-tail-btn" class="btn btn-primary">Insert Tail</button>
            </div>
            <button id="ll-insert-index-btn" class="btn btn-primary" style="width:100%; margin-top:0.5rem;">Insert at Index</button>
            <div class="button-group" style="margin-top:0.5rem;">
                <button id="ll-delete-head-btn" class="btn btn-primary">Delete Head</button>
                <button id="ll-delete-tail-btn" class="btn btn-primary">Delete Tail</button>
            </div>
            <button id="ll-delete-index-btn" class="btn btn-primary" style="width:100%; margin-top:0.5rem;">Delete at Index</button>
            <hr>
            <button id="ll-reset-btn" class="btn btn-secondary">Reset List</button>
        </div>
        <div id="visualization-panel" class="panel" style="justify-content: center; align-items: center; position:relative;">
            <h3 class="panel-title" style="align-self: flex-start;">Visualization</h3>
            <div id="ll-head-pointer" class="ll-head-pointer">HEAD ↓</div>
            <div id="ll-tail-pointer" class="ll-tail-pointer">↑ TAIL</div>
            <div id="linked-list-container"></div>
            <svg id="ll-circular-svg">
                <defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" /></marker></defs>
            </svg>
        </div>
        <div id="information-panel" class="panel">
            <h3 class="panel-title">Information</h3>
            <div class="info-box">
                <h3>Operation Steps</h3>
                <p id="animation-steps">Select a list type and use controls to add nodes.</p>
            </div>
            <div class="info-box">
                <h3>Complexity</h3>
                <p><strong>Access/Search:</strong> O(n)</p>
                <p><strong>Insert/Delete (Head):</strong> O(1)</p>
                <p><strong>Insert/Delete (Tail):</strong> O(1) for Doubly/Circular, O(n) for Singly</p>
            </div>
        </div>
    `;

    // --- DOM REFERENCES ---
    const valueInput = document.getElementById('ll-value');
    const indexInput = document.getElementById('ll-index');
    const llContainer = document.getElementById('linked-list-container');
    const animationStepsP = document.getElementById('animation-steps');
    const headPointer = document.getElementById('ll-head-pointer');
    const tailPointer = document.getElementById('ll-tail-pointer');
    const typeSelect = document.getElementById('ll-type-select');
    const descriptionBox = document.querySelector('.algo-description-box');
    const svg = document.getElementById('ll-circular-svg');
    const allButtons = document.querySelectorAll('#ll-controls button');
    const resetBtn = document.getElementById('ll-reset-btn');

    let linkedListData = [];
    let isAnimating = false;
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // --- UI & RENDER FUNCTIONS ---
    function renderList() {
        const type = typeSelect.value;
        llContainer.innerHTML = '';
        svg.innerHTML = '<defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" /></marker></defs>';

        if (linkedListData.length === 0) {
            llContainer.innerHTML = '<div class="ll-node" style="background-color: var(--text-light);">NULL</div>';
            updatePointers();
            return;
        }

        linkedListData.forEach((value, i) => {
            const nodeContainer = document.createElement('div');
            nodeContainer.className = `ll-node-container ${type}`;
            nodeContainer.innerHTML = `
                <div class="ll-node-main">
                    <div class="ll-node" id="ll-node-${i}">
                        <span class="ll-index">${i}</span>
                        ${value}
                    </div>
                    <div class="ll-pointer-next"></div>
                </div>
                <div class="ll-pointer-prev"></div>
            `;
            llContainer.appendChild(nodeContainer);
        });
        
        setTimeout(() => {
            updatePointers();
            if (type.includes('circular')) drawCircularPointers();
        }, 100);
    }
    
    function updatePointers() {
        if (linkedListData.length === 0) {
            headPointer.classList.remove('visible');
            tailPointer.classList.remove('visible');
            return;
        }
        headPointer.classList.add('visible');
        tailPointer.classList.add('visible');

        const firstNode = llContainer.firstChild?.querySelector('.ll-node');
        const lastNode = llContainer.lastChild?.querySelector('.ll-node');
        const panel = document.getElementById('visualization-panel');

        if (!firstNode || !lastNode || !panel) return;

        const panelRect = panel.getBoundingClientRect();
        
        const firstNodeRect = firstNode.getBoundingClientRect();
        // CHANGED: Increased the offset from -30 to -50 to prevent overlap
        const headTop = firstNodeRect.top - panelRect.top - 50; 
        const headLeft = firstNodeRect.left - panelRect.left + (firstNode.offsetWidth / 2) - (headPointer.offsetWidth / 2);
        
        headPointer.style.top = `${headTop}px`;
        headPointer.style.left = `${headLeft}px`;

        const lastNodeRect = lastNode.getBoundingClientRect();
        // CHANGED: Increased the offset from +5 to +25 for more space
        const tailTop = lastNodeRect.top - panelRect.top + lastNode.offsetHeight + 25; 
        const tailLeft = lastNodeRect.left - panelRect.left + (lastNode.offsetWidth / 2) - (tailPointer.offsetWidth / 2);

        tailPointer.style.top = `${tailTop}px`;
        tailPointer.style.left = `${tailLeft}px`;
    }

    function drawCircularPointers() {
        if (linkedListData.length < 1) return;
        const type = typeSelect.value;
        const firstNode = llContainer.firstChild?.querySelector('.ll-node');
        const lastNode = llContainer.lastChild?.querySelector('.ll-node');
        const panel = document.getElementById('visualization-panel');
        if (!firstNode || !lastNode || !panel) return;

        const panelRect = panel.getBoundingClientRect();
        const firstNodeRect = firstNode.getBoundingClientRect();
        const lastNodeRect = lastNode.getBoundingClientRect();

        if (type === 'circular-singly' || type === 'circular-doubly') {
            const startX = (lastNodeRect.right - panelRect.left);
            const startY = (lastNodeRect.top - panelRect.top) + lastNode.offsetHeight / 2;
            const endX = (firstNodeRect.left - panelRect.left);
            const endY = (firstNodeRect.top - panelRect.top) + firstNode.offsetHeight / 2;
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = `M ${startX} ${startY} C ${startX + 50} ${startY + 60}, ${endX - 50} ${endY + 60}, ${endX} ${endY}`;
            path.setAttribute('d', d);
            svg.appendChild(path);
        }
        if (type === 'circular-doubly') {
            const startX = (firstNodeRect.left - panelRect.left);
            const startY = (firstNodeRect.top - panelRect.top) + firstNode.offsetHeight / 2;
            const endX = (lastNodeRect.right - panelRect.left);
            const endY = (lastNodeRect.top - panelRect.top) + lastNode.offsetHeight / 2;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = `M ${startX} ${startY} C ${startX - 50} ${startY - 60}, ${endX + 50} ${endY - 60}, ${endX} ${endY}`;
            path.setAttribute('d', d);
            svg.appendChild(path);
        }
    }

    async function highlightNode(index, color = '#F59E0B', duration = 400) {
        const node = document.getElementById(`ll-node-${index}`);
        if (!node) return;
        const originalColor = node.style.backgroundColor;
        node.style.backgroundColor = color;
        node.style.transform = 'scale(1.1)';
        await sleep(duration);
        node.style.backgroundColor = originalColor;
        node.style.transform = '';
    }
    
    function disableControls() { isAnimating = true; allButtons.forEach(b => b.disabled = true); }
    function enableControls() { isAnimating = false; allButtons.forEach(b => b.disabled = false); }

    // --- OPERATION LOGIC ---
    async function onInsert(where) {
        if (isAnimating) return;
        const value = valueInput.value;
        const index = parseInt(indexInput.value);

        if (!value) { animationStepsP.innerText = "Please enter a value."; return; }
        if ((where === 'index') && (isNaN(index) || index < 0 || index > linkedListData.length)) {
            animationStepsP.innerText = `Error: Index must be between 0 and ${linkedListData.length}.`;
            return;
        }

        disableControls();
        let newIndex = 0;

        switch (where) {
            case 'head':
                animationStepsP.innerText = `Inserting ${value} at the head...`;
                linkedListData.unshift(value);
                newIndex = 0;
                break;
            case 'tail':
                animationStepsP.innerText = `Inserting ${value} at the tail...`;
                linkedListData.push(value);
                newIndex = linkedListData.length - 1;
                break;
            case 'index':
                animationStepsP.innerText = `Traversing to insert at index ${index}...`;
                for (let i = 0; i < index; i++) await highlightNode(i, '#3B82F6', 200);
                linkedListData.splice(index, 0, value);
                newIndex = index;
                break;
        }

        renderList();
        await sleep(150);
        await highlightNode(newIndex, '#22C55E');
        animationStepsP.innerText = `Value ${value} inserted at index ${newIndex}.`;
        valueInput.value = '';
        indexInput.value = '';
        enableControls();
    }

    async function onDelete(where) {
        if (isAnimating || linkedListData.length === 0) return;
        const index = parseInt(indexInput.value);
        
        if ((where === 'index') && (isNaN(index) || index < 0 || index >= linkedListData.length)) {
            animationStepsP.innerText = `Error: Index must be between 0 and ${linkedListData.length - 1}.`;
            return;
        }

        disableControls();
        let deletedValue;
        let deleteIndex;

        switch (where) {
            case 'head':
                deleteIndex = 0;
                break;
            case 'tail':
                deleteIndex = linkedListData.length - 1;
                break;
            case 'index':
                deleteIndex = index;
                break;
        }
        
        animationStepsP.innerText = `Traversing to delete at index ${deleteIndex}...`;
        for (let i = 0; i < deleteIndex; i++) await highlightNode(i, '#3B82F6', 200);

        deletedValue = linkedListData[deleteIndex];
        animationStepsP.innerText = `Deleting node ${deletedValue} at index ${deleteIndex}...`;
        await highlightNode(deleteIndex, '#EF4444');
        
        linkedListData.splice(deleteIndex, 1);
        renderList();

        animationStepsP.innerText = `Node ${deletedValue} deleted.`;
        indexInput.value = '';
        enableControls();
    }

    function handleReset() {
        linkedListData = [];
        renderList();
        animationStepsP.innerText = "Linked List has been reset.";
    }
    
    function onTypeChange() {
        descriptionBox.textContent = definitions[typeSelect.value];
        handleReset();
    }

    // --- EVENT LISTENERS ---
    typeSelect.addEventListener('change', onTypeChange);
    document.getElementById('ll-insert-head-btn').addEventListener('click', () => onInsert('head'));
    document.getElementById('ll-insert-tail-btn').addEventListener('click', () => onInsert('tail'));
    document.getElementById('ll-insert-index-btn').addEventListener('click', () => onInsert('index'));
    document.getElementById('ll-delete-head-btn').addEventListener('click', () => onDelete('head'));
    document.getElementById('ll-delete-tail-btn').addEventListener('click', () => onDelete('tail'));
    document.getElementById('ll-delete-index-btn').addEventListener('click', () => onDelete('index'));
    resetBtn.addEventListener('click', handleReset);

    // Initial render
    renderList();
}