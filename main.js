// ============================================================================
// Linear Regression as Minimization (Intercept-only Model)
// Interactive web app demonstrating gradient descent for y = b
// ============================================================================

// ============================================================================
// Data and State
// ============================================================================

// Main dataset: fixed points for demonstration
const mainData = {
    points: [
        { x: 2, y: 2.5 },
        { x: 7, y: 6.5 }
    ],
    optimalB: null // Will be computed as mean of y values
};

// Practice dataset: randomly generated per difficulty
let practiceData = {
    points: [],
    optimalB: null
};

// Concept check questions (rendered dynamically)
const conceptQuestions = [
    {
        questionText: 'Why is the optimal intercept b* equal to the average of the y-values in this intercept-only model?',
        answerText: 'Because minimizing MSE requires setting the derivative dMSE/db to zero. For y = b, dMSE/db = -(2/n) Σ(y_i - b). Setting this to zero gives b* = (1/n) Σ y_i, the mean of the y-values.'
    },
    {
        questionText: 'Looking at the residual bars, what does it mean when one bar is much longer than the others?',
        answerText: 'A long residual bar means that point is far from the model line y = b, contributing a large squared error. It highlights where the fit is worst and which point has the most influence on MSE.'
    },
    {
        questionText: 'If we increase b slightly from its optimal value, what happens to MSE(b)?',
        answerText: 'Moving b away from its optimal value (the mean) increases MSE because the parabola opens upward. Any deviation from b* makes residuals larger in magnitude on average, so MSE rises.'
    },
    {
        questionText: 'How does a very large outlier in the data affect the location of the minimum of MSE(b)?',
        answerText: 'A large outlier pulls the mean upward (or downward), shifting b* toward the outlier. Because MSE squares residuals, outliers have strong influence on where the minimum occurs.'
    }
];

// Gradient descent state
let gdState = {
    currentB: 3,
    history: [], // Array of { iteration, b, mse, gradient }
    isRunning: false
};

// Chart instances
let dataChart = null;
let mseChart = null;
let practiceChart = null;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Compute Mean Squared Error for the intercept-only model y = b
 * MSE(b) = (1/n) * sum((y_i - b)^2)
 */
function computeMSE(data, b) {
    const residuals = data.points.map(point => point.y - b);
    const squaredErrors = residuals.map(r => r * r);
    const mse = squaredErrors.reduce((sum, err) => sum + err, 0) / data.points.length;
    return mse;
}

/**
 * Compute the derivative of MSE with respect to b
 * dMSE/db = -(2/n) * sum(y_i - b)
 */
function computeMSEDerivative(data, b) {
    const residuals = data.points.map(point => point.y - b);
    const sumResiduals = residuals.reduce((sum, r) => sum + r, 0);
    const derivative = -(2 / data.points.length) * sumResiduals;
    return derivative;
}

/**
 * Compute optimal b as the mean of y-values
 */
function computeOptimalB(data) {
    const yValues = data.points.map(p => p.y);
    const mean = yValues.reduce((sum, y) => sum + y, 0) / yValues.length;
    return mean;
}

/**
 * Generate a new random practice dataset according to difficulty.
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @returns {{points: Array<{x:number,y:number}>, optimalB: number}}
 */
function generatePracticeDataset(difficulty = 'medium') {
    let countMin = 3;
    let countMax = 4;

    if (difficulty === 'easy') {
        countMin = 2;
        countMax = 2;
    } else if (difficulty === 'hard') {
        countMin = 5;
        countMax = 8;
    }

    const numPoints = Math.floor(Math.random() * (countMax - countMin + 1)) + countMin;
    const points = [];

    for (let i = 0; i < numPoints; i++) {
        const x = i + 1; // simple index-based x for clarity
        let y = 1 + Math.random() * 9; // range [1,10)

        // For hard mode, optionally create an outlier
        if (difficulty === 'hard' && Math.random() < 0.2 && i === numPoints - 1) {
            y = 12 + Math.random() * 8; // outlier in roughly [12,20)
        }

        points.push({ x, y });
    }

    return {
        points,
        optimalB: computeOptimalB({ points })
    };
}

