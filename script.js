const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const capturedImage = document.getElementById('capturedImage');
const captureButton = document.getElementById('capture');
const originalImage = document.getElementById('originalImage');
const edgeDetectedImage = document.getElementById('edgeDetectedImage');
const sobelButton = document.getElementById('sobel');
const bwButton = document.getElementById('bw');
const brightnessButton = document.getElementById('brightness');
const glpfButton = document.getElementById('glpf');
const sharpenButton = document.getElementById('sharpen');
const useCameraButton = document.getElementById('useCamera');
const uploadButton = document.getElementById('upload');
const fileInput = document.getElementById('fileInput');

let currentImageSource = null;

function handleImage(imageSrc) {
    const context = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);
        const imageData = canvas.toDataURL('image/png');
        capturedImage.src = imageData;
        capturedImage.style.display = 'block';
        originalImage.src = imageData;
        originalImage.style.display = 'block';
    };
    img.src = imageSrc;
    currentImageSource = imageSrc;
}

// navigator.mediaDevices.getUserMedia({ video: true })
//     .then(stream => {
//         video.srcObject = stream;
//     })
//     .catch(err => {
//         console.error("Error accessing webcam: ", err);
//     });

// Event listener for using the camera
useCameraButton.addEventListener('click', () => {
    video.style.display = 'block';
    fileInput.style.display = 'none';
    canvas.style.display = 'none';

    // Start the camera when 'Use Camera' button is clicked
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            console.error("Error accessing webcam: ", err);
        });
});

// Event listener for uploading an image
uploadButton.addEventListener('click', () => {
    video.style.display = 'none';
    fileInput.style.display = 'block';
    canvas.style.display = 'none';
});

// Event listener for file input change
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            handleImage(reader.result);
        };
        reader.readAsDataURL(file);
    }
});

// Event listener for capturing an image
captureButton.addEventListener('click', () => {
    if (video.style.display === 'block') {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        capturedImage.src = imageData;
        capturedImage.style.display = 'block';
        originalImage.src = imageData;
        originalImage.style.display = 'block';
    } else if (currentImageSource) {
        handleImage(currentImageSource);
    }
});

// Event listener for Sobel filter
sobelButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const sobelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];

    const sobelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];

    function applySobel(x, y, kernel) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
                const pixelX = Math.min(canvas.width - 1, Math.max(0, x + kx));
                const pixelY = Math.min(canvas.height - 1, Math.max(0, y + ky));
                const index = (pixelY * canvas.width + pixelX) * 4;
                const gray = 0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
                sum += gray * kernel[ky + 1][kx + 1];
            }
        }
        return sum;
    }

    const outputData = context.createImageData(canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const gx = applySobel(x, y, sobelX);
            const gy = applySobel(x, y, sobelY);
            const magnitude = Math.sqrt(gx * gx + gy * gy);
            const index = (y * canvas.width + x) * 4;
            outputData.data[index] = magnitude;
            outputData.data[index + 1] = magnitude;
            outputData.data[index + 2] = magnitude;
            outputData.data[index + 3] = 255;
        }
    }

    context.putImageData(outputData, 0, 0);
    edgeDetectedImage.src = canvas.toDataURL('image/png');
    edgeDetectedImage.style.display = 'block';
});

// Event listener for black and white filter
bwButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let index = 0; index < data.length; index += 4) {
        const v = (data[index] + data[index + 1] + data[index + 2]) / 3;
        data[index] = v;
        data[index + 1] = v;
        data[index + 2] = v;
    }

    context.putImageData(imageData, 0, 0);
    edgeDetectedImage.src = canvas.toDataURL('image/png');
    edgeDetectedImage.style.display = 'block';
});

// Event listener for brightness adjustment
brightnessButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let index = 0; index < data.length; index += 4) {
        data[index] *= 1.2;     // Red
        data[index + 1] *= 1.2; // Green
        data[index + 2] *= 1.2; // Blue
    }

    context.putImageData(imageData, 0, 0);
    edgeDetectedImage.src = canvas.toDataURL('image/png');
    edgeDetectedImage.style.display = 'block';
});

// Event listener for Gaussian low-pass filter
glpfButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const kernel = [
        [1 / 16, 1 / 8, 1 / 16],
        [1 / 8, 1 / 4, 1 / 8],
        [1 / 16, 1 / 8, 1 / 16]
    ];

    function applyKernel(x, y) {
        let r = 0, g = 0, b = 0;
        for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
                const px = Math.min(canvas.width - 1, Math.max(0, x + kx));
                const py = Math.min(canvas.height - 1, Math.max(0, y + ky));
                const idx = (py * canvas.width + px) * 4;
                r += data[idx] * kernel[ky + 1][kx + 1];
                g += data[idx + 1] * kernel[ky + 1][kx + 1];
                b += data[idx + 2] * kernel[ky + 1][kx + 1];
            }
        }
        return [r, g, b];
    }

    const outputData = context.createImageData(canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            const [r, g, b] = applyKernel(x, y);
            outputData.data[idx] = r;
            outputData.data[idx + 1] = g;
            outputData.data[idx + 2] = b;
            outputData.data[idx + 3] = 255;
        }
    }

    context.putImageData(outputData, 0, 0);
    edgeDetectedImage.src = canvas.toDataURL('image/png');
    edgeDetectedImage.style.display = 'block';
});

// Event listener for sharpening filter
sharpenButton.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const kernel = [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]
    ];

    function applyKernel(x, y) {
        let r = 0, g = 0, b = 0;
        for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
                const px = Math.min(canvas.width - 1, Math.max(0, x + kx));
                const py = Math.min(canvas.height - 1, Math.max(0, y + ky));
                const idx = (py * canvas.width + px) * 4;
                r += data[idx] * kernel[ky + 1][kx + 1];
                g += data[idx + 1] * kernel[ky + 1][kx + 1];
                b += data[idx + 2] * kernel[ky + 1][kx + 1];
            }
        }
        return [r, g, b];
    }

    const outputData = context.createImageData(canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            const [r, g, b] = applyKernel(x, y);
            outputData.data[idx] = Math.min(255, Math.max(0, r));
            outputData.data[idx + 1] = Math.min(255, Math.max(0, g));
            outputData.data[idx + 2] = Math.min(255, Math.max(0, b));
            outputData.data[idx + 3] = 255;
        }
    }

    context.putImageData(outputData, 0, 0);
    edgeDetectedImage.src = canvas.toDataURL('image/png');
    edgeDetectedImage.style.display = 'block';
});