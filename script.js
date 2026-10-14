// ==========================================================
// BANCO DE PERGUNTAS DO 6º ANO (VARIADAS)
// ==========================================================
const questionsBank = [
  {
    category: "Matemática",
    question: "Qual é o resultado da expressão: 8 x 7 + 4?",
    options: ["56", "60", "64", "52"],
    correct: 1
  },
  {
    category: "Português",
    question: "Qual das palavras abaixo é um SUBSTANTIVO PRÓPRIO?",
    options: ["cachorro", "Brasil", "cidade", "menino"],
    correct: 1
  },
  {
    category: "Ciências",
    question: "Qual é a camada mais externa e sólida da Terra?",
    options: ["Núcleo", "Manto", "Litosfera (Crosta)", "Atmosfera"],
    correct: 2
  },
  {
    category: "História",
    question: "Qual civilização antiga construiu as Grandes Pirâmides de Gizé?",
    options: ["Gregos", "Romanos", "Egípcios", "Incas"],
    correct: 2
  },
  {
    category: "Geografia",
    question: "Qual é o maior oceano do planeta Terra?",
    options: ["Oceano Atlântico", "Oceano Índico", "Oceano Pacífico", "Oceano Ártico"],
    correct: 2
  },
  {
    category: "Matemática",
    question: "Qual é a fração equivalente a metade de algo?",
    options: ["1/4", "1/2", "3/4", "2/3"],
    correct: 1
  }
];

// ==========================================================
// ESTADO DO JOGO (VARIÁVEIS DE CONTROLE)
// ==========================================================
let currentQuestionIndex = 0;
let score = 0;
let lives = 3;
let playerPosition = 0; // % de avanço na pista (0 a 80%)
let rivalPosition = 0;
let selectedHorseEmoji = "🐴";

// ==========================================================
// ELEMENTOS DO DOM
// ==========================================================
const screenSelect = document.getElementById("screen-select");
const screenGame = document.getElementById("screen-game");
const screenEnd = document.getElementById("screen-end");

const horseButtons = document.querySelectorAll(".btn-horse");
const btnStartGame = document.getElementById("btn-start-game");
const btnRestart = document.getElementById("btn-restart");

const livesContainer = document.getElementById("lives-container");
const scoreDisplay = document.getElementById("score-display");
const questionTracker = document.getElementById("question-tracker");

const playerHorseEl = document.getElementById("player-horse");
const rivalHorseEl = document.getElementById("rival-horse");

const categoryBadge = document.getElementById("category-badge");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");

const resultEmoji = document.getElementById("result-emoji");
const resultTitle = document.getElementById("result-title");
const resultMessage = document.getElementById("result-message");
const finalScoreValue = document.getElementById("final-score-value");

// ==========================================================
// AUDIO SINTETIZADO (WEB AUDIO API - SEM ARQUIVOS EXTERNOS)
// ==========================================================
function playSound(type) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === "correct") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === "wrong") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
      osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.4); // A2
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } else if (type === "win") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.1);
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    }
  } catch (e) {
    console.log("Audio não suportado ou aguardando interação do usuário.");
  }
}

// ==========================================================
// INICIALIZAÇÃO E EVENTOS
// ==========================================================
// Seleção do cavalo
horseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    horseButtons.forEach((btn) => btn.classList.remove("selected"));
    button.classList.add("selected");
    selectedHorseEmoji = button.getAttribute("data-horse");
  });
});

// Iniciar Jogo
btnStartGame.addEventListener("click", () => {
  playerHorseEl.textContent = selectedHorseEmoji;
  showScreen(screenGame);
  resetGameState();
  loadQuestion();
});

// Reiniciar Jogo
btnRestart.addEventListener("click", () => {
  showScreen(screenSelect);
});

// Troca dinâmica de telas
function showScreen(targetScreen) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });
  targetScreen.classList.add("active");
}

// ==========================================================
// LÓGICA DO JOGO
// ==========================================================
function resetGameState() {
  currentQuestionIndex = 0;
  score = 0;
  lives = 3;
  playerPosition = 0;
  rivalPosition = 0;
  
  updateHUD();
  updateHorsesPosition();
}

function updateHUD() {
  scoreDisplay.textContent = score;
  questionTracker.textContent = `Pergunta ${currentQuestionIndex + 1}/${questionsBank.length}`;
  
  // Atualizar corações de vida
  livesContainer.innerHTML = "";
  for (let i = 0; i < lives; i++) {
    livesContainer.innerHTML += "❤️";
  }
  for (let i = lives; i < 3; i++) {
    livesContainer.innerHTML += "🖤";
  }
}

function updateHorsesPosition() {
  playerHorseEl.style.left = `${playerPosition}%`;
  rivalHorseEl.style.left = `${rivalPosition}%`;
}

function loadQuestion() {
  if (currentQuestionIndex >= questionsBank.length || lives <= 0) {
    finishGame();
    return;
  }

  const currentQ = questionsBank[currentQuestionIndex];
  categoryBadge.textContent = currentQ.category;
  questionText.textContent = currentQ.question;
  optionsContainer.innerHTML = "";

  currentQ.options.forEach((optionText, index) => {
    const btn = document.createElement("button");
    btn.classList.add("btn-option");
    btn.textContent = optionText;
    btn.addEventListener("click", () => handleAnswer(index, btn));
    optionsContainer.appendChild(btn);
  });

  updateHUD();
}

function handleAnswer(selectedIndex, selectedBtn) {
  // Desabilitar todos os botões temporariamente
  const allOptions = optionsContainer.querySelectorAll(".btn-option");
  allOptions.forEach((btn) => (btn.disabled = true));

  const currentQ = questionsBank[currentQuestionIndex];
  const stepSize = 80 / questionsBank.length; // Avanço proporcional na pista

  if (selectedIndex === currentQ.correct) {
    // Resposta Correta
    selectedBtn.classList.add("correct");
    playSound("correct");
    score += 100;
    playerPosition += stepSize;
    // Rival avança um pouco menos
    rivalPosition += stepSize * 0.4;
  } else {
    // Resposta Errada
    selectedBtn.classList.add("wrong");
    allOptions[currentQ.correct].classList.add("correct"); // Mostra a certa
    playSound("wrong");
    lives--;
    // Rival ganha vantagem
    rivalPosition += stepSize * 0.8;
  }

  updateHorsesPosition();

  // Aguarda 1.5s antes de passar para a próxima pergunta
  setTimeout(() => {
    currentQuestionIndex++;
    loadQuestion();
  }, 1500);
}

// ==========================================================
// TELA FINAL E RESULTADO
// ==========================================================
function finishGame() {
  showScreen(screenEnd);
  finalScoreValue.textContent = score;

  const playerWon = playerPosition >= rivalPosition && lives > 0;

  if (playerWon) {
    playSound("win");
    resultEmoji.textContent = "🏆";
    resultTitle.textContent = "VOCÊ VENCEU A CORRIDA!";
    resultMessage.textContent = "Incrível! Você mostrou que sabe muito e cruzou a linha de chegada em 1º Lugar!";
  } else {
    resultEmoji.textContent = "🐴";
    resultTitle.textContent = "QUASE LÁ!";
    resultMessage.textContent = "Seu cavalo se esforçou bastante, mas precisa treinar mais um pouquinho! Vamos tentar de novo?";
  }
}