/**
 * Replace current practice dataset and refresh dependent state.
 */
function setPracticeDataset(newData) {
    practiceData = {
        points: newData.points,
        optimalB: newData.optimalB
    };
}

// ============================================================================
// Initialization
// ============================================================================

function initializeApp() {
    // Compute optimal b for main dataset
    mainData.optimalB = computeOptimalB(mainData);
    
    // Generate initial practice dataset (default medium)
    setPracticeDataset(generatePracticeDataset('medium'));
    
    // Initialize charts
    initializeCharts();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial update
    updateMainDisplay();
    updatePracticeDisplay();
    renderConceptCheckQuestions();
}

// ============================================================================
// Concept Check Rendering
// ============================================================================

/**
 * Render concept questions dynamically with show/hide answer toggles.
 */
function renderConceptCheckQuestions() {
    const container = document.getElementById('concept-questions');
    if (!container) return;

    container.innerHTML = '';

    conceptQuestions.forEach((q, idx) => {
        const card = document.createElement('div');
        card.className = 'question-card';

        const title = document.createElement('h3');
        title.textContent = `Question ${idx + 1}: ${q.questionText}`;

        const button = document.createElement('button');
        button.className = 'reveal-btn';
        button.textContent = 'Show answer';

        const answer = document.createElement('div');
        answer.className = 'answer';
        answer.style.display = 'none';
        answer.innerHTML = `<p><strong>Answer:</strong> ${q.answerText}</p>`;

        // Toggle behavior
        button.addEventListener('click', () => {
            const hidden = answer.style.display === 'none';
            answer.style.display = hidden ? 'block' : 'none';
            button.textContent = hidden ? 'Hide answer' : 'Show answer';
        });

        card.appendChild(title);
        card.appendChild(button);
        card.appendChild(answer);
        container.appendChild(card);
    });
}

// ============================================================================
// Residual Visualization Helpers
// ============================================================================

/**
 * Generate residual bars as a dataset for the chart.
 * Creates line segments from each data point to the model line y = b.
 * These are rendered as separate line series on the scatter plot.
 */
function generateResidualBars(data, b) {
    const residualBars = [];
    
    data.points.forEach(point => {
        // Draw a vertical line from the point to the model line
        const residual = point.y - b;
        residualBars.push({
            x: point.x,
            y: point.y
        });
        residualBars.push({
            x: point.x,
            y: b
        });
        residualBars.push({
            x: null,  // Break in line
            y: null
        });
    });
    
    return residualBars;
}

/**
 * Update the residual error table with current residual values.
 * Recalculates residuals and squared errors for all data points.
 */
function updateResidualTable(data, b) {
    const tbody = document.getElementById('residual-tbody');
    tbody.innerHTML = ''; // Clear existing rows
    
    let totalSquaredError = 0;
    
    data.points.forEach((point, index) => {
        const residual = point.y - b;
        const squaredError = residual * residual;
        totalSquaredError += squaredError;
        
        const row = document.createElement('tr');
        const residualClass = residual > 0 ? 'residual-positive' : 'residual-negative';
        
        row.innerHTML = `
            <td>${point.x.toFixed(2)}</td>
            <td>${point.y.toFixed(2)}</td>
            <td>${b.toFixed(2)}</td>
            <td class="${residualClass}">${residual.toFixed(4)}</td>
            <td>${squaredError.toFixed(4)}</td>
        `;
        tbody.appendChild(row);
    });
    
    // Add a summary row with MSE
    const summaryRow = document.createElement('tr');
    summaryRow.style.borderTop = '2px solid #667eea';
    summaryRow.style.fontWeight = 'bold';
    const mse = totalSquaredError / data.points.length;
    summaryRow.innerHTML = `
        <td colspan="4" style="text-align: right; padding-right: 15px;">Mean Squared Error (MSE):</td>
        <td>${mse.toFixed(4)}</td>
    `;
    tbody.appendChild(summaryRow);
}

// ============================================================================
// Chart Initialization
// ============================================================================

