const cards = document.querySelectorAll('.memory-card');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const gameResult = document.getElementById('gameResult');
const resultMessage = document.getElementById('resultMessage');
const claimPrizeButton = document.getElementById('claimPrize');
const chooseProductButton = document.getElementById('chooseProduct');
const playAgainButton = document.getElementById('playAgain');
const winnerForm = document.getElementById('winnerForm');
const winnerDataForm = document.getElementById('winnerDataForm');
const winnerPhoneInput = document.getElementById('winnerPhone');
const winnerNameInput = document.getElementById('winnerName');
const winnerEmailInput = document.getElementById('winnerEmail');
const nameError = document.getElementById('nameError');
const phoneError = document.getElementById('phoneError');
const emailError = document.getElementById('emailError');
const flipSound = document.getElementById('flipSound');
const matchSound = document.getElementById('matchSound');
const winSound = document.getElementById('winSound');
const loseSound = document.getElementById('loseSound');
const preGameMessage = document.getElementById('preGameMessage');

const startPopup = document.getElementById('startPopup');
const startGameBtn = document.getElementById('startGameBtn');

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let moves = 0;
let matches = 0;
const maxMoves = 125;
let timeLeft = 300;
let timerId;
let errosSeguidos = 0;

startGameBtn.addEventListener('click', () => {
  startPopup.style.display = 'none';
  shuffle();
  mostrarTodasCartas();
});

