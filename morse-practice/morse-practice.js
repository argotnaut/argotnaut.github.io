// Morse Code Practice – script.js
const MORSE_MAP = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.',
  H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.',
  O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-',
  W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.'
};

const TARGET_EL = document.getElementById('target');
const MORSE_INPUT_EL = document.getElementById('morseInput');
const SCORE_EL = document.getElementById('score');
const SUBMIT_BTN = document.getElementById('submitBtn');

let currentMessage = '';
let score = 0;
let currentLetter = ''; // dots/dashes for the ongoing letter
let letters = []; // array of completed letter strings
let lastReleaseTime = null; // timestamp of previous keyup
const DOT_THRESHOLD = 300; // ms, below is dot
const LETTER_PAUSE = 800; // ms, pause indicates end of letter

function generateMessage() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const len = Math.floor(Math.random() * 4) + 3; // 3-6 characters
  let msg = '';
  for (let i = 0; i < len; i++) {
    msg += chars[Math.floor(Math.random() * chars.length)];
  }
  currentMessage = msg;
  TARGET_EL.textContent = msg;
  resetInput();
}

function getMorseOf(msg) {
  return msg.split('').map(ch => MORSE_MAP[ch] || '').join(' ');
}

function resetInput() {
  currentLetter = '';
  letters = [];
  lastReleaseTime = null;
  updateDisplay();
}

function finalizeLetter() {
  if (currentLetter.length > 0) {
    letters.push(currentLetter);
    currentLetter = '';
    updateDisplay();
  }
}

function updateDisplay() {
  const all = [...letters, currentLetter].filter(Boolean).join(' ');
  MORSE_INPUT_EL.textContent = all.length > 0 ? all : '(press space bar)';
}

let pressStart = null;
// Audio context for tone
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let osc = null;
function startTone(){
  if(osc===null){
    osc = audioCtx.createOscillator();
    osc.type='sine';
    osc.frequency.setValueAtTime(600,audioCtx.currentTime);
    osc.connect(audioCtx.destination);
    osc.start();
  }
}
function stopTone(){
  if(osc!==null){
    osc.stop();
    osc.disconnect();
    osc = null;
  }
}

function handleKeyDown(e) {
  if (e.code !== 'Space') return;
  e.preventDefault();
  const now = Date.now();
  // If pause since last release > LETTER_PAUSE, finalize previous letter
  if (lastReleaseTime && now - lastReleaseTime > LETTER_PAUSE) {
    finalizeLetter();
  }
  pressStart = now;
  startTone();
}
function handleKeyUp(e) {
  if (e.code !== 'Space') return;
  e.preventDefault();
  const duration = Date.now() - pressStart;
  pressStart = null;
  lastReleaseTime = Date.now();
  const symbol = duration < DOT_THRESHOLD ? '.' : '-';
  currentLetter += symbol;
  updateDisplay();
  stopTone();
}

function submitAnswer() {
  finalizeLetter();
  const userMorse = MORSE_INPUT_EL.textContent.trim();
  const targetMorse = getMorseOf(currentMessage);
  if (userMorse === targetMorse) {
    score++;
    SCORE_EL.textContent = String(score);
    alert('Correct!');
  } else {
    alert(`Incorrect.\nExpected: ${targetMorse}\nYour input: ${userMorse}`);
  }
  generateMessage();
}

SUBMIT_BTN.addEventListener('click', submitAnswer);
const CLEAR_BTN = document.getElementById('clearBtn');
CLEAR_BTN.addEventListener('click', () => {
  resetInput();
});
window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
// Submit on Enter key
window.addEventListener('keydown', e => {
  if (e.code === 'Enter') {
    e.preventDefault();
    submitAnswer();
  }
});
window.addEventListener('keydown', e => {
  if (e.code === 'KeyC') {
    e.preventDefault();
    resetInput();
  }
});
// Initialize first message
generateMessage();