function initializeCharts() {
    // Main data chart (left)
    const dataCtx = document.getElementById('dataChart').getContext('2d');
    dataChart = new Chart(dataCtx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Data Points',
                    data: mainData.points,
                    backgroundColor: '#667eea',
                    borderColor: '#667eea',
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    showLine: false
                },
                {
                    label: 'Residual Bars',
                    type: 'line',
                    data: generateResidualBars(mainData, 3),
                    borderColor: 'rgba(255, 107, 107, 0.5)',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    tension: 0,
                    showLine: true,
                    borderDash: [2, 2]
                },
                {
                    label: 'Model Line (y = b)',
                    type: 'line',
                    data: generateLineData(mainData, 3),
                    borderColor: '#ff6b6b',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: -1,
                    max: 10,
                    title: {
                        display: true,
                        text: 'x'
                    }
                },
                y: {
                    min: -2,
                    max: 10,
                    title: {
                        display: true,
                        text: 'y'
                    }
                }
            }
        }
    });

    // MSE curve chart (right)
    const mseCtx = document.getElementById('mseChart').getContext('2d');
    const bRange = generateBRange(-10, 10, 50);
    const mseCurve = bRange.map(b => ({
        x: b,
        y: computeMSE(mainData, b)
    }));

    mseChart = new Chart(mseCtx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'MSE(b) Curve',
                    data: mseCurve,
                    borderColor: '#667eea',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0,
                    tension: 0.4,
                    showLine: true
                },
                {
                    label: 'Current (b, MSE)',
                    data: [{ x: 3, y: computeMSE(mainData, 3) }],
                    backgroundColor: '#ff6b6b',
                    borderColor: '#ff6b6b',
                    borderWidth: 2,
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    showLine: false
                },
                {
                    label: 'Optimal b*',
                    data: [{ x: mainData.optimalB, y: computeMSE(mainData, mainData.optimalB) }],
                    backgroundColor: '#51cf66',
                    borderColor: '#51cf66',
                    borderWidth: 2,
                    pointRadius: 8,
                    pointStyle: 'star',
                    showLine: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: -10,
                    max: 10,
                    title: {
                        display: true,
                        text: 'b'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'MSE(b)'
                    },
                    beginAtZero: true
                }
            }
        }
    });

    // Practice chart
    const practiceCtx = document.getElementById('practiceChart').getContext('2d');
    practiceChart = new Chart(practiceCtx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Practice Data Points',
                    data: practiceData.points,
                    backgroundColor: '#ff922b',
                    borderColor: '#ff922b',
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    showLine: false
                },
                {
                    label: 'Model Line (y = b)',
                    type: 'line',
                    data: generateLineData(practiceData, 3),
                    borderColor: '#845ef7',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: -1,
                    max: 12,
                    title: {
                        display: true,
                        text: 'x'
                    }
                },
                y: {
                    min: -2,
                    max: 12,
                    title: {
                        display: true,
                        text: 'y'
                    }
                }
            }
        }
    });
}

/**
 * Generate points for a horizontal line y = b across a range of x values
 */
function generateLineData(data, b) {
    const xMin = Math.min(...data.points.map(p => p.x)) - 1;
    const xMax = Math.max(...data.points.map(p => p.x)) + 1;
    return [
        { x: xMin, y: b },
        { x: xMax, y: b }
    ];
}

/**
 * Generate an array of b values for plotting the MSE curve
 */
function generateBRange(min, max, steps) {
    const range = [];
    const step = (max - min) / steps;
    for (let i = 0; i <= steps; i++) {
        range.push(min + i * step);
    }
    return range;
}

// ============================================================================
// MSE Formula Display Helper
// ============================================================================

/**
 * Render a live MSE formula with symbolic form, numeric substitution,
 * and the evaluated MSE for the current b and dataset.
 */
