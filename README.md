# Linear Regression as Minimization: Interactive Gradient Descent Demo

An interactive web application that demonstrates gradient descent for a simple intercept-only linear regression model (y = b). This is a single-page app built with vanilla HTML, CSS, and JavaScript, featuring interactive visualizations using Chart.js.

## Overview

This app helps students understand:
- **MSE (Mean Squared Error)**: How to measure fit quality
- **Optimization**: Finding the optimal intercept that minimizes MSE
- **Gradient Descent**: The algorithm for iteratively finding the minimum
- **Mathematical insight**: Why the optimal b* equals the mean of y-values

## Features

### 1. Main Interactive Section
- **Slider Control**: Adjust the intercept parameter b in real-time
- **Left Graph**: Shows your dataset points and the model line y = b
- **Right Graph**: Displays the MSE(b) curve with:
  - Current position (red dot) showing your current (b, MSE)
  - Optimal b* marked with a green star (at the minimum)
  - The parabolic MSE curve to visualize the optimization landscape

### 2. Gradient Descent Simulator
- **Learning Rate**: Control step size (0.001 to 1.0)
- **Iterations**: Specify how many steps to take
- **Randomize Starting b**: Generate a random starting point
- **Run Gradient Descent**: Animated step-by-step execution (200ms per step)
- **Step Once**: Manually advance one iteration
- **Iteration History Table**: Tracks each step with:
  - Iteration number
  - Current b value
  - MSE(b) at that point
  - Gradient (slope) at that point

### 3. Practice Section
- **New Practice Dataset**: Generates random y-values (3-4 points)
- **Interactive Slider**: Adjust b to fit the practice data
- **Reveal Solution**: Snap to optimal b* and display the answer
- Shows that b* is always the mean of y-values

### 4. Concept Check: 5 Practice Questions
Toggle-able answers for:
1. What does MSE measure?
2. Why is optimal b* equal to the mean of y-values?
3. What does learning rate control?
4. What does the MSE curve tell us?
5. What is the derivative dMSE/db?

## Files

- **index.html** (173 lines): Structure and layout with Chart.js integration
- **styles.css** (450+ lines): Clean, responsive styling with gradient colors and smooth animations
- **main.js** (450+ lines): All logic including:
  - MSE and derivative computations
  - Gradient descent implementation
  - Chart initialization and updates
  - Event handling and state management

## How to Use

### Quick Start
1. Open `index.html` in a web browser
2. Drag the main slider to see how the model line fits the data
3. Watch the MSE curve update in real-time

### Understanding the Math
- **Model**: y = b (horizontal line)
- **MSE Formula**: MSE(b) = (1/n) × Σ(y_i - b)²
- **Derivative**: dMSE/db = -(2/n) × Σ(y_i - b)
- **Gradient Descent Update**: b_new = b_old - learningRate × (dMSE/db)
- **Optimal**: b* = mean(y-values) → this is where the derivative equals zero

### Interactive Workflow

**Example 1: Manual Exploration**
1. Drag the slider and observe how MSE changes
2. Notice the red dot on the MSE curve follows your slider
3. Observe the green star marks the optimal position
4. The data shows points (2, 2.5) and (7, 6.5), so optimal b* ≈ 4.5

**Example 2: Gradient Descent**
1. Click "Randomize Starting b" to get a random start
2. Set Learning Rate to 0.2 and Iterations to 15
3. Click "Run Gradient Descent"
4. Watch the slider move automatically as the algorithm finds the minimum
5. Check the Iteration History to see b and MSE changing each step

**Example 3: Step-by-Step**
1. Randomize starting b
2. Click "Step Once" repeatedly
3. Observe small incremental changes in b
4. See how the red dot on the MSE curve moves toward the green star

**Example 4: Practice**
1. Click "New Practice Dataset"
2. Try to manually position the slider at what you think is optimal
3. Click "Reveal Solution" to see the answer
4. Notice that b* is always the mean of the y-values

## Technical Details

### Dependencies
- **Chart.js 3.9.1**: Via CDN for interactive charts
- **No other dependencies**: Pure vanilla JavaScript

### Responsive Design
- Mobile-friendly layout
- Graphs adapt to screen size
- Touch-friendly sliders and buttons

### Calculations
All computations are client-side, so:
- No network requests needed
- Instant feedback on interactions
- Works offline once loaded

## Learning Outcomes

After using this app, students should understand:

1. **MSE as a measure of fit**: The parabolic shape of the MSE curve shows why there's a unique minimum
2. **Optimization**: How calculus (derivatives) helps find the best solution
3. **Gradient descent algorithm**: How iterative refinement converges to the optimum
4. **Learning rate sensitivity**: Too high → overshooting; too low → slow convergence
5. **Linear regression closed form**: For the intercept-only case, the optimal value is simply the mean
6. **Generalization**: These principles extend to multi-parameter regression and modern deep learning

## Example Dataset

**Main Demo**: Points (2, 2.5) and (7, 6.5)
- Mean y-value: (2.5 + 6.5) / 2 = 4.5
- Optimal b* = 4.5
- MSE(4.5) = 0.25 (minimum)

## Keyboard & Mobile
- Sliders work with mouse drag, touch, arrow keys
- All buttons are keyboard-accessible
- Responsive layout for tablets and phones

## Further Extensions

This demo could be extended to include:
- Multiple regression (y = mx + b with both slope and intercept)
- Different loss functions (L1, Huber, etc.)
- Batch vs. stochastic gradient descent
- Momentum or adaptive learning rates
- Visualization of parameter space in higher dimensions

---

**Built to help students understand linear regression, MSE minimization, and gradient descent from first principles.**