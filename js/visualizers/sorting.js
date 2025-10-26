// --- ALGORITHM METADATA ---

const pseudocodeMap = {
    bubble: `function bubbleSort(array):
  n = length(array)
  for i from 0 to n-1:
    for j from 0 to n-i-2:
      if array[j] > array[j+1]:
        swap(array[j], array[j+1])`,
    selection: `function selectionSort(array):
  n = length(array)
  for i from 0 to n-1:
    minIndex = i
    for j from i+1 to n-1:
      if array[j] < array[minIndex]:
        minIndex = j
    swap(array[i], array[minIndex])`,
    insertion: `function insertionSort(array):
  for i from 1 to n-1:
    key = array[i]
    j = i - 1
    while j >= 0 and array[j] > key:
      array[j + 1] = array[j]
      j = j - 1
    array[j + 1] = key`,
    merge: `function mergeSort(array, l, r):
  if l < r:
    m = (l + r) / 2
    mergeSort(array, l, m)
    mergeSort(array, m + 1, r)
    merge(array, l, m, r)`,
    quick: `function quickSort(array, low, high):
  if low < high:
    pi = partition(array, low, high)
    quickSort(array, low, pi - 1)
    quickSort(array, pi + 1, high)`,
    counting: `function countingSort(array):
  maxVal = max(array)
  count = new Array(maxVal + 1).fill(0)
  for i from 0 to n-1:
    count[array[i]]++
  for i from 1 to maxVal:
    count[i] += count[i - 1]
  for i from n-1 down to 0:
    output[count[array[i]] - 1] = array[i]
    count[array[i]]--
  return output`
};

const algoDefinitions = {
    bubble: "Compares adjacent elements and swaps them if they are in the wrong order. Simple, but very slow.",
    selection: "Finds the smallest element in the unsorted portion and swaps it to the front. Simple, but slow.",
    insertion: "Builds the final sorted array one item at a time, 'inserting' each element into its proper place.",
    merge: "A 'Divide and Conquer' algorithm. It divides the array, sorts the halves, and then merges them. Very efficient.",
    quick: "A 'Divide and Conquer' algorithm. It picks a 'pivot' element and partitions other elements around it. Very efficient on average.",
    counting: "A non-comparison sort. It counts the occurrences of each unique element and uses those counts to build the sorted array. Very fast for a limited range of integer values."
};

// NEW: Complexity Data
const complexityMap = {
    bubble: { time: "O(n²)", space: "O(1)" },
    selection: { time: "O(n²)", space: "O(1)" },
    insertion: { time: "O(n²)", space: "O(1)" },
    merge: { time: "O(n log n)", space: "O(n)" },
    quick: { time: "O(n log n) <small>Average</small><br>O(n²) <small>Worst</small>", space: "O(log n)" },
    counting: { time: "O(n + k)", space: "O(k)" }
};

// --- GLOBAL STATE ---
let currentArray = [];
let isSorting = false;
let isPaused = false;

// --- HELPER FUNCTIONS ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function checkPause() {
    while (isPaused) {
        if (!isSorting) return;
        await sleep(50);
    }
}