function updateMSEFormulaDisplay(b, data) {
    const box = document.getElementById('mse-formula-box');
    if (!box) return;

    const yVals = data.points.map(p => p.y);
    const n = yVals.length;

    // Symbolic line: MSE(b) = 1/n * [ (y1 - b)^2 + ... ]
    const symbolicParts = yVals.map((_, idx) => `(y${idx + 1} - b)^2`).join(' + ');
    const symbolicLine = `MSE(b) = 1/${n} * [ ${symbolicParts} ]`;

    // Numeric substitution line
    const numericParts = yVals
        .map(y => `(${y.toFixed(2)} - ${b.toFixed(2)})^2`)
        .join(' + ');
    const numericLine = `= 1/${n} * [ ${numericParts} ]`;

    // Evaluated value
    const mseVal = computeMSE(data, b);
    const valueLine = `= ${mseVal.toFixed(4)}`;

    box.innerHTML = `
        <div class="formula-line">${symbolicLine}</div>
        <div class="formula-line">${numericLine}</div>
        <div class="formula-line">${valueLine}</div>
    `;
}

// ============================================================================
// Update Functions
// ============================================================================

function updateMainDisplay() {
    const bValue = parseFloat(document.getElementById('intercept-slider').value);
    const mseValue = computeMSE(mainData, bValue);

    // Update slider display
    document.getElementById('intercept-value').textContent = bValue.toFixed(2);
    document.getElementById('mse-display').textContent = mseValue.toFixed(4);

    // Update data chart: model line and residual bars
    if (dataChart) {
        // Update residual bars dataset (index 1)
        dataChart.data.datasets[1].data = generateResidualBars(mainData, bValue);
        // Update model line dataset (index 2)
        dataChart.data.datasets[2].data = generateLineData(mainData, bValue);
        dataChart.update();
    }

    // Update MSE chart: current point
    if (mseChart) {
        mseChart.data.datasets[1].data = [{ x: bValue, y: mseValue }];
        mseChart.update();
    }
    
    // Update residual table and live MSE formula
    updateResidualTable(mainData, bValue);
    updateMSEFormulaDisplay(bValue, mainData);
}

function updatePracticeDisplay() {
    const bValue = parseFloat(document.getElementById('practice-slider').value);
    const mseValue = computeMSE(practiceData, bValue);

    // Update slider display
    document.getElementById('practice-intercept-value').textContent = bValue.toFixed(2);
    document.getElementById('practice-mse-display').textContent = mseValue.toFixed(4);

    // Update practice chart: model line
    if (practiceChart) {
        practiceChart.data.datasets[1].data = generateLineData(practiceData, bValue);
        practiceChart.update();
    }
}

function setupEventListeners() {
    // Main slider
    document.getElementById('intercept-slider').addEventListener('input', (e) => {
        gdState.currentB = parseFloat(e.target.value);
        updateMainDisplay();
    });

    // Practice slider
    document.getElementById('practice-slider').addEventListener('input', (e) => {
        updatePracticeDisplay();
    });

    // Gradient Descent: Randomize
    document.getElementById('randomize-btn').addEventListener('click', () => {
        const randomB = Math.random() * 20 - 10; // Range [-10, 10]
        document.getElementById('intercept-slider').value = randomB.toFixed(2);
        gdState.currentB = randomB;
        gdState.history = [];
        updateMainDisplay();
        clearIterationsTable();
    });

    // Gradient Descent: Run
    document.getElementById('run-gd-btn').addEventListener('click', runGradientDescent);

    // Gradient Descent: Step Once
    document.getElementById('step-once-btn').addEventListener('click', stepGradientDescent);

    // Practice: New Dataset
    document.getElementById('new-practice-btn').addEventListener('click', () => {
        const difficulty = document.getElementById('practice-difficulty').value || 'medium';
        setPracticeDataset(generatePracticeDataset(difficulty));
        document.getElementById('practice-slider').value = 3;
        document.getElementById('practice-optimal-display').style.display = 'none';
        updatePracticeDisplay();
        updatePracticeChart();
    });

    // Practice: Reveal Solution
    document.getElementById('reveal-solution-btn').addEventListener('click', () => {
        document.getElementById('practice-slider').value = practiceData.optimalB.toFixed(2);
        document.getElementById('practice-optimal-value').textContent = practiceData.optimalB.toFixed(2);
        document.getElementById('practice-optimal-display').style.display = 'block';
        updatePracticeDisplay();
    });

    // Concept Questions: Toggle answers
    document.querySelectorAll('.reveal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const answer = e.target.nextElementSibling;
            const isHidden = answer.style.display === 'none';
            answer.style.display = isHidden ? 'block' : 'none';
            e.target.textContent = isHidden ? 'Hide Answer' : 'Reveal Answer';
        });
    });
}

