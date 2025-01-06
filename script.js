let n2 = 128;
let maxAltitude = 100;
const rotationDegree = 60 * (Math.PI / 180);
const height = window.innerHeight / Math.cos(rotationDegree) * 2;
const width = window.innerWidth * 3;
let cellSize = width / n2 + 2;
let n1 = Math.floor(height / cellSize);

const canvas = document.getElementById('grid');
const ctx = canvas.getContext('2d');  // Get the canvas 2D context

// Set the width and height of the canvas
canvas.width = width;
canvas.height = height;

const dpr = window.devicePixelRatio;
const rect = canvas.getBoundingClientRect();
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;
ctx.scale(dpr, dpr);
canvas.style.width = `${rect.width}px`;
canvas.style.height = `${rect.height}px`;


drawGrid(getProjectedGrid());

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function animate() {
    while (true) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas for redrawing
        drawGrid(getProjectedGrid());
        await delay(16);
        count++;
    }
}

function drawGrid(projectedGrid) {
    for (let i = 0; i < projectedGrid.length; i++) {
        for (let j = 0; j < projectedGrid[0].length; j++) {
            horLine(i, j, projectedGrid);
            rightDiagLine(i, j, projectedGrid);
            leftDiagLine(i, j, projectedGrid);
            verLine(i, j, projectedGrid);
        }
    }
}

function leftDiagLine(i, j, projectedGrid) {
    if (i + 1 < projectedGrid.length && j + 1 < projectedGrid[0].length) {
        let diagStartX = projectedGrid[i + 1][j][0];
        let diagStartY = projectedGrid[i + 1][j][1];
        let diagEndX = projectedGrid[i][j + 1][0];
        let diagEndY = projectedGrid[i][j + 1][1];
        drawLine(diagStartX, diagEndX, diagStartY, diagEndY);
    }
}

function rightDiagLine(i, j, projectedGrid) {
    if (i + 1 < projectedGrid.length && j + 1 < projectedGrid[0].length) {
        let diagStartX = projectedGrid[i][j][0];
        let diagStartY = projectedGrid[i][j][1];
        let diagEndX = projectedGrid[i + 1][j + 1][0];
        let diagEndY = projectedGrid[i + 1][j + 1][1];
        drawLine(diagStartX, diagEndX, diagStartY, diagEndY);
    }
}

function horLine(i, j, projectedGrid) {
    if (j + 1 < projectedGrid[0].length) {
        // Draw horizontal lines
        let horStartX = projectedGrid[i][j][0];
        let horStartY = projectedGrid[i][j][1];
        let horEndX = projectedGrid[i][j + 1][0];
        let horEndY = projectedGrid[i][j + 1][1];
        drawLine(horStartX, horEndX, horStartY, horEndY);
    }
}

function verLine(i, j, projectedGrid) {
    if (i + 1 < projectedGrid.length) {
        // Draw vertical lines
        let verStartX = projectedGrid[i][j][0];
        let verStartY = projectedGrid[i][j][1];
        let verEndX = projectedGrid[i + 1][j][0];
        let verEndY = projectedGrid[i + 1][j][1];
        drawLine(verStartX, verEndX, verStartY, verEndY);
    }
}

function drawLine(startX, endX, startY, endY) {
    // Calculate length and angle
    let length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    let angle = Math.atan2(endY - startY, endX - startX);

    // Set the line properties and draw it

    ctx.beginPath();  // Start drawing
    ctx.moveTo(startX, startY);  // Move to the start point
    ctx.lineTo(endX, endY);  // Draw a line to the end point
    ctx.strokeStyle = 'green';  // Set the line color
    ctx.lineWidth = 1;  // Set the line width
    ctx.stroke();  // Apply the stroke (draw the line)

}

function getProjectedGrid() {
    let projectedMatrix = [];
    let perspectiveFactor = 0.03;  // Adjust this to control perspective depth
    let matrix = createTerrain(getPointCoordsIn3D());
    for (let i = 0; i <= n1; i++) {
        projectedMatrix[i] = [];

        // Calculate shrink factor linearly with depth
        let shrinkFactor = 1 / (1 + i * perspectiveFactor);
        let marginX = (width - cellSize * shrinkFactor * n2) / 2;

        for (let j = 0; j <= n2; j++) {
            let [x, y, z] = [matrix[i][j][0], matrix[i][j][1], matrix[i][j][2]];
            let projectedVector = rotationAndProjection(rotationDegree, x, y, z);

            // Apply the perspective scaling to x and y coordinates
            let vecX = projectedVector[0] * shrinkFactor + marginX;
            let vecY = height - projectedVector[1] * shrinkFactor;

            projectedMatrix[i][j] = [vecX, vecY];
        }
    }
    return projectedMatrix;
}

function getPointCoordsIn3D() {
    let matrix = [];
    for (let i = 0; i <= n1; i++) {
        matrix[i] = [];
        for (let j = 0; j <= n2; j++) {
            matrix[i][j] = [(j + (Math.random() - 1 / 2) * 0.8) * cellSize, i * cellSize, 0];
        }
    }
    return matrix;
}

function createTerrain(matrix) {
    let m = Math.floor(Math.random() * n1);
    let n = Math.floor(Math.random() * n2);
    let visited = [];
    for (let i = 0; i <= n1; i++) {
        visited[i] = [];
        for (let j = 0; j <= n2; j++) {
            visited[i][j] = false;
        }
    }

    let queue = [];
    queue.push([m, n]);
    matrix[m][n][2] = randomAltitude();
    visited[m][n] = true;

    let currAltitude = maxAltitude;
    let count = 0;
    while (queue.length != 0) {
        let currCell = queue.shift();
        currAltitude = matrix[currCell[0]][currCell[1]][2];


        checkNeighbors([currCell[0] - 1, currCell[1]], visited, queue, currAltitude, matrix);

        checkNeighbors([currCell[0], currCell[1] - 1], visited, queue, currAltitude, matrix);
        checkNeighbors([currCell[0], currCell[1] + 1], visited, queue, currAltitude, matrix);

        checkNeighbors([currCell[0] + 1, currCell[1]], visited, queue, currAltitude, matrix);

        console.log('eight');
        count++;
    }
    return matrix;
}

function randomAltitude() {
    return (Math.random() - 0.5) * maxAltitude;
}
function checkNeighbors(neighbor, visited, queue, currAltitude, matrix) {
    if (
        neighbor[0] >= 0 && neighbor[0] <= n1 && // Check row bounds
        neighbor[1] >= 0 && neighbor[1] <= n2 && // Check column bounds
        !visited[neighbor[0]][neighbor[1]] // Check if already visited
    ) {
        queue.push(neighbor);
        matrix[neighbor[0]][neighbor[1]][2] = randomAltitude();
        visited[neighbor[0]][neighbor[1]] = true;
    }
}

function rotationAndProjection(deg, x, y, z) {
    return [x, (y * Math.cos(deg) - z * Math.sin(deg))];
}
function noise(currAltitude) {

    let altitude = currAltitude + (Math.random() - 0.5) * 10;
    console.log(altitude);
    return altitude;
}