function formatPhoneNumber(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

function isValidBRPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  const mobileRegex = /^[1-9]{2}9[0-9]{8}$/;
  return digits.length === 11 && mobileRegex.test(digits);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

winnerPhoneInput.addEventListener('input', (e) => {
  e.target.value = formatPhoneNumber(e.target.value);
});

winnerPhoneInput.addEventListener('paste', (e) => {
  setTimeout(() => {
    e.target.value = formatPhoneNumber(e.target.value);
  }, 0);
});

function startTimer() {
  timerId = setInterval(() => {
    timeLeft--;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `Tempo: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    if (timeLeft <= 0) endGame('O tempo acabou! Você perdeu.');
  }, 1000);
}

function flipCard() {
  if (lockBoard || moves >= maxMoves || timeLeft <= 0) return;
  if (this === firstCard) return;

  this.classList.add('flip');
  flipSound.play();

  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    if (moves === 0) startTimer();
    return;
  }

  secondCard = this;
  moves++;
  movesDisplay.textContent = `Jogadas: ${moves}/${maxMoves}`;
  checkForMatch();

  if (moves >= maxMoves) endGame('Você atingiu o limite de 125 jogadas! Você perdeu.');
}

function checkForMatch() {
  let isMatch = firstCard.dataset.framework === secondCard.dataset.framework;
  if (isMatch) {
    disableCards();
    errosSeguidos = 0;
  } else {
    errosSeguidos++;
    unflipCards();

    if (errosSeguidos >= 3) {
      setTimeout(() => {
        const dica = [...cards].find(c => c.dataset.framework === firstCard.dataset.framework && c !== firstCard && !c.classList.contains('flip'));
        if (dica) {
          dica.classList.add('dica');
          setTimeout(() => dica.classList.remove('dica'), 1000);
        }
      }, 1600);
    }
  }
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  matchSound.play();
  firstCard.classList.add('acerto');
  secondCard.classList.add('acerto');
  matches++;
  if (matches === 10) {
    confetti({ particleCount: 200, spread: 90, origin: { y: 0.6 } });
    endGame('Parabéns! Você venceu!');
  }
  resetBoard();
}

function unflipCards() {
  lockBoard = true;
  firstCard.classList.add('erro');
  secondCard.classList.add('erro');
  setTimeout(() => {
    firstCard.classList.remove('flip', 'erro');
    secondCard.classList.remove('flip', 'erro');
    resetBoard();
  }, 1500);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

function generatePrizeCode() {
  return `CS${new Date().getFullYear()}WIN${Math.random().toString(36).slice(-4).toUpperCase()}`;
}

function endGame(message) {
  clearInterval(timerId);
  lockBoard = true;
  resultMessage.textContent = message;

  gameResult.style.display = 'flex';
  gameResult.classList.add('show');

  if (message.includes('venceu')) {
    winSound.play();
    playAgainButton.style.display = 'none';
    claimPrizeButton.style.display = 'none';
    chooseProductButton.style.display = 'inline-block';
    chooseProductButton.onclick = () => {
      const baseURL = '/vendascacau/index.html';
      const utmParameters = new URLSearchParams(window.location.search);
      const utmLink = `${baseURL}?${utmParameters.toString()}`;
      window.location.href = utmLink;
    };
  } else {
    loseSound.play();
    claimPrizeButton.style.display = 'none';
    chooseProductButton.style.display = 'none';
    playAgainButton.style.display = 'inline-block';
  }

  playAgainButton.onclick = () => resetGame();
}

function resetGame() {
  gameResult.classList.remove('show');
  setTimeout(() => {
    gameResult.style.display = 'none';
    moves = 0;
    matches = 0;
    timeLeft = 300;
    errosSeguidos = 0;
    hasFlippedCard = false;
    lockBoard = false;
    firstCard = null;
    secondCard = null;
    movesDisplay.textContent = `Jogadas: ${moves}/${maxMoves}`;
    timerDisplay.textContent = `Tempo: 05:00`;
    cards.forEach(card => {
      card.classList.remove('flip', 'acerto');
      card.addEventListener('click', flipCard);
      let randomPos = Math.floor(Math.random() * cards.length);
      card.style.order = randomPos;
    });
  }, 500);
}

function shuffle() {
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  shuffled.forEach((card, i) => card.style.order = i);
}

function mostrarTodasCartas() {
  let count = 10;
  preGameMessage.style.display = 'block';
  preGameMessage.style.color = '#ffcc00';
  const countdown = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(countdown);
      preGameMessage.style.color = '#00ffcc';
      setTimeout(() => {
        preGameMessage.style.display = 'none';
        cards.forEach(card => card.classList.remove('flip'));
      }, 1000);
    }
  }, 1000);
  cards.forEach(card => card.classList.add('flip'));
}

cards.forEach(card => card.addEventListener('click', flipCard));

winnerDataForm.onsubmit = async (e) => {
  e.preventDefault();
  const name = winnerNameInput.value.trim();
  const phone = winnerPhoneInput.value;
  const email = winnerEmailInput.value.trim();
  const prizeCode = generatePrizeCode();
  nameError.textContent = '';
  phoneError.textContent = '';
  emailError.textContent = '';
  let isValid = true;
  if (name.length < 2) {
    nameError.textContent = 'Nome deve ter pelo menos 2 caracteres.';
    isValid = false;
  }
  if (!isValidBRPhone(phone)) {
    phoneError.textContent = 'Número inválido. Use o formato (XX) 9XXXX-XXXX.';
    isValid = false;
  }
  if (!isValidEmail(email)) {
    emailError.textContent = 'E-mail inválido.';
    isValid = false;
  }
  if (!isValid) return;

  const timestamp = new Date().toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, timeZone: 'America/Sao_Paulo'
  });
  const winnerData = { name, phone, email, prizeCode, timestamp };

  try {
    await window.db.collection('pascoaparatodos').add(winnerData);
    winnerForm.classList.remove('show');
    setTimeout(() => {
      winnerForm.style.display = 'none';
      gameResult.style.display = 'flex';
      gameResult.classList.add('show');
      resultMessage.textContent = `Parabéns, ${name}! Você ganhou 80% de desconto! Seu código: ${prizeCode}`;
      claimPrizeButton.style.display = 'none';
      chooseProductButton.style.display = 'inline-block';
    }, 500);
  } catch (error) {
    console.error('Error:', error);
    emailError.textContent = 'Erro ao salvar dados. Tente novamente.';
  }
};