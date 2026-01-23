import init, { setup, render_field, position } from "./lw_potential.js";

const frIndicator = document.getElementById("framerate");
const scale = 8;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const width = Math.round(Math.min(1200, window.innerWidth)/scale);
const height = Math.round(Math.min(940, window.innerHeight-40)/scale);
canvas.width = width;
canvas.height = height;
const cssWidth = scale*width;
const cssHeight = scale*height;
canvas.style.width = `${cssWidth}px`;
canvas.style.height = `${cssHeight}px`;
canvas.style.imageRendering = "pixelated";

let playing = true;
let t = 0;

await init();
setup();

const imageData = ctx.createImageData(
  canvas.width, canvas.height, {pixelFormat: "rgba-unorm8"});

let start;
let frame_count = 0;
let banked_ms = 0;
let last_timestamp;
function frame(timestamp) {
  if (!playing) {
    return;
  }
  if (start === undefined) {
    start = timestamp;
  }
  last_timestamp = timestamp;
  frame_count += 1;

  const elapsed = 0.001*(timestamp - start + banked_ms);
  if (elapsed > 0) {
    const framerate = frame_count / elapsed;
    const frInt = framerate.toFixed(1); // Math.round(framerate);
    frIndicator.innerHTML = `${frInt} FPS`;
  }

  render_field(
    imageData.data,
    canvas.width,
    canvas.height,
    elapsed,
  );

  // draw potential
  ctx.putImageData(imageData, 0, 0);
  // draw particle
  const scale = 4 / Math.min(width, height);
  const {x, y} = position(elapsed);
  const i = x/scale + width/2;
  const j = y/scale + height/2;
  ctx.beginPath();
  ctx.arc(i, j, 1, 0, 2*Math.PI);
  ctx.fillStyle = 'black';
  ctx.fill();

  requestAnimationFrame(frame);
}

function playClicked() {
  playing = !playing;
  if (!playing) {
    banked_ms += last_timestamp - start;
    start = undefined;
  }
  else {
    requestAnimationFrame(frame);
  }
}
document.getElementById("play").onclick = playClicked;
requestAnimationFrame(frame);
