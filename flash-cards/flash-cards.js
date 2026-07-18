// Sample flashcards – replace with your own array or set window.flashcards
const defaultFlashcards = [
  {
    front: "Capital of France?",
    back: "Paris",
  },
  {
    front: "2 + 2",
    back: "4",
  },
  {
    front: "favorite color",
    back: "green",
    answers: ["ecru", "lime", "green"],
  },
];
let flashcards =
  typeof window !== "undefined" && window.flashcards
    ? window.flashcards
    : defaultFlashcards;

const cardEl = document.getElementById("flashcard");
const frontEl = cardEl.querySelector(".front");
const backEl = cardEl.querySelector(".back");
const correctBtn = document.getElementById("correctBtn");
const incorrectBtn = document.getElementById("incorrectBtn");
const buttonsContainer = document.getElementById("buttons");
const inputContainer = document.getElementById("inputContainer");
const answerIcon = document.getElementById("answerIcon");
const answerInput = document.getElementById("answerInput");
const answerSubmitBtn = document.getElementById("answerSubmitBtn");
const correctCountEl = document.getElementById("correctCount");
const incorrectCountEl = document.getElementById("incorrectCount");

let currentIndex = 0;
let bucketCount = 3;
let buckets = [];
let currentBucketIndex = 0;

let correctCount = 0;
let incorrectCount = 0;
let currentCard = null;

let orderMode = 'order'; // default ordering

// Spaced repetition helper functions
function initializeBuckets() {
  buckets = [];
  for (let i=0; i<bucketCount; i++) {
    buckets.push([]);
  }
  if (flashcards.length > 0) {
    buckets[0] = [...flashcards];
  }
}

function renderBucketButtons() {
  const selector = document.getElementById('bucketSelector');
  if (!selector) return;
  selector.innerHTML = '';
  for (let i=0; i<bucketCount; i++) {
    const btn = document.createElement('button');
    btn.textContent = i+1;
    btn.dataset.bucketIndex = i;
    if (i === currentBucketIndex) btn.classList.add('active');
    btn.addEventListener('click', () => {
      currentBucketIndex = i;
      currentIndex = 0;
      renderBucketButtons();
      if (buckets[i] && buckets[i].length > 0) {
        showCard(0);
      } else {
        showCard(0);
      }
    });
    selector.appendChild(btn);
  }
}


// Drawer elements and toggle logic
const drawer = document.getElementById("drawer");
const drawerToggle = document.getElementById("drawerToggle");
const jsonInput = document.getElementById("jsonInput");
const submitBtn = document.getElementById("submitBtn");

if (drawer && drawerToggle) {
  drawerToggle.addEventListener("click", () => {
    if (drawer.classList.contains("open")) {
      drawer.classList.remove("open");
      drawer.classList.add("closed");
    } else {
      drawer.classList.remove("closed");
      drawer.classList.add("open");
    }
  });
}

// Dark mode toggle
const darkModeToggle = document.getElementById('darkModeToggle');
if (darkModeToggle) {
  const savedDark = localStorage.getItem('darkMode') === 'true';
  darkModeToggle.checked = savedDark;
  if (savedDark) document.body.classList.add('light-mode');
  darkModeToggle.addEventListener('change', () => {
    const enabled = darkModeToggle.checked;
    if (enabled) document.body.classList.add('light-mode'); else document.body.classList.remove('light-mode');
    localStorage.setItem('darkMode', enabled);
  });
}

// Order mode selection
const orderSelect = document.getElementById('orderSelect');
const bucketCountInput = document.getElementById('bucketCount');
if (orderSelect) {
  const savedOrder = localStorage.getItem('orderMode') || 'order';
  orderSelect.value = savedOrder;
  orderMode = savedOrder;
  orderSelect.addEventListener('change', () => {
    orderMode = orderSelect.value;
    localStorage.setItem('orderMode', orderMode);
  });
}

// Bucket count handling
if (bucketCountInput) {
  const stored = parseInt(localStorage.getItem('bucketCount')) || 3;
  bucketCount = stored;
  bucketCountInput.value = bucketCount;
  bucketCountInput.addEventListener('change', () => {
    const val = parseInt(bucketCountInput.value);
    if (!isNaN(val) && val > 0 && val !== bucketCount) {
      bucketCount = val;
      localStorage.setItem('bucketCount', bucketCount);
      initializeBuckets();
      renderBucketButtons();
      currentBucketIndex = 0;
      currentIndex = 0;
      showCard(0);
    }
  });
}

function validateCardSetJSON(input) {
  if (!Array.isArray(input))
    throw new Error("JSON must be an array of flashcards.");
  for (const card of input) {
    if (typeof card.front !== "string" || typeof card.back !== "string") {
      throw new Error(
        'Each flashcard must have string "front" and "back" fields.',
      );
    }
  }
}

// Submit JSON and update flashcards
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    const text = jsonInput.value.trim();
    if (!text) {
      alert("Please enter JSON data.");
      return;
    }
    try {
      const parsed = JSON.parse(text);
      validateCardSetJSON(parsed);
      flashcards = parsed;
      currentIndex = 0;
      correctCount = 0;
      incorrectCount = 0;
      correctCountEl.textContent = "0";
      incorrectCountEl.textContent = "0";
      initializeBuckets();
      renderBucketButtons();
      currentBucketIndex = 0;
      currentIndex = 0;
      showCard(currentIndex);
    } catch (e) {
      alert("Invalid JSON: " + e.message);
    }
  });
}

