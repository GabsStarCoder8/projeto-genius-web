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
let numPlayers = 0;     // <-- Variaveis
let currentPlayer = 1;  // <--  Para 
let playerScores = [];  // <--  O modo
let isCpuGame = false;  // <-- multiplayer


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
    sequence = []; // Reseta a sequência no início de um novo jogo
    startNextRound();
}

//função para iniciar a vez da CPU
function startNextRound() {
    isGameActive = true;
    playerSequence = [];
    
    // É sempre a vez da CPU aumentar a sequência
    computerTurn();
}

// computerTurn agora só adiciona uma cor e chama a exibição
function computerTurn() {
    turn = 'computer';
    currentPlayerTitle.innerText = 'CPU'; // Mostra que a CPU está jogando
    
    const nextColor = Math.floor(Math.random() * 4);
    sequence.push(nextColor);
    round = sequence.length;
    scoreDisplay.innerText = round -1; // Pontos são o round anterior
    roundDisplay.innerText = round;
    
    playSequence();
}

// playSequence agora prepara a vez do jogador correto
const playSequence = async () => {
    disablePads();
    await new Promise(resolve => setTimeout(resolve, 800)); // Pequena pausa

    for (const colorIndex of sequence) {
        const pad = document.getElementById(colorIndex);
        await flash(pad);
    }

    // Após a CPU jogar, passa a vez para o jogador atual da fila
    currentPlayerTitle.innerText = `Jogador ${currentPlayer}`;
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

//lógica de progressão
function checkPlayerSequence() {
    const index = playerSequence.length - 1;

    // Se o jogador errou, o jogo acaba
    if (playerSequence[index] !== sequence[index]) {
        gameOver();
        return;
    }

    // Se o jogador acertou a sequência inteira
    if (playerSequence.length === sequence.length) {
        playerScores[currentPlayer - 1] = round; // Salva a pontuação do jogador
        
        // Passa para o próximo jogador da fila
        currentPlayer++;
        if (currentPlayer > numPlayers) {
            currentPlayer = 1; // Volta para o primeiro jogador
        }
        
        // Inicia a próxima rodada, que será mais difícil
        setTimeout(startNextRound, 1200);
    }
}

function gameOver() {
    if (errorSound) errorSound.play();
    isGameActive = false;
    
    const finalScore = round > 0 ? round - 1 : 0;
    let endMessage = `Jogador ${currentPlayer} errou! Fim de jogo. Pontuação final: ${finalScore}`;
    
    // Mostra a mensagem de forma visual, sem alert
    currentPlayerTitle.innerText = "FIM DE JOGO";
    
    // Aguarda um tempo para o jogador ver a mensagem e depois volta ao início
    setTimeout(() => {
        alert(endMessage); // alert que garante que o jogador veja a pontuação final
        gameScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    }, 1000);
}

const disablePads = () => pads.forEach(pad => pad.style.pointerEvents = 'none');
const enablePads = () => pads.forEach(pad => pad.style.pointerEvents = 'auto');

pads.forEach(pad => pad.addEventListener('click', playerClick));