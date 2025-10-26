function setupSearchingPage() {
    // --- METADATA ---
    const pseudocodeMap = {
        linear: `function linearSearch(array, value):
  for i from 0 to n-1:
    if array[i] == value:
      return i // Found
  return -1 // Not found`,
        binary: `function binarySearch(array, value):
  low = 0, high = n-1
  while low <= high:
    mid = floor((low + high) / 2)
    if array[mid] == value:
      return mid // Found
    else if array[mid] < value:
      low = mid + 1
    else:
      high = mid - 1
  return -1 // Not found`
    };

    const algoDefinitions = {
        linear: "Checks each element of the list sequentially until a match is found or the whole list has been searched.",
        binary: "Repeatedly divides the search interval in half. It is very fast but requires the array to be sorted first."
    };

    // NEW: Complexity Data
    const complexityMap = {
        linear: { time: "O(n)", space: "O(1)" },
        binary: { time: "O(log n)", space: "O(1)" }
    };

    // --- PAGE SETUP ---
    const appContainer = document.getElementById('app-container');
    appContainer.innerHTML = `
        <div id="searching-controls" class="panel">
            <h3 class="panel-title">Controls</h3>
            <div class="control-group">
                <label for="search-algorithm-select">Algorithm</label>
                <select id="search-algorithm-select">
                    <option value="linear">Linear Search</option>
                    <option value="binary">Binary Search</option>
                </select>
            </div>
            <div class="control-group">
                <label for="search-array-size">Array Size</label>
                <input type="range" id="search-array-size" value="15" min="5" max="25" step="1">
            </div>
            <div class="control-group">
                <label for="search-value">Value to Find</label>
                <input type="number" id="search-value" placeholder="Enter a number">
            </div>
            <button id="generate-search-array-btn" class="btn btn-primary">Generate New Array</button>
            <div class="button-group">
                <button id="search-start-btn" class="btn btn-primary">Search</button>
                <button id="search-reset-btn" class="btn btn-secondary">Reset</button>
            </div>
            <div class="control-group">
                <label for="search-animation-speed">Animation Speed (ms)</label>
                <input type="range" id="search-animation-speed" min="50" max="1000" value="500" step="50">
            </div>
            <div id="algo-description-box" class="algo-description-box">
                ${algoDefinitions.linear}
            </div>
        </div>
        <div id="visualization-panel" class="panel">
            <h3 class="panel-title">Visualization</h3>
            <div id="visualization-area">
                <div class="bar-container"></div>
            </div>
        </div>
        <div id="information-panel" class="panel">
            <h3 class="panel-title">Information</h3>
            <div class="info-box">
                <h3>Animation Steps</h3>
                <p id="animation-steps">Generate an array and enter a value to find.</p>
            </div>
            <div class="info-box">
                <h3>Complexity</h3>
                <p><strong>Time:</strong> <span id="time-complexity"></span></p>
                <p><strong>Space:</strong> <span id="space-complexity"></span></p>
            </div>
            <div class="info-box">
                <h3>Pseudocode</h3>
                <pre id="pseudocode"><code>${pseudocodeMap.linear}</code></pre>
            </div>
        </div>
    `;

    // --- DOM REFERENCES ---
    const barContainer = document.querySelector('.bar-container');
    const algorithmSelect = document.getElementById('search-algorithm-select');
    const arraySizeSlider = document.getElementById('search-array-size');
    const generateBtn = document.getElementById('generate-search-array-btn');
    const startBtn = document.getElementById('search-start-btn');
    const resetBtn = document.getElementById('search-reset-btn');
    const valueInput = document.getElementById('search-value');
    const animationStepsP = document.getElementById('animation-steps');
    const pseudocodeBox = document.getElementById('pseudocode').querySelector('code');
    const descriptionBox = document.getElementById('algo-description-box');
    const timeComplexitySpan = document.getElementById('time-complexity'); // NEW
    const spaceComplexitySpan = document.getElementById('space-complexity'); // NEW

    let currentSearchArray = [];
    let isSearching = false;
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // --- CORE LOGIC ---
    function generateArray() {
        if (isSearching) return;
        const size = parseInt(arraySizeSlider.value);
        currentSearchArray = [];
        for (let i = 0; i < size; i++) {
            currentSearchArray.push(Math.floor(Math.random() * 91) + 10);
        }
        if (algorithmSelect.value === 'binary') {
            currentSearchArray.sort((a, b) => a - b);
            animationStepsP.innerText = "Generated a new SORTED array for Binary Search.";
        } else {
             animationStepsP.innerText = "Generated a new random array.";
        }
        renderSearchBars(currentSearchArray);
    }
    
    function renderSearchBars(array, colorMap = {}) {
        barContainer.innerHTML = '';
        const maxVal = 100;
        const containerWidth = barContainer.offsetWidth;
        const barWidth = (containerWidth / array.length) - 2;
        const showLabels = barWidth > 25;
        array.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.classList.add('bar');
            bar.style.height = `${(value / maxVal) * 100}%`;
            bar.style.backgroundColor = colorMap[index] || 'var(--primary-color)';
            if (showLabels) {
                const label = document.createElement('span');
                label.classList.add('bar-label');
                label.innerText = value;
                bar.appendChild(label);
            }
            barContainer.appendChild(bar);
        });
    }

    function updateAlgorithmInfo() {
        const selectedAlgo = algorithmSelect.value;
        pseudocodeBox.innerText = pseudocodeMap[selectedAlgo];
        descriptionBox.innerText = algoDefinitions[selectedAlgo];
        
        // NEW: Update complexity info
        const complexities = complexityMap[selectedAlgo];
        timeComplexitySpan.innerHTML = complexities.time;
        spaceComplexitySpan.innerHTML = complexities.space;

        generateArray();
    }
    
    // ... (rest of the file is unchanged, but included for completeness)
    function disableControls() {
        isSearching = true;
        startBtn.disabled = true;
        generateBtn.disabled = true;
        arraySizeSlider.disabled = true;
        algorithmSelect.disabled = true;
    }

    function enableControls() {
        isSearching = false;
        startBtn.disabled = false;
        generateBtn.disabled = false;
        arraySizeSlider.disabled = false;
        algorithmSelect.disabled = false;
    }
    
    function getAnimationSpeed() {
        return 1050 - parseInt(document.getElementById('search-animation-speed').value);
    }

    async function linearSearch() {
        const valueToFind = parseInt(valueInput.value);
        if (isNaN(valueToFind)) {
            animationStepsP.innerText = "Please enter a valid number to find.";
            return;
        }
        disableControls();
        let found = false;
        for (let i = 0; i < currentSearchArray.length; i++) {
            animationStepsP.innerText = `Checking index ${i} (value: ${currentSearchArray[i]})...`;
            renderSearchBars(currentSearchArray, { [i]: 'red' });
            await sleep(getAnimationSpeed());
            if (currentSearchArray[i] === valueToFind) {
                animationStepsP.innerText = `Found ${valueToFind} at index ${i}!`;
                renderSearchBars(currentSearchArray, { [i]: '#22C55E' });
                found = true;
                break;
            }
        }
        if (!found) {
            animationStepsP.innerText = `${valueToFind} not found in the array.`;
            renderSearchBars(currentSearchArray);
        }
        enableControls();
    }

    async function binarySearch() {
        const valueToFind = parseInt(valueInput.value);
        if (isNaN(valueToFind)) {
            animationStepsP.innerText = "Please enter a valid number to find.";
            return;
        }
        disableControls();
        let low = 0;
        let high = currentSearchArray.length - 1;
        let found = false;
        while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            let colors = {};
            for(let i=low; i<=high; i++) colors[i] = 'orange';
            colors[low] = '#3B82F6';
            colors[high] = '#3B82F6';
            colors[mid] = 'red';
            animationStepsP.innerText = `Searching between index ${low} and ${high}. Middle is ${mid}.`;
            renderSearchBars(currentSearchArray, colors);
            await sleep(getAnimationSpeed());
            if (currentSearchArray[mid] === valueToFind) {
                animationStepsP.innerText = `Found ${valueToFind} at index ${mid}!`;
                renderSearchBars(currentSearchArray, { [mid]: '#22C55E' });
                found = true;
                break;
            } else if (currentSearchArray[mid] < valueToFind) {
                animationStepsP.innerText = `${currentSearchArray[mid]} is too small. Searching right half.`;
                low = mid + 1;
            } else {
                animationStepsP.innerText = `${currentSearchArray[mid]} is too large. Searching left half.`;
                high = mid - 1;
            }
            await sleep(getAnimationSpeed());
        }
        if (!found) {
            animationStepsP.innerText = `${valueToFind} not found in the array.`;
            renderSearchBars(currentSearchArray);
        }
        enableControls();
    }
    
    startBtn.addEventListener('click', () => {
        const selectedAlgorithm = algorithmSelect.value;
        if (selectedAlgorithm === 'linear') {
            linearSearch();
        } else {
            binarySearch();
        }
    });

    generateBtn.addEventListener('click', generateArray);
    resetBtn.addEventListener('click', generateArray);
    algorithmSelect.addEventListener('change', updateAlgorithmInfo);
    arraySizeSlider.addEventListener('input', generateArray);
    
    generateArray();
    updateAlgorithmInfo();
}