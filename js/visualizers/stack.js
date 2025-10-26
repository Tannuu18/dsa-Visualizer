function setupStackPage() {
    // --- METADATA ---
    const pseudocodeMap = {
        push: `procedure push(stack, value):
  if stack.isFull():
    return "Error: Stack Overflow"
  stack.add(value) // Add to top`,
        pop: `procedure pop(stack):
  if stack.isEmpty():
    return "Error: Stack Underflow"
  value = stack.removeLast() // Remove from top
  return value`,
        peek: `procedure peek(stack):
  if stack.isEmpty():
    return "Error: Stack is empty"
  return stack.getLast() // View top value`
    };
    
    const stackDefinition = "A LIFO (Last-In, First-Out) data structure. The last element added is the first one to be removed.";

    // --- PAGE SETUP ---
    const appContainer = document.getElementById('app-container');
    appContainer.innerHTML = `
        <div id="stack-controls" class="panel">
            <h3 class="panel-title">Controls</h3>
            <div class="control-group">
                <label for="stack-value">Value</label>
                <input type="text" id="stack-value" placeholder="Enter a value">
            </div>
            <div class="button-group">
                <button id="stack-push-btn" class="btn btn-primary">Push</button>
                <button id="stack-peek-btn" class="btn btn-primary">Peek</button>
            </div>
            <button id="stack-pop-btn" class="btn btn-primary" style="width:100%">Pop</button>
            
            <div class="algo-description-box" style="margin-top: 1rem;">
                ${stackDefinition}
            </div>

            <hr>
             <div class="control-group">
                <label for="stack-max-size">Max Stack Size (0 for infinite)</label>
                <input type="number" id="stack-max-size" value="8" min="0">
            </div>
            <div class="info-box" style="margin-top:1rem;">
                <p><strong>Current Size:</strong> <span id="stack-current-size">0</span></p>
                <p><strong>Is Empty?</strong> <span id="stack-is-empty">true</span></p>
            </div>
            <button id="stack-reset-btn" class="btn btn-secondary" style="margin-top:1rem;">Reset Stack</button>
        </div>
        <div id="visualization-panel" class="panel" style="justify-content: center; align-items: center; position:relative;">
            <h3 class="panel-title" style="align-self: flex-start;">Visualization</h3>
            <div id="stack-top-pointer">TOP →</div>
            <div id="stack-queue-container">
                </div>
        </div>
        <div id="information-panel" class="panel">
            <h3 class="panel-title">Information</h3>
            <div class="info-box">
                <h3>Operation Steps</h3>
                <p id="animation-steps">Enter a value to push onto the stack.</p>
            </div>
            <div class="info-box">
                <h3>Complexity</h3>
                <p><strong>Push/Pop/Peek Time:</strong> O(1)</p>
                <p><strong>Space:</strong> O(n) for the stack itself</p>
            </div>
            <div class="info-box">
                <h3>Pseudocode</h3>
                <pre id="pseudocode"><code>${pseudocodeMap.push}</code></pre>
            </div>
        </div>
    `;

    // --- DOM REFERENCES ---
    const valueInput = document.getElementById('stack-value');
    const pushBtn = document.getElementById('stack-push-btn');
    const popBtn = document.getElementById('stack-pop-btn');
    const peekBtn = document.getElementById('stack-peek-btn');
    const resetBtn = document.getElementById('stack-reset-btn');
    const stackContainer = document.getElementById('stack-queue-container');
    const animationStepsP = document.getElementById('animation-steps');
    const pseudocodeBox = document.getElementById('pseudocode').querySelector('code');
    const maxSizeInput = document.getElementById('stack-max-size');
    const currentSizeSpan = document.getElementById('stack-current-size');
    const isEmptySpan = document.getElementById('stack-is-empty');
    const topPointer = document.getElementById('stack-top-pointer');

    let stackData = [];
    let isAnimating = false;

    // --- UI UPDATE FUNCTIONS ---
    function updateInfo() {
        currentSizeSpan.textContent = stackData.length;
        isEmptySpan.textContent = stackData.length === 0 ? 'true' : 'false';
        updateTopPointer();
    }
    
    function updateTopPointer() {
        if (stackData.length === 0) {
            topPointer.classList.remove('visible');
            return;
        }
        topPointer.classList.add('visible');
        const topElement = stackContainer.lastChild;
        if (topElement) {
            const topPosition = topElement.offsetTop + (topElement.offsetHeight / 2) - (topPointer.offsetHeight / 2);
            topPointer.style.top = `${topPosition}px`;
        }
    }

    // --- CORE LOGIC ---
    async function handlePush() {
        if (isAnimating) return;
        const value = valueInput.value;
        if (!value) {
            animationStepsP.innerText = "Please enter a value to push.";
            return;
        }

        const maxSize = parseInt(maxSizeInput.value);
        if (maxSize > 0 && stackData.length >= maxSize) {
            animationStepsP.innerText = "Error: Stack Overflow! Cannot push to a full stack.";
            stackContainer.classList.add('error');
            setTimeout(() => stackContainer.classList.remove('error'), 500);
            return;
        }

        isAnimating = true;
        pseudocodeBox.innerText = pseudocodeMap.push;
        animationStepsP.innerText = `Pushing ${value} onto the stack.`;
        
        const newItem = document.createElement('div');
        newItem.classList.add('stack-item');
        newItem.textContent = value;
        
        stackContainer.appendChild(newItem);
        newItem.classList.add('push-animation');
        
        stackData.push(value);
        valueInput.value = '';

        await new Promise(resolve => setTimeout(resolve, 400));
        
        newItem.classList.remove('push-animation');
        updateInfo();
        isAnimating = false;
        animationStepsP.innerText = `Value ${value} pushed.`;
    }

    async function handlePop() {
        if (isAnimating || stackData.length === 0) {
            if (stackData.length === 0) animationStepsP.innerText = "Stack is empty (Underflow). Cannot pop.";
            return;
        }

        isAnimating = true;
        const value = stackData[stackData.length - 1];
        pseudocodeBox.innerText = pseudocodeMap.pop;
        animationStepsP.innerText = `Popping ${value} from the stack.`;

        const itemToPop = stackContainer.lastChild;
        itemToPop.classList.add('pop-animation');
        
        await new Promise(resolve => setTimeout(resolve, 400));
        
        stackData.pop();
        itemToPop.remove();
        
        updateInfo();
        isAnimating = false;
        animationStepsP.innerText = `Value ${value} popped.`;
    }

    async function handlePeek() {
        if (isAnimating || stackData.length === 0) {
            if (stackData.length === 0) animationStepsP.innerText = "Stack is empty. Cannot peek.";
            return;
        }

        isAnimating = true;
        const value = stackData[stackData.length - 1];
        pseudocodeBox.innerText = pseudocodeMap.peek;
        animationStepsP.innerText = `Peeking at top element: ${value}.`;

        const itemToPeek = stackContainer.lastChild;
        itemToPeek.classList.add('peek-animation');

        await new Promise(resolve => setTimeout(resolve, 600));

        itemToPeek.classList.remove('peek-animation');
        isAnimating = false;
        animationStepsP.innerText = "Peek operation complete.";
    }
    
    function handleReset() {
        stackData = [];
        stackContainer.innerHTML = '';
        animationStepsP.innerText = "Stack has been reset.";
        updateInfo();
    }

    // --- EVENT LISTENERS ---
    pushBtn.addEventListener('click', handlePush);
    popBtn.addEventListener('click', handlePop);
    peekBtn.addEventListener('click', handlePeek);
    resetBtn.addEventListener('click', handleReset);
    
    // Initial setup call
    updateInfo();
}