// ============================================================================
// Gradient Descent Simulation
// ============================================================================

/**
 * Animate the ball moving smoothly from oldB to newB along the MSE curve.
 * Uses requestAnimationFrame for smooth 60fps animation.
 * Updates the current b value and UI as the ball moves.
 * 
 * @param {number} oldB - Starting b value
 * @param {number} newB - Ending b value
 * @param {function} onDone - Callback when animation completes
 */
async function animateGradientDescentStep(oldB, newB, onDone) {
    const duration = 400; // milliseconds for the animation
    const steps = 20; // number of interpolation steps
    const stepDuration = duration / steps;

    for (let i = 1; i <= steps; i++) {
        // Ease-out cubic interpolation for smooth deceleration
        const progress = i / steps;
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        // Interpolate b value
        const currentB = oldB + (newB - oldB) * easeProgress;
        
        // Update state and UI
        gdState.currentB = currentB;
        document.getElementById('intercept-slider').value = currentB.toFixed(2);
        updateMainDisplay();
        
        // Wait for next frame
        await new Promise(resolve => setTimeout(resolve, stepDuration));
    }

    // Ensure we end exactly at newB
    gdState.currentB = newB;
    document.getElementById('intercept-slider').value = newB.toFixed(2);
    updateMainDisplay();

    // Call the callback when done
    if (onDone) onDone();
}

async function stepGradientDescent() {
    const learningRate = parseFloat(document.getElementById('learning-rate').value);
    
    const currentB = gdState.currentB;
    const gradient = computeMSEDerivative(mainData, currentB);
    const newB = currentB - learningRate * gradient;
    const mse = computeMSE(mainData, currentB);

    // Add to history
    const iteration = gdState.history.length;
    gdState.history.push({
        iteration,
        b: currentB,
        mse,
        gradient
    });

    addIterationRow(iteration, currentB, mse, gradient);

    // Animate the ball moving to the new b value
    await animateGradientDescentStep(currentB, newB, () => {
        // Animation complete
    });
}

async function runGradientDescent() {
    if (gdState.isRunning) return;
    
    gdState.isRunning = true;
    const learningRate = parseFloat(document.getElementById('learning-rate').value);
    const iterations = parseInt(document.getElementById('iterations').value);

    // Clear history
    gdState.history = [];
    clearIterationsTable();

    for (let i = 0; i < iterations; i++) {
        const currentB = gdState.currentB;
        const gradient = computeMSEDerivative(mainData, currentB);
        const newB = currentB - learningRate * gradient;
        const mse = computeMSE(mainData, currentB);

        // Add to history
        gdState.history.push({
            iteration: i,
            b: currentB,
            mse,
            gradient
        });

        addIterationRow(i, currentB, mse, gradient);

        // Animate the ball moving to the new b value
        await animateGradientDescentStep(currentB, newB, () => {
            // Animation complete, ready for next step
        });
    }

    gdState.isRunning = false;
}

function addIterationRow(iteration, b, mse, gradient) {
    const tbody = document.getElementById('iterations-body');
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${iteration}</td>
        <td>${b.toFixed(4)}</td>
        <td>${mse.toFixed(4)}</td>
        <td>${gradient.toFixed(4)}</td>
    `;
    tbody.appendChild(row);

    // Scroll to the latest row
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearIterationsTable() {
    document.getElementById('iterations-body').innerHTML = '';
}

function updatePracticeChart() {
    if (practiceChart) {
        practiceChart.data.datasets[0].data = practiceData.points;
        const bValue = parseFloat(document.getElementById('practice-slider').value);
        practiceChart.data.datasets[1].data = generateLineData(practiceData, bValue);
        practiceChart.update();
    }
}

// ============================================================================
// Run on Page Load
// ============================================================================

document.addEventListener('DOMContentLoaded', initializeApp);
