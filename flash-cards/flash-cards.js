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
let correctCount = 0;
let incorrectCount = 0;
let currentCard = null;

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
      correctCount++;
      correctCountEl.textContent = correctCount;
      answerIcon.textContent = "✓";
    } else {
      incorrectCount++;
      incorrectCountEl.textContent = incorrectCount;
      answerIcon.textContent = "✗";
    }
    // Hide input and show icon
    hideAnswerInput();
    answerIcon.style.display = "block";
    flipCard()
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
  cardEl.classList.remove("flipped");
  await new Promise((r) => setTimeout(r, 250)); // 250 is half the duration of the linear 'flip' transition
  const card = flashcards[index];
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
  currentIndex = (currentIndex + 1) % flashcards.length;
  showCard(currentIndex);
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

correctBtn.addEventListener("click", () => {
  correctCount++;
  correctCountEl.textContent = correctCount;
  nextCard();
});

incorrectBtn.addEventListener("click", () => {
  incorrectCount++;
  incorrectCountEl.textContent = incorrectCount;
  nextCard();
});

// Init
showCard(currentIndex);

// Initialize JSON textarea with default cards
if (jsonInput) {
  jsonInput.value = JSON.stringify(defaultFlashcards, null, 2);
}