// Answer submission logic
if (answerSubmitBtn) {
  answerSubmitBtn.addEventListener("click", () => {
    if (!currentCard || !Array.isArray(currentCard.answers)) return;
    const userAns = answerInput.value.trim();
    const isCorrect = currentCard.answers.some(
      (a) => a.toLowerCase() === userAns.toLowerCase(),
    );
    if (isCorrect) {
      handleCorrect();
    } else {
      handleIncorrect();
    }
    // Hide input and show icon
    hideAnswerInput();
    answerIcon.style.display = "block";
  });
}

// Enter key for answer input
if (answerInput) {
  answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (currentCardIsFlipped()) {
        nextCard();
      } else {
        // Submit answer if still on front
        answerSubmitBtn.click();
      }
    }
  });
}

// Enter key for card element
if (cardEl) {
  cardEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (currentCardIsFlipped()) {
        nextCard();
      } else {
        flipCard();
      }
    }
  });
}

function hideAnswerButtons() {
  buttonsContainer.style.display = "none";
}

function hideAnswerInput() {
  inputContainer.style.display = "none";
}

function showAnswerButtons() {
  buttonsContainer.style.display = "block";
}

function currentCardHasAnswers() {
  return currentCard && Array.isArray(currentCard.answers);
}

async function showCard(index) {
  const bucket = buckets[currentBucketIndex];
  if (!bucket || bucket.length === 0) {
    cardEl.classList.remove("flipped");
    frontEl.textContent = "No cards in this bucket";
    backEl.textContent = "";
    hideAnswerInput();
    hideAnswerButtons();
    answerIcon.style.display = "none";
    answerInput.value = "";
    return;
  }
  currentIndex = index;
  cardEl.classList.remove("flipped");
  await new Promise((r) => setTimeout(r, 250));
  const card = bucket[index];
  currentCard = card;
  frontEl.textContent = card.front;
  backEl.textContent = card.back;
  if (currentCardHasAnswers()) {
    showInput();
  } else {
    hideAnswerInput();
  }
  hideAnswerButtons();
  answerIcon.style.display = "none";
  answerInput.value = "";
}

function nextCard() {
  const bucket = buckets[currentBucketIndex];
  if (!bucket || bucket.length === 0) {
    // Find next non‑empty bucket
    for (let i=0; i<bucketCount; i++) {
      const idx = (currentBucketIndex + 1 + i) % bucketCount;
      if (buckets[idx] && buckets[idx].length > 0) {
        currentBucketIndex = idx;
        currentIndex = 0;
        showCard(0);
        return;
      }
    }
    // No cards in any bucket
    return;
  }
  currentIndex = (currentIndex + 1) % bucket.length;
  showCard(currentIndex);
}

function handleCorrect() {
  correctCount++;
  correctCountEl.textContent = correctCount;
  const card = currentCard;
  const bucket = buckets[currentBucketIndex];
  bucket.splice(currentIndex, 1);
  // move card to next bucket (or keep if last)
  if (currentBucketIndex < bucketCount - 1) {
    buckets[currentBucketIndex + 1].push(card);
  } else {
    bucket.push(card); // keep in last bucket
  }
  if (bucket.length === 0) {
    // bucket is now empty – show placeholder
    showCard(0);
  } else {
    if (currentIndex >= bucket.length) currentIndex = 0;
    nextCard();
  }
}

function handleIncorrect() {
  incorrectCount++;
  incorrectCountEl.textContent = incorrectCount;
  const card = currentCard;
  const bucket = buckets[currentBucketIndex];
  bucket.splice(currentIndex, 1);
  // move card to previous bucket (or keep if first)
  if (currentBucketIndex > 0) {
    buckets[currentBucketIndex - 1].push(card);
  } else {
    bucket.push(card); // keep in first bucket
  }
  if (bucket.length === 0) {
    // bucket is now empty – show placeholder
    showCard(0);
  } else {
    if (currentIndex >= bucket.length) currentIndex = 0;
    nextCard();
  }
}

function showInput() {
  inputContainer.style.display = "block";
  hideAnswerButtons();
  answerInput.focus();
}

function currentCardIsFlipped() {
  return cardEl.classList.contains("flipped");
}

function flipCard() {
  cardEl.classList.add("flipped");
  if (!currentCardHasAnswers()) {
    showAnswerButtons();
  }
  hideAnswerInput();
}

cardEl.addEventListener("click", (e) => {
  if (!currentCardIsFlipped()) {
    flipCard();
  } else {
    nextCard();
  }
});

// Space bar to flip

document.addEventListener("keydown", (e) => {
  const active = document.activeElement;
  if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA"))
    return;
  if (e.key === "c") {
    if (currentCard) handleCorrect();
  } else if (e.key === "i") {
    if (currentCard) handleIncorrect();
  }
});

// Space bar to flip
document.addEventListener("keydown", (e) => {
  const active = document.activeElement;
  if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA"))
    return;
  // Space bar to flip if not already flipped
  if (e.code === "Space" && currentCardIsFlipped()) {
    if (!currentCard || !Array.isArray(currentCard.answers)) {
      cardEl.click();
    }
  }
  // Enter key to advance if card is flipped
  if (e.key === "Enter") {
    if (currentCardIsFlipped()) {
      e.preventDefault();
      nextCard();
    } else {
      // Flip the card if not yet flipped
      cardEl.click();
    }
  }
});

correctBtn.addEventListener("click", handleCorrect);

incorrectBtn.addEventListener("click", handleIncorrect);

// Init

// Initialize JSON textarea with default cards
if (jsonInput) {
  jsonInput.value = JSON.stringify(defaultFlashcards, null, 2);
}

initializeBuckets();
renderBucketButtons();
showCard(currentIndex);
