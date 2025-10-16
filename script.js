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

// Novas variáveis para multiplayer
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
    startNewTurn();
}

function startNewTurn() {
    sequence = [];
    playerSequence = [];
    round = 0;
    
    // Atualiza a UI para o jogador atual
    if (isCpuGame) {
        currentPlayerTitle.innerText = `Jogador ${currentPlayer}`;
    } else {
        currentPlayerTitle.innerText = `Vez do Jogador ${currentPlayer}`;
    }
    
    scoreDisplay.innerText = 0;
    roundDisplay.innerText = 0;

    isGameActive = true;
    computerTurn();
}

function computerTurn() {
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
    // Pequena pausa antes de começar a sequência
    await new Promise(resolve => setTimeout(resolve, 500)); 

    for (const colorIndex of sequence) {
        const pad = document.getElementById(colorIndex);
        await flash(pad);
    }

    if (isCpuGame && currentPlayer === 2) { // Vez da CPU
        currentPlayerTitle.innerText = 'CPU';
        await cpuPlay();
    } else { // Vez do Humano
        turn = 'player';
        enablePads();
    }
};

const cpuPlay = async () => {
    // Simula a CPU "pensando" e jogando
    for (const colorIndex of sequence) {
        await new Promise(resolve => setTimeout(resolve, 600)); // Pausa
        const pad = document.getElementById(colorIndex);
        await flash(pad);
    }
    // CPU nunca erra neste modo, então passa a vez e aumenta a dificuldade
    currentPlayer = 1;
    currentPlayerTitle.innerText = 'Jogador 1';
    computerTurn();
}

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

    if (playerSequence.length === sequence.length) {
        // Jogador acertou
        scoreDisplay.innerText = round;
        playerScores[currentPlayer - 1] = round;
        
        if (isCpuGame) {
            // No modo CPU, a vez é trocada
            currentPlayer = 2; // Passa para a CPU
            setTimeout(playSequence, 1000);
        } else {
            // Em outros modos, a sequência só aumenta
            setTimeout(computerTurn, 1000);
        }
    }
}

function gameOver() {
    if (errorSound) errorSound.play();
    isGameActive = false;

    // Lógica de Fim de Jogo para Múltiplos Jogadores
    if (!isCpuGame && currentPlayer < numPlayers) {
        alert(`Fim de jogo para o Jogador ${currentPlayer}! Pontuação: ${round - 1}. Próximo jogador!`);
        currentPlayer++;
        startNewTurn();
    } else {
        // Fim de jogo para o último jogador ou no modo single player
        alert(`Fim de jogo! Sua pontuação final foi: ${round - 1}`);
        // Volta para a tela de seleção de jogadores
        setTimeout(() => {
            gameScreen.classList.add('hidden');
            startScreen.classList.remove('hidden');
        }, 2000);
    }
}

const disablePads = () => pads.forEach(pad => pad.style.pointerEvents = 'none');
const enablePads = () => pads.forEach(pad => pad.style.pointerEvents = 'auto');

// Adiciona o evento de clique aos pads
pads.forEach(pad => pad.addEventListener('click', playerClick));