// --- MAIN SETUP FUNCTION ---
function setupSortingPage() {
    const appContainer = document.getElementById('app-container');
    appContainer.innerHTML = `
        <div id="sorting-controls" class="panel">
            <h3 class="panel-title">Controls</h3>
            <div class="control-group">
                <label for="algorithm-select">Algorithm</label>
                <select id="algorithm-select">
                    <option value="bubble">Bubble Sort</option>
                    <option value="selection">Selection Sort</option>
                    <option value="insertion">Insertion Sort</option>
                    <option value="merge">Merge Sort</option>
                    <option value="quick">Quick Sort</option>
                    <option value="counting">Counting Sort</option>
                </select>
            </div>
            <div class="control-group">
                <label for="array-size">Array Size</label>
                <input type="range" id="array-size" value="20" min="5" max="50" step="1">
            </div>
            <button id="generate-array-btn" class="btn btn-primary">Generate New Array</button>
            <div class="button-group">
                <button id="start-btn" class="btn btn-primary">Start</button>
                <button id="reset-btn" class="btn btn-secondary">Reset</button>
            </div>
            <div class="control-group">
                <label for="animation-speed">Animation Speed (ms)</label>
                <input type="range" id="animation-speed" min="20" max="500" value="100" step="10">
            </div>
            <div id="algo-description-box" class="algo-description-box">
                ${algoDefinitions.bubble}
            </div>
        </div>
        <div id="visualization-panel" class="panel">
            <h3 class="panel-title">Visualization</h3>
            <div id="counting-array-container" class="hidden"></div>
            <div id="visualization-area">
                <div class="bar-container"></div>
            </div>
        </div>
        <div id="information-panel" class="panel">
            <h3 class="panel-title">Information</h3>
            <div class="info-box">
                <h3>Animation Steps</h3>
                <p id="animation-steps">Select an algorithm and click Start.</p>
            </div>
            <div class="info-box">
                <h3>Complexity</h3>
                <p><strong>Time:</strong> <span id="time-complexity"></span></p>
                <p><strong>Space:</strong> <span id="space-complexity"></span></p>
            </div>
            <div class="info-box">
                <h3>Pseudocode</h3>
                <pre id="pseudocode"><code>${pseudocodeMap.bubble}</code></pre>
            </div>
        </div>
    `;

    // --- DOM ELEMENT REFERENCES ---
    const generateBtn = document.getElementById('generate-array-btn');
    const arraySizeSlider = document.getElementById('array-size');
    const barContainer = document.querySelector('.bar-container');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const algorithmSelect = document.getElementById('algorithm-select');
    const pseudocodeBox = document.getElementById('pseudocode').querySelector('code');
    const animationStepsP = document.getElementById('animation-steps');
    const descriptionBox = document.getElementById('algo-description-box');
    const countingArrayContainer = document.getElementById('counting-array-container');
    const timeComplexitySpan = document.getElementById('time-complexity'); // NEW
    const spaceComplexitySpan = document.getElementById('space-complexity'); // NEW

    // --- CORE LOGIC ---
    function generateArray() {
        if (isSorting) return;
        const size = parseInt(arraySizeSlider.value);
        currentArray = [];
        for (let i = 0; i < size; i++) {
            const value = Math.floor(Math.random() * 91) + 10;
            currentArray.push(value);
        }
        renderBars(currentArray);
        animationStepsP.innerText = "New array generated. Ready to sort.";
    }

    function renderBars(array, colorMap = {}) {
        barContainer.innerHTML = '';
        const maxVal = Math.max(...array, 100);
        const containerWidth = barContainer.offsetWidth;
        const barWidth = (containerWidth / array.length) - 2; 
        const showLabels = barWidth > 25; 

        array.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.classList.add('bar');
            bar.style.height = `${(value / maxVal) * 100}%`;
            bar.style.backgroundColor = colorMap[index] || 'var(--primary-color)';
            
            if (showLabels) {
                const barLabel = document.createElement('span');
                barLabel.classList.add('bar-label');
                barLabel.innerText = value;
                bar.appendChild(barLabel);
            }
            
            barContainer.appendChild(bar);
        });
    }

    function updateAlgorithmInfo() {
        const selectedAlgorithm = algorithmSelect.value;
        pseudocodeBox.innerText = pseudocodeMap[selectedAlgorithm];
        descriptionBox.innerText = algoDefinitions[selectedAlgorithm];

        // NEW: Update complexity info
        const complexities = complexityMap[selectedAlgorithm];
        timeComplexitySpan.innerHTML = complexities.time;
        spaceComplexitySpan.innerHTML = complexities.space;

        if (selectedAlgorithm === 'counting') {
            countingArrayContainer.classList.remove('hidden');
        } else {
            countingArrayContainer.classList.add('hidden');
        }
    }
    // ... (rest of the file is unchanged, but included for completeness)
    function disableControls(isSortingStarted) {
        generateBtn.disabled = true;
        arraySizeSlider.disabled = true;
        algorithmSelect.disabled = true;
        resetBtn.disabled = !isSortingStarted;
    }

    function enableControls() {
        startBtn.disabled = false;
        startBtn.innerText = "Start";
        generateBtn.disabled = false;
        arraySizeSlider.disabled = false;
        algorithmSelect.disabled = false;
        resetBtn.disabled = false;
    }

    function getAnimationSpeed() {
        const speedSlider = document.getElementById('animation-speed');
        return 520 - parseInt(speedSlider.value);
    }

    function renderCountingArray(countArray) {
        countingArrayContainer.innerHTML = '';
        countArray.forEach((value, index) => {
            const cell = document.createElement('div');
            cell.classList.add('count-cell');
            cell.id = `count-cell-${index}`;
            cell.innerHTML = `<span class="count-index">${index}</span><span class="count-value">${value}</span>`;
            countingArrayContainer.appendChild(cell);
        });
    }

    async function bubbleSort() {
        let bars = document.getElementsByClassName('bar');
        let n = currentArray.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (!isSorting) return;
                await checkPause();
                bars[j].style.backgroundColor = 'red';
                bars[j+1].style.backgroundColor = 'red';
                animationStepsP.innerText = `Comparing ${currentArray[j]} and ${currentArray[j+1]}.`;
                await sleep(getAnimationSpeed());
                if (currentArray[j] > currentArray[j+1]) {
                    animationStepsP.innerText = `Swapping ${currentArray[j]} and ${currentArray[j+1]}.`;
                    [currentArray[j], currentArray[j+1]] = [currentArray[j+1], currentArray[j]];
                    renderBars(currentArray, { [j]: 'red', [j+1]: 'red' });
                    await sleep(getAnimationSpeed());
                }
                bars[j].style.backgroundColor = '';
                bars[j+1].style.backgroundColor = '';
            }
            bars[n - 1 - i].style.backgroundColor = '#22C55E';
        }
        bars[0].style.backgroundColor = '#22C55E';
    }

    async function selectionSort() {
        let bars = document.getElementsByClassName('bar');
        let n = currentArray.length;
        for (let i = 0; i < n; i++) {
            let minIndex = i;
            bars[i].style.backgroundColor = 'purple';
            for (let j = i + 1; j < n; j++) {
                if (!isSorting) return;
                await checkPause();
                bars[j].style.backgroundColor = 'red';
                animationStepsP.innerText = `Checking ${currentArray[j]} against min ${currentArray[minIndex]}.`;
                await sleep(getAnimationSpeed());
                if (currentArray[j] < currentArray[minIndex]) {
                    if(minIndex !== i) bars[minIndex].style.backgroundColor = '';
                    minIndex = j;
                    bars[minIndex].style.backgroundColor = 'orange';
                } else {
                    bars[j].style.backgroundColor = '';
                }
            }
            animationStepsP.innerText = `Swapping ${currentArray[i]} with min ${currentArray[minIndex]}.`;
            [currentArray[i], currentArray[minIndex]] = [currentArray[minIndex], currentArray[i]];
            renderBars(currentArray, { [i]: '#22C55E' });
            await sleep(getAnimationSpeed());
        }
    }

    async function insertionSort() {
        let bars = document.getElementsByClassName('bar');
        let n = currentArray.length;
        bars[0].style.backgroundColor = '#22C55E';
        for (let i = 1; i < n; i++) {
            let key = currentArray[i];
            let j = i - 1;
            bars[i].style.backgroundColor = 'orange';
            animationStepsP.innerText = `Picking ${key} as key.`;
            await sleep(getAnimationSpeed());
            await checkPause();
            while (j >= 0 && currentArray[j] > key) {
                if (!isSorting) return;
                await checkPause();
                bars[j].style.backgroundColor = 'red';
                animationStepsP.innerText = `Shifting ${currentArray[j]} right.`;
                currentArray[j + 1] = currentArray[j];
                renderBars(currentArray, { [j+1]: 'red' });
                await sleep(getAnimationSpeed());
                bars[j+1].style.backgroundColor = '#22C55E';
                j = j - 1;
            }
            currentArray[j + 1] = key;
            renderBars(currentArray, { [j+1]: 'orange' });
            await sleep(getAnimationSpeed());
            for(let k=0; k<=i; k++) bars[k].style.backgroundColor = '#22C55E';
        }
    }

    async function mergeSort(l, r) {
        if (l >= r) return;
        if (!isSorting) return;
        const m = Math.floor((l + r) / 2);
        await mergeSort(l, m);
        await mergeSort(m + 1, r);
        await merge(l, m, r);
    }

    async function merge(l, m, r) {
        if (!isSorting) return;
        animationStepsP.innerText = `Merging subarray from index ${l} to ${r}.`;
        let n1 = m - l + 1;
        let n2 = r - m;
        let L = new Array(n1);
        let R = new Array(n2);
        for (let i = 0; i < n1; i++) L[i] = currentArray[l + i];
        for (let j = 0; j < n2; j++) R[j] = currentArray[m + 1 + j];
        let i = 0, j = 0, k = l;
        while (i < n1 && j < n2) {
            await checkPause();
            if (!isSorting) return;
            let colorMap = {};
            for(let p=l; p<=r; p++) colorMap[p] = 'orange';
            colorMap[l+i] = 'red';
            colorMap[m+1+j] = 'red';
            renderBars(currentArray, colorMap);
            await sleep(getAnimationSpeed());
            if (L[i] <= R[j]) {
                animationStepsP.innerText = `Comparing ${L[i]} and ${R[j]}. Taking ${L[i]}.`;
                currentArray[k] = L[i];
                i++;
            } else {
                animationStepsP.innerText = `Comparing ${L[i]} and ${R[j]}. Taking ${R[j]}.`;
                currentArray[k] = R[j];
                j++;
            }
            renderBars(currentArray, { [k]: '#22C55E' });
            await sleep(getAnimationSpeed());
            k++;
        }
        while (i < n1) {
            await checkPause();
            if (!isSorting) return;
            animationStepsP.innerText = `Copying remaining from left: ${L[i]}.`;
            currentArray[k] = L[i];
            renderBars(currentArray, { [k]: '#22C55E' });
            await sleep(getAnimationSpeed());
            i++; k++;
        }
        while (j < n2) {
            await checkPause();
            if (!isSorting) return;
            animationStepsP.innerText = `Copying remaining from right: ${R[j]}.`;
            currentArray[k] = R[j];
            renderBars(currentArray, { [k]: '#22C55E' });
            await sleep(getAnimationSpeed());
            j++; k++;
        }
        let colorMap = {};
        for(let p=l; p<=r; p++) colorMap[p] = '#22C55E';
        renderBars(currentArray, colorMap);
    }

    async function quickSort(low, high) {
        if (low < high) {
            if (!isSorting) return;
            let pi = await partition(low, high);
            await quickSort(low, pi - 1);
            await quickSort(pi + 1, high);
        }
    }

    async function partition(low, high) {
        let pivot = currentArray[high];
        let i = (low - 1);
        let colorMap = {};
        for(let p=low; p<high; p++) colorMap[p] = 'orange';
        colorMap[high] = 'purple';
        renderBars(currentArray, colorMap);
        animationStepsP.innerText = `Partitioning array. Pivot is ${pivot}.`;
        await sleep(getAnimationSpeed());
        for (let j = low; j < high; j++) {
            if (!isSorting) return;
            await checkPause();
            colorMap[j] = 'red';
            renderBars(currentArray, colorMap);
            await sleep(getAnimationSpeed());
            if (currentArray[j] < pivot) {
                i++;
                animationStepsP.innerText = `Swapping ${currentArray[i]} and ${currentArray[j]}.`;
                [currentArray[i], currentArray[j]] = [currentArray[j], currentArray[i]];
                colorMap[i] = 'red';
                colorMap[j] = 'red';
                renderBars(currentArray, colorMap);
                await sleep(getAnimationSpeed());
                colorMap[i] = 'orange';
            }
            colorMap[j] = 'orange';
        }
        [currentArray[i + 1], currentArray[high]] = [currentArray[high], currentArray[i + 1]];
        let pi = i + 1;
        animationStepsP.innerText = `Placing pivot ${pivot} at index ${pi}.`;
        for(let p=low; p<=high; p++) colorMap[p] = '';
        colorMap[pi] = '#22C55E';
        renderBars(currentArray, colorMap);
        await sleep(getAnimationSpeed());
        return pi;
    }

    async function countingSort() {
        let maxVal = Math.max(...currentArray);
        let countArray = new Array(maxVal + 1).fill(0);
        renderCountingArray(countArray);
        animationStepsP.innerText = "Phase 1: Counting occurrences of each element.";
        for (let i = 0; i < currentArray.length; i++) {
            if (!isSorting) return;
            await checkPause();
            let val = currentArray[i];
            countArray[val]++;
            renderBars(currentArray, { [i]: 'red' });
            let countCell = document.getElementById(`count-cell-${val}`);
            if (countCell) {
                countCell.style.backgroundColor = 'orange';
                countCell.querySelector('.count-value').innerText = countArray[val];
            }
            animationStepsP.innerText = `Element ${val} found. Count is now ${countArray[val]}.`;
            await sleep(getAnimationSpeed());
            if (countCell) countCell.style.backgroundColor = '';
            renderBars(currentArray);
        }
        animationStepsP.innerText = "Phase 2: Calculating cumulative counts.";
        for (let i = 1; i <= maxVal; i++) {
            if (!isSorting) return;
            await checkPause();
            countArray[i] += countArray[i - 1];
            let countCell = document.getElementById(`count-cell-${i}`);
            let prevCell = document.getElementById(`count-cell-${i-1}`);
            if (countCell) countCell.style.backgroundColor = 'orange';
            if (prevCell) prevCell.style.backgroundColor = 'red';
            animationStepsP.innerText = `Count[${i}] = Count[${i}] + Count[${i-1}] = ${countArray[i]}.`;
            await sleep(getAnimationSpeed());
            if (countCell) {
                countCell.querySelector('.count-value').innerText = countArray[i];
                countCell.style.backgroundColor = '';
            }
            if (prevCell) prevCell.style.backgroundColor = '';
        }
        animationStepsP.innerText = "Phase 3: Building sorted array from counts.";
        let outputArray = new Array(currentArray.length);
        for (let i = currentArray.length - 1; i >= 0; i--) {
            if (!isSorting) return;
            await checkPause();
            let val = currentArray[i];
            let pos = countArray[val] - 1;
            outputArray[pos] = val;
            countArray[val]--;
            renderBars(currentArray, { [i]: 'red' });
            let countCell = document.getElementById(`count-cell-${val}`);
            if (countCell) {
                countCell.style.backgroundColor = 'orange';
                countCell.querySelector('.count-value').innerText = countArray[val];
            }
            animationStepsP.innerText = `Placing ${val} at sorted index ${pos}.`;
            await sleep(getAnimationSpeed());
            if (countCell) countCell.style.backgroundColor = '';
        }
        animationStepsP.innerText = "Phase 4: Copying sorted array back.";
        for(let i=0; i<currentArray.length; i++) {
            if (!isSorting) return;
            await checkPause();
            currentArray[i] = outputArray[i];
            renderBars(currentArray, { [i]: '#22C55E' });
            await sleep(getAnimationSpeed());
        }
    }

    startBtn.addEventListener('click', async () => {
        if (isSorting) {
            isPaused = !isPaused;
            startBtn.innerText = isPaused ? "Resume" : "Pause";
            if (!isPaused) {
                animationStepsP.innerText = "Resuming...";
            } else {
                animationStepsP.innerText = "Paused. Click 'Resume' to continue.";
            }
        } else {
            isSorting = true;
            isPaused = false;
            startBtn.innerText = "Pause";
            disableControls(true);
            const selectedAlgorithm = algorithmSelect.value;
            switch(selectedAlgorithm) {
                case 'bubble': await bubbleSort(); break;
                case 'selection': await selectionSort(); break;
                case 'insertion': await insertionSort(); break;
                case 'merge': await mergeSort(0, currentArray.length - 1); break;
                case 'quick': await quickSort(0, currentArray.length - 1); break;
                case 'counting': await countingSort(); break;
            }
            if (isSorting) {
                animationStepsP.innerText = "Sort Complete!";
                renderBars(currentArray, Object.fromEntries(currentArray.map((_, i) => [i, '#22C55E'])));
            }
            isSorting = false;
            isPaused = false;
            enableControls();
        }
    });

    resetBtn.addEventListener('click', () => {
        isSorting = false;
        isPaused = false;
        enableControls();
        generateArray();
        updateAlgorithmInfo();
    });

    generateBtn.addEventListener('click', generateArray);
    arraySizeSlider.addEventListener('input', generateArray);
    algorithmSelect.addEventListener('change', updateAlgorithmInfo);

    generateArray();
    updateAlgorithmInfo();
}