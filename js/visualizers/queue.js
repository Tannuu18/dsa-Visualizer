function setupQueuePage() {
    // --- METADATA (EXPANDED FOR ALL QUEUE TYPES) ---
    const definitions = {
        standard: "A FIFO (First-In, First-Out) data structure. The first element added is the first one to be removed.",
        circular: "A queue with a fixed size where the rear pointer can wrap around to the front, reusing empty space.",
        priority: "Elements are dequeued based on their priority (in this case, smaller numbers have higher priority).",
        deque: "A Double-Ended Queue (Deque) where elements can be added or removed from both the front and the rear."
    };

    // --- PAGE SETUP ---
    const appContainer = document.getElementById('app-container');
    appContainer.innerHTML = `
        <div id="queue-controls" class="panel">
            <h3 class="panel-title">Controls</h3>
            <div class="control-group">
                <label for="queue-type-select">Queue Type</label>
                <select id="queue-type-select">
                    <option value="standard">Standard Queue</option>
                    <option value="circular">Circular Queue</option>
                    <option value="priority">Priority Queue</option>
                    <option value="deque">Deque (Double-Ended)</option>
                </select>
            </div>
            <div class="control-group">
                <label for="queue-value">Value</label>
                <input type="text" id="queue-value" placeholder="Enter a value">
            </div>
            <div class="button-group">
                <button id="queue-enqueue-btn" class="btn btn-primary">Enqueue (Rear)</button>
                <button id="queue-dequeue-btn" class="btn btn-primary">Dequeue (Front)</button>
            </div>
            <div class="button-group hidden" id="deque-btn-group">
                <button id="queue-add-front-btn" class="btn btn-secondary">Enqueue (Front)</button>
                <button id="queue-remove-rear-btn" class="btn btn-secondary">Dequeue (Rear)</button>
            </div>
            <div class="algo-description-box" style="margin-top: 1rem;">${definitions.standard}</div>
            <hr>
            <div class="control-group" id="max-size-control">
                <label for="queue-max-size">Max Size</label>
                <input type="number" id="queue-max-size" value="10" min="2">
            </div>
            <div class="info-box" style="margin-top:1rem;">
                <p><strong>Current Size:</strong> <span id="queue-current-size">0</span></p>
            </div>
            <button id="queue-reset-btn" class="btn btn-secondary" style="margin-top:1rem;">Reset</button>
        </div>
        <div id="visualization-panel" class="panel" style="justify-content: center; align-items: center; position:relative; overflow-x: auto;">
            <h3 class="panel-title" style="align-self: flex-start;">Visualization</h3>
            <div id="queue-front-pointer" class="queue-pointer">Front ↑</div>
            <div id="queue-rear-pointer" class="queue-pointer">Rear ↑</div>
            <div id="queue-container"></div>
            <div id="queue-circular-container" class="hidden"></div>
        </div>
        <div id="information-panel" class="panel">
            <h3 class="panel-title">Information</h3>
            <div class="info-box">
                <h3>Operation Steps</h3>
                <p id="animation-steps">Select a queue type to begin.</p>
            </div>
             <div class="info-box">
                <h3>Complexity</h3>
                <p><strong>Standard/Circular/Deque:</strong> O(1)</p>
                <p><strong>Priority Queue (Array):</strong> O(n) Enqueue, O(1) Dequeue</p>
            </div>
        </div>
    `;

    // --- DOM REFERENCES ---
    const valueInput = document.getElementById('queue-value');
    const enqueueBtn = document.getElementById('queue-enqueue-btn');
    const dequeueBtn = document.getElementById('queue-dequeue-btn');
    const resetBtn = document.getElementById('queue-reset-btn');
    const queueContainer = document.getElementById('queue-container');
    const animationStepsP = document.getElementById('animation-steps');
    const maxSizeInput = document.getElementById('queue-max-size');
    const currentSizeSpan = document.getElementById('queue-current-size');
    const frontPointer = document.getElementById('queue-front-pointer');
    const rearPointer = document.getElementById('queue-rear-pointer');
    const typeSelect = document.getElementById('queue-type-select');
    const descriptionBox = document.querySelector('.algo-description-box');
    
    // New references
    const circularContainer = document.getElementById('queue-circular-container');
    const dequeBtnGroup = document.getElementById('deque-btn-group');
    const addFrontBtn = document.getElementById('queue-add-front-btn');
    const removeRearBtn = document.getElementById('queue-remove-rear-btn');
    const maxSizeControl = document.getElementById('max-size-control');

    // --- STATE VARIABLES ---
    let queueData = [];
    let isAnimating = false;
    let front = -1, rear = -1, capacity = 0;

    // --- UI UPDATE & RENDER FUNCTIONS ---

    function updatePointers(isCircular = false) {
        if (queueData.length === 0 && !isCircular) {
            frontPointer.classList.remove('visible');
            rearPointer.classList.remove('visible');
            return;
        }

        frontPointer.classList.add('visible');
        rearPointer.classList.add('visible');

        if (isCircular) {
            if (front === -1) { // Queue is empty
                frontPointer.classList.remove('visible');
                rearPointer.classList.remove('visible');
                return;
            }
            const frontElement = document.getElementById(`cell-${front}`);
            const rearElement = document.getElementById(`cell-${rear}`);
            if(frontElement) frontPointer.style.left = `${frontElement.offsetLeft + (frontElement.offsetWidth / 2) - (frontPointer.offsetWidth / 2)}px`;
            if(rearElement) rearPointer.style.left = `${rearElement.offsetLeft + (rearElement.offsetWidth / 2) - (rearPointer.offsetWidth / 2)}px`;
        } else {
            const firstElement = queueContainer.firstChild;
            const lastElement = queueContainer.lastChild;
            if (firstElement) frontPointer.style.left = `${firstElement.offsetLeft + (firstElement.offsetWidth / 2) - (frontPointer.offsetWidth / 2)}px`;
            if (lastElement) rearPointer.style.left = `${lastElement.offsetLeft + (lastElement.offsetWidth / 2) - (rearPointer.offsetWidth / 2)}px`;
        }
    }

    function renderStandardQueue() {
        queueContainer.innerHTML = '';
        queueData.forEach(value => {
            const item = document.createElement('div');
            item.className = 'queue-item';
            item.textContent = value;
            queueContainer.appendChild(item);
        });
        updatePointers();
    }

    function renderCircularQueue() {
        capacity = parseInt(maxSizeInput.value);
        circularContainer.innerHTML = '';
        for (let i = 0; i < capacity; i++) {
            const cell = document.createElement('div');
            cell.className = 'queue-cell';
            cell.id = `cell-${i}`;
            cell.innerHTML = `<span class="cell-value"></span><span class="cell-index">${i}</span>`;
            circularContainer.appendChild(cell);
        }
        updatePointers(true);
    }
    
    function updateUIForQueueType() {
        const type = typeSelect.value;
        descriptionBox.textContent = definitions[type];
        
        // Hide/show elements based on type
        dequeBtnGroup.classList.toggle('hidden', type !== 'deque');
        maxSizeControl.classList.toggle('hidden', type === 'standard' || type === 'priority' || type === 'deque');
        queueContainer.classList.toggle('hidden', type === 'circular');
        circularContainer.classList.toggle('hidden', type !== 'circular');
        
        handleReset();
    }

    // --- CORE LOGIC FOR EACH QUEUE TYPE ---

    function handleReset() {
        isAnimating = false;
        queueData = [];
        front = rear = -1;
        currentSizeSpan.textContent = '0';
        const type = typeSelect.value;
        if (type === 'circular') {
            renderCircularQueue();
        } else {
            renderStandardQueue();
        }
    }

    // Standard & Deque Enqueue (to rear)
    async function handleEnqueue() {
        if(isAnimating) return;
        const value = valueInput.value;
        if (!value) return;
        
        isAnimating = true;
        animationStepsP.innerText = `Enqueuing ${value} to rear...`;
        queueData.push(value);
        
        const item = document.createElement('div');
        item.className = 'queue-item enqueue-animation';
        item.textContent = value;
        queueContainer.appendChild(item);
        
        await new Promise(r => setTimeout(r, 400));
        item.classList.remove('enqueue-animation');
        currentSizeSpan.textContent = queueData.length;
        updatePointers();
        isAnimating = false;
        valueInput.value = '';
    }

    // Standard & Deque Dequeue (from front)
    async function handleDequeue() {
        if(isAnimating || queueData.length === 0) return;

        isAnimating = true;
        const value = queueData[0];
        animationStepsP.innerText = `Dequeuing ${value} from front...`;

        const item = queueContainer.firstChild;
        item.classList.add('dequeue-animation');

        await new Promise(r => setTimeout(r, 400));
        
        queueData.shift();
        item.remove();
        currentSizeSpan.textContent = queueData.length;
        updatePointers();
        isAnimating = false;
    }

    // Deque-specific functions
    async function handleAddFront() {
        if(isAnimating) return;
        const value = valueInput.value;
        if (!value) return;

        isAnimating = true;
        animationStepsP.innerText = `Enqueuing ${value} to front...`;
        queueData.unshift(value); // Add to front of data array

        const item = document.createElement('div');
        item.className = 'queue-item enqueue-animation';
        item.textContent = value;
        queueContainer.insertBefore(item, queueContainer.firstChild);

        await new Promise(r => setTimeout(r, 400));
        item.classList.remove('enqueue-animation');
        currentSizeSpan.textContent = queueData.length;
        updatePointers();
        isAnimating = false;
        valueInput.value = '';
    }

    async function handleRemoveRear() {
        if(isAnimating || queueData.length === 0) return;

        isAnimating = true;
        const value = queueData[queueData.length - 1];
        animationStepsP.innerText = `Dequeuing ${value} from rear...`;

        const item = queueContainer.lastChild;
        item.classList.add('dequeue-animation');

        await new Promise(r => setTimeout(r, 400));
        
        queueData.pop(); // Remove from back of data array
        item.remove();
        currentSizeSpan.textContent = queueData.length;
        updatePointers();
        isAnimating = false;
    }
    
    // Priority Queue functions
    async function handlePriorityEnqueue() {
        if(isAnimating) return;
        const value = parseInt(valueInput.value);
        if (isNaN(value)) return;
        
        isAnimating = true;
        animationStepsP.innerText = `Enqueuing ${value} based on priority...`;
        
        // Find insertion point
        let i = 0;
        while(i < queueData.length && value > queueData[i]) {
            i++;
        }
        queueData.splice(i, 0, value); // Insert value at correct position
        
        // Visual re-render
        renderStandardQueue();
        if(queueContainer.children[i]) {
            queueContainer.children[i].classList.add('peek-animation');
        }

        await new Promise(r => setTimeout(r, 600));
        if(queueContainer.children[i]) {
            queueContainer.children[i].classList.remove('peek-animation');
        }
        
        currentSizeSpan.textContent = queueData.length;
        updatePointers();
        isAnimating = false;
        valueInput.value = '';
    }

    // Circular Queue functions
    async function handleCircularEnqueue() {
        if (isAnimating) return;
        const value = valueInput.value;
        if (!value) return;

        const isFull = (rear + 1) % capacity === front;
        if (isFull) {
            animationStepsP.innerText = "Error: Circular Queue is full!";
            return;
        }
        
        isAnimating = true;
        if (front === -1) front = 0; // First element
        rear = (rear + 1) % capacity;

        const cell = document.getElementById(`cell-${rear}`);
        cell.querySelector('.cell-value').textContent = value;
        cell.classList.add('filled', 'enqueue-animation');
        
        animationStepsP.innerText = `Enqueuing ${value} at index ${rear}.`;
        
        await new Promise(r => setTimeout(r, 400));
        
        cell.classList.remove('enqueue-animation');
        queueData.push(value); // Use for size tracking
        currentSizeSpan.textContent = queueData.length;
        updatePointers(true);
        isAnimating = false;
        valueInput.value = '';
    }

    async function handleCircularDequeue() {
        const isEmpty = front === -1;
        if (isAnimating || isEmpty) {
            if(isEmpty) animationStepsP.innerText = "Error: Circular Queue is empty!";
            return;
        }
        
        isAnimating = true;
        const cell = document.getElementById(`cell-${front}`);
        const value = cell.querySelector('.cell-value').textContent;
        animationStepsP.innerText = `Dequeuing ${value} from index ${front}.`;
        
        cell.classList.add('dequeue-animation');
        await new Promise(r => setTimeout(r, 400));
        
        cell.querySelector('.cell-value').textContent = '';
        cell.classList.remove('filled', 'dequeue-animation');
        
        if (front === rear) { // Last element
            front = rear = -1;
        } else {
            front = (front + 1) % capacity;
        }
        
        queueData.shift(); // Use for size tracking
        currentSizeSpan.textContent = queueData.length;
        updatePointers(true);
        isAnimating = false;
    }

    // --- EVENT ROUTER ---
    function onEnqueue() {
        const type = typeSelect.value;
        if(type === 'standard' || type === 'deque') handleEnqueue();
        else if (type === 'priority') handlePriorityEnqueue();
        else if (type === 'circular') handleCircularEnqueue();
    }
    
    function onDequeue() {
        const type = typeSelect.value;
        if(type === 'standard' || type === 'deque' || type === 'priority') handleDequeue();
        else if (type === 'circular') handleCircularDequeue();
    }

    // --- EVENT LISTENERS ---
    typeSelect.addEventListener('change', updateUIForQueueType);
    enqueueBtn.addEventListener('click', onEnqueue);
    dequeueBtn.addEventListener('click', onDequeue);
    addFrontBtn.addEventListener('click', handleAddFront);
    removeRearBtn.addEventListener('click', handleRemoveRear);
    resetBtn.addEventListener('click', handleReset);
    maxSizeInput.addEventListener('change', handleReset);
    
    // Initial setup
    updateUIForQueueType();
}

