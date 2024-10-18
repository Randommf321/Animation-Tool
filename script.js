const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const brushSizeInput = document.getElementById('brush-size');
const colorPicker = document.getElementById('color-picker');
const framePreviewBox = document.getElementById('frame-preview-box');
const eraseButton = document.getElementById('erase');
const removeFrameButton = document.getElementById('remove-frame');
const duplicateFrameButton = document.getElementById('duplicate-frame'); // New duplicate button
const frames = [];
let currentFrame = 0;
let isDrawing = false;
let brushSize = brushSizeInput.value;
let color = colorPicker.value;
let isErasing = false;
let lastX = 0;
let lastY = 0;

// Function to create a thumbnail for the frame
function createThumbnail(frameIndex) {
    const thumbnail = document.createElement('canvas');
    thumbnail.width = 60;
    thumbnail.height = 40;
    thumbnail.classList.add('frame-thumbnail');
    thumbnail.addEventListener('click', () => selectFrame(frameIndex));

    const thumbnailCtx = thumbnail.getContext('2d');
    const frameData = frames[frameIndex] || ctx.getImageData(0, 0, canvas.width, canvas.height);
    thumbnailCtx.putImageData(frameData, 0, 0, 0, 0, thumbnail.width, thumbnail.height);
    return thumbnail;
}

// Add frame thumbnail to preview
function updateFramePreview() {
    framePreviewBox.innerHTML = ''; // Clear previous previews
    frames.forEach((_, index) => {
        const thumbnail = createThumbnail(index);
        if (index === currentFrame) {
            thumbnail.classList.add('selected');
        }
        framePreviewBox.appendChild(thumbnail);
    });
}

// Frame functions
function newFrame() {
    if (frames[currentFrame]) {
        // Save the current frame before creating a new one
        frames[currentFrame] = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    // Clear the canvas for the new frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create a new frame and update the current frame index
    frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    currentFrame = frames.length - 1;
    updateFramePreview();
}

function duplicateFrame() {
    // Duplicate the current frame
    const duplicateData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    frames.push(duplicateData); // Push the duplicate data to frames
    currentFrame = frames.length - 1; // Set the current frame to the new duplicate
    updateFramePreview(); // Update the frame preview
}

function drawFrame(frame) {
    // Save the current frame before switching
    if (frames[currentFrame]) {
        frames[currentFrame] = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    // Clear the canvas and draw the selected frame's image data
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (frames[frame]) {
        ctx.putImageData(frames[frame], 0, 0);
    }
    currentFrame = frame;
    updateFramePreview();
}

// Select a specific frame by clicking on its thumbnail
function selectFrame(index) {
    currentFrame = index;
    drawFrame(currentFrame);
}

// Remove the current frame
function removeFrame() {
    if (frames.length > 1) {
        frames.splice(currentFrame, 1);
        currentFrame = Math.max(0, currentFrame - 1); // Move to previous frame or stay on the first one
        drawFrame(currentFrame);
    }
    updateFramePreview();
}

// Drawing mechanics
canvas.addEventListener('mousedown', (event) => {
    isDrawing = true;
    lastX = event.offsetX;
    lastY = event.offsetY;
    ctx.beginPath(); // Begin a new path when drawing starts
});

canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    // Save the current frame data when the mouse is released
    frames[currentFrame] = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.beginPath(); // Reset the path after drawing ends
});

canvas.addEventListener('mousemove', draw);

function draw(event) {
    if (!isDrawing) return; // Don't draw unless the mouse is pressed

    const x = event.offsetX;
    const y = event.offsetY;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';

    if (isErasing) {
        ctx.strokeStyle = 'white'; // Eraser clears with white
    } else {
        ctx.strokeStyle = color; // Use brush color
    }

    // Draw the line from the last position to the new position
    ctx.lineTo(x, y);
    ctx.stroke();

    // Reset the path and move to the new position
    ctx.beginPath();
    ctx.moveTo(x, y);
}

// Update brush size and color
brushSizeInput.addEventListener('input', (e) => {
    brushSize = e.target.value;
});
colorPicker.addEventListener('input', (e) => {
    color = e.target.value;
});

// Eraser toggle
eraseButton.addEventListener('click', () => {
    isErasing = !isErasing;
    eraseButton.classList.toggle('active', isErasing);
});

// Remove frame
removeFrameButton.addEventListener('click', removeFrame);

// Duplicate frame
duplicateFrameButton.addEventListener('click', duplicateFrame);

// Frame navigation
document.getElementById('add-frame').addEventListener('click', newFrame);
document.getElementById('next-frame').addEventListener('click', () => {
    if (currentFrame < frames.length - 1) {
        drawFrame(currentFrame + 1);
    }
});
document.getElementById('prev-frame').addEventListener('click', () => {
    if (currentFrame > 0) {
        drawFrame(currentFrame - 1);
    }
});

// Animation Playback
document.getElementById('play-animation').addEventListener('click', () => {
    let frame = 0;
    const interval = setInterval(() => {
        if (frame >= frames.length) {
            clearInterval(interval);
        } else {
            drawFrame(frame);
            frame++;
        }
    }, 100);
});

// Initialize the first frame
newFrame();
