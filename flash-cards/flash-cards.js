// Sample flashcards – replace with your own array or set window.flashcards
const defaultFlashcards = [
    { front: "Capital of France?", back: "Paris" },
    { front: "2 + 2", back: "4" },
];
let flashcards = typeof window !== 'undefined' && window.flashcards ? window.flashcards : defaultFlashcards;

const cardEl = document.getElementById('flashcard');
const frontEl = cardEl.querySelector('.front');
const backEl = cardEl.querySelector('.back');
const correctBtn = document.getElementById('correctBtn');
const incorrectBtn = document.getElementById('incorrectBtn');
const buttonsContainer = document.getElementById('buttons');
const correctCountEl = document.getElementById('correctCount');
const incorrectCountEl = document.getElementById('incorrectCount');

let currentIndex = 0;
let correctCount = 0;
let incorrectCount = 0;

// Drawer elements and toggle logic
const drawer = document.getElementById('drawer');
const drawerToggle = document.getElementById('drawerToggle');
const jsonInput = document.getElementById('jsonInput');
const submitBtn = document.getElementById('submitBtn');

if (drawer && drawerToggle) {
    drawerToggle.addEventListener('click', () => {
        drawer.classList.toggle('open');
    });
}

function validateCardSetJSON(input) {
    if (!Array.isArray(input)) throw new Error('JSON must be an array of flashcards.')
    for (const card of input) {
        if (typeof card.front !== 'string' || typeof card.back !== 'string') {
            throw new Error('Each flashcard must have string "front" and "back" fields.');
        }
    }
}

// Submit JSON and update flashcards
if (submitBtn) {
    submitBtn.addEventListener('click', () => {
        const text = jsonInput.value.trim();
        if (!text) {
            alert('Please enter JSON data.');
            return;
        }
        try {
            const parsed = JSON.parse(text);
            validateCardSetJSON(parsed)
            flashcards = parsed;
            currentIndex = 0;
            correctCount = 0;
            incorrectCount = 0;
            correctCountEl.textContent = '0';
            incorrectCountEl.textContent = '0';
            showCard(currentIndex);
        } catch (e) {
            alert('Invalid JSON: ' + e.message);
        }
    });
}

function showCard(index) {
    const card = flashcards[index];
    frontEl.textContent = card.front;
    backEl.textContent = card.back;
    cardEl.classList.remove('flipped');
    buttonsContainer.style.display = 'none';
}

function nextCard() {
    currentIndex = (currentIndex + 1) % flashcards.length;
    showCard(currentIndex);
}

cardEl.addEventListener('click', () => {
    if (!cardEl.classList.contains('flipped')) {
        cardEl.classList.add('flipped');
        buttonsContainer.style.display = 'block';
    }
});

// Space bar to flip
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !cardEl.classList.contains('flipped')) {
        cardEl.click();
    }
});

correctBtn.addEventListener('click', () => {
    correctCount++;
    correctCountEl.textContent = correctCount;
    nextCard();
});

incorrectBtn.addEventListener('click', () => {
    incorrectCount++;
    incorrectCountEl.textContent = incorrectCount;
    nextCard();
});

// Init
showCard(currentIndex);
