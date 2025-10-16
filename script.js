// --- SELEÇÃO DE ELEMENTOS ---
// Telas
const startScreen = document.getElementById('start-screen');
const playerSelectScreen = document.getElementById('player-select-screen');
const gameScreen = document.getElementById('game-screen');

// Botões
const startGameBtn = document.getElementById('start-game-btn');
const playerOptionBtns = document.querySelectorAll('.player-option-btn');

// Elementos do Jogo
const pads = document.querySelectorAll('.color-pad');
const scoreDisplay = document.getElementById('score');
const roundDisplay = document.getElementById('round-display');
const currentPlayerTitle = document.getElementById('current-player-title');
const sounds = [
    document.getElementById('sound0'),
    document.getElementById('sound1'),
    document.getElementById('sound2'),
    document.getElementById('sound3')
];
const errorSound = document.getElementById('soundError');


// --- VARIÁVEIS DE ESTADO DO JOGO ---
let sequence = [];
let playerSequence = [];
let round = 0;
let isGameActive = false;
let turn = 'computer';

// Variáveis para multiplayer
let numPlayers = 0;
let currentPlayer = 1;
let playerScores = [];
let isCpuGame = false;


// --- NAVEGAÇÃO ENTRE TELAS ---
startGameBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    playerSelectScreen.classList.remove('hidden');
});

playerOptionBtns.forEach(button => {
    button.addEventListener('click', (event) => {
        numPlayers = parseInt(event.target.dataset.players);
        isCpuGame = (numPlayers === 1);
        playerSelectScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        initializeGame();
    });
});


// --- LÓGICA PRINCIPAL DO JOGO ---
function initializeGame() {
    playerScores = new Array(numPlayers).fill(0);
    currentPlayer = 1;
    startNewTurn(true); // para indicar que é o início de um jogo completo
}


function startNewTurn(isFirstTurn = false) {
    sequence = [];
    playerSequence = [];
    round = 0;
    
    // Se for um novo jogo multiplayer, reseta o jogador para 1
    if (!isCpuGame && isFirstTurn) {
        currentPlayer = 1;
    }
    
    // Define o título inicial
    if (isCpuGame) {
        currentPlayerTitle.innerText = 'Vez da CPU';
    } else {
        currentPlayerTitle.innerText = `Vez do Jogador ${currentPlayer}`;
    }
    
    scoreDisplay.innerText = 0;
    roundDisplay.innerText = 0;
    isGameActive = true;
    
    computerTurn();
}

// computerTurn agora só adiciona uma cor e chama a exibição
function computerTurn() {
    if (isCpuGame) {
        currentPlayerTitle.innerText = 'Vez da CPU';
    }
    turn = 'computer';
    playerSequence = [];
    const nextColor = Math.floor(Math.random() * 4);
    sequence.push(nextColor);
    round = sequence.length;
    roundDisplay.innerText = round;
    playSequence();
}

const playSequence = async () => {
    disablePads();
    await new Promise(resolve => setTimeout(resolve, 500)); 

    for (const colorIndex of sequence) {
        const pad = document.getElementById(colorIndex);
        await flash(pad);
    }

    // Após mostrar a sequência, é SEMPRE a vez do jogador 
    currentPlayerTitle.innerText = isCpuGame ? 'Sua Vez!' : `Vez do Jogador ${currentPlayer}`;
    turn = 'player';
    enablePads();
};

const flash = (pad) => {
    return new Promise((resolve) => {
        const soundId = pad.id;
        if (sounds[soundId]) {
            sounds[soundId].currentTime = 0;
            sounds[soundId].play();
        }
        pad.classList.add('lit');
        setTimeout(() => {
            pad.classList.remove('lit');
            setTimeout(resolve, 200);
        }, 400);
    });
};

function playerClick(event) {
    if (turn !== 'player' || !isGameActive) return;

    const clickedPadId = event.target.id;
    playerSequence.push(Number(clickedPadId));
    flash(document.getElementById(clickedPadId));
    checkPlayerSequence();
}

function checkPlayerSequence() {
    const index = playerSequence.length - 1;

    if (playerSequence[index] !== sequence[index]) {
        gameOver();
        return;
    }

    // Se o jogador acertou a sequência inteira
    if (playerSequence.length === sequence.length) {
        scoreDisplay.innerText = round;
        playerScores[currentPlayer - 1] = round;
        
        if (isCpuGame) {
            // No modo CPU, a dificuldade apenas aumenta
            setTimeout(computerTurn, 1000);
        } else {
            // No modo multiplayer, passa a vez para o próximo jogador
            passTurnToNextPlayer();
        }
    }
}

function passTurnToNextPlayer() {
    currentPlayer++;
    
    // Se passou do último jogador, a rodada acabou. Aumenta a dificuldade.
    if (currentPlayer > numPlayers) {
        currentPlayer = 1; // Volta para o primeiro jogador
        alert(`Fim da rodada ${round}! Próxima rodada...`);
        setTimeout(computerTurn, 1000); // Aumenta a sequência
    } else {
        // Se não, é a vez do próximo jogador com a mesma sequência
        alert(`Ótimo! Agora é a vez do Jogador ${currentPlayer}.`);
        playerSequence = [];
        setTimeout(playSequence, 1000); // Mostra a mesma sequência
    }
}

function gameOver() {
    if (errorSound) errorSound.play();
    isGameActive = false;
    
    let endMessage;
    if (isCpuGame) {
        endMessage = `Fim de jogo! Sua pontuação final foi: ${round - 1}`;
    } else {
        endMessage = `Jogador ${currentPlayer} errou! Fim de jogo para todos. A maior pontuação foi ${Math.max(...playerScores)}.`;
    }
    
    alert(endMessage);

    setTimeout(() => {
        gameScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    }, 2000);
}

const disablePads = () => pads.forEach(pad => pad.style.pointerEvents = 'none');
const enablePads = () => pads.forEach(pad => pad.style.pointerEvents = 'auto');

pads.forEach(pad => pad.addEventListener('click', playerClick));