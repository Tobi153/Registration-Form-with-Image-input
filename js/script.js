"use strict";
// Select DOM elements

const elements = {
  iconEye: document.querySelector(".lucide-eye-icon"),
  iconEyeOff: document.querySelector(".lucide-eye-off-icon"),
  passwordInput: document.querySelector(".password-input"),
  captureBtn: document.getElementById("capture-btn"),
  cameraFeed: document.getElementById("camera-feed"),
  canvas: document.getElementById("canvas"),
  snapshotContainer: document.getElementById("snapshot-container"),
  iconAvatar: document.getElementById("icon-avatar"),
  toggleBtn: document.querySelector(".toggle-btn"),
  retakeBtn: document.getElementById("retake-btn"),
  captureContainer: document.querySelector(".capture-container"),
  photoInput: document.getElementById("photo-input"),
};

// Initial setup
elements.iconEyeOff.classList.add("hidden");
elements.iconEye.classList.add("hidden");
elements.retakeBtn.classList.add("hidden");

let cameraStream = null;
let cameraState = "idle"; // State management: 'idle', 'streaming', 'captured'
let isTogglingPassword = false;
// Access the camera
async function startCamera() {
  // if (cameraState !== " idle") return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 720 }, height: { ideal: 720 } },
    });
    elements.cameraFeed.srcObject = stream;
    cameraStream = stream;
    elements.cameraFeed.classList.remove("hidden");
    // elements.iconAvatar.classList.add("hidden");
    elements.snapshotContainer.innerHTML = "";
    elements.snapshotContainer.appendChild(elements.cameraFeed);
    elements.captureBtn.textContent = "Take Photo";
    cameraState = "streaming";
  } catch (error) {
    console.error("Error accessing camera: ", error);
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
    elements.cameraFeed.srcObject = null;
    elements.cameraFeed.classList.add("hidden");
  }
}

function captureSnapshot() {
  const context = elements.canvas.getContext("2d");
  elements.canvas.width = 720;
  elements.canvas.height = 720;
  context.drawImage(
    elements.cameraFeed,
    0,
    0,
    elements.canvas.width,
    elements.canvas.height
  );

  const imageDataURL = elements.canvas.toDataURL("image/png");
  // elements.snapshotContainer.appendChild(imageDataURL);
  elements.photoInput.value = imageDataURL;

  // Display the snapshot
  const snapshotImage = document.createElement("img");
  snapshotImage.src = imageDataURL;
  snapshotImage.classList.add("w-50", "h-50", "object-cover", "rounded-sm");
  elements.snapshotContainer.innerHTML = "";
  elements.snapshotContainer.appendChild(snapshotImage);

  stopCamera();
  elements.retakeBtn.classList.remove("hidden");
  elements.captureBtn.textContent = "Use Photo";
  cameraState = "captured";
}

function recaptureImage() {
  elements.retakeBtn.classList.add("hidden");
  elements.captureBtn.textContent = "Take Photo";
  elements.snapshotContainer.innerHTML = "";
  elements.snapshotContainer.appendChild(elements.cameraFeed);
  cameraState = "streaming";
  startCamera();
}
// Take the snapshot
function usePhoto() {
  elements.captureContainer.classList.add("hidden");
}

elements.retakeBtn.addEventListener("click", recaptureImage);
elements.captureBtn.addEventListener("click", () => {
  switch (cameraState) {
    case "idle":
      startCamera();
      break;
    case "streaming":
      captureSnapshot();
      break;
    case "captured":
      usePhoto();
      break;
  }
});

elements.passwordInput.addEventListener("focus", () => {
  elements.iconEye.classList.remove("hidden");
});

elements.toggleBtn.addEventListener("mousedown", () => {
  isTogglingPassword = true;
});

elements.toggleBtn.addEventListener("mouseup", () => {
  isTogglingPassword = false;
});

elements.passwordInput.addEventListener("blur", (e) => {
  if (isTogglingPassword) {
    elements.passwordInput.focus();
    // No need to preventDefault; blur isn't cancelable, but refocus works
  }
});

elements.toggleBtn.addEventListener("click", (e) => {
  const isPasswordVisible = elements.passwordInput.type === "text";
  elements.passwordInput.type = isPasswordVisible ? "password" : "text";
  elements.iconEye.style.display = isPasswordVisible ? "block" : "none";
  elements.iconEyeOff.style.display = isPasswordVisible ? "none" : "block";
});
console.log(elements.passwordInput);

window.addEventListener("beforeunload", stopCamera);
