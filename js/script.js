let playerName = localStorage.getItem('ticTacToeName');
let currentDifficulty = 'hard'; // Default difficulty

function getPlayerName() {
    if (!playerName) {
        let name = '';
        while (!name.trim()) {  // Keep asking until a valid name is entered
            name = prompt("Enter your first name:") || '';
            if (name.trim()) {
                playerName = name.trim();
                localStorage.setItem('ticTacToeName', playerName);
            }
        }
    }
    return playerName;
}

function startGame() {
    const nameInput = document.getElementById('playerNameInput');
    const name = nameInput.value.trim();
    
    if (name) {
        playerName = name;
        localStorage.setItem('ticTacToeName', name);
        localStorage.setItem('ticTacToeDifficulty', currentDifficulty);
        
        document.getElementById('nameScreen').style.display = 'none';
        document.querySelector('.container').style.display = 'flex';
        
        updateDifficultyIndicator();
        updateStatusMessage();
        updatePlayerNames();
        restartGame();
    } else {
        nameInput.style.borderColor = '#ff6b6b';
        setTimeout(() => {
            nameInput.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }, 1000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    playerName = localStorage.getItem('ticTacToeName') || 'Name?';
    
    // Set initial names
    document.getElementById('humanName').textContent = playerName;
    document.getElementById('computerName').textContent = getComputerName();
    
    if (playerName !== 'Name?') {
        // Only skip name screen if there's a real name stored
        document.getElementById('nameScreen').style.display = 'none';
        document.querySelector('.container').style.display = 'flex';
        updateStatusMessage();
    }
    initializeSettings();
    updatePlayerNames();
    initializeModeSelector();
});

function updateStatusMessage() {
    if (currentPlayer === 'X') {
        // Show AI personality message instead of player's turn
        statusDisplay.textContent = getAIPersonalityMessage();
    } else {
        // Show AI personality message, then "thinking..."
        statusDisplay.textContent = getAIPersonalityMessage();
        setTimeout(() => {
            if (currentPlayer === 'O') { // Check if it's still AI's turn
                statusDisplay.textContent = 'AI thinking...';
                // Make the AI move after showing "thinking" message
                setTimeout(() => {
                    if (currentPlayer === 'O') {
                        const aiMove = getBestMove();
                        if (aiMove !== -1 && gameActive) {
                            makeMove(aiMove, AI_PLAYER);
                        }
                    }
                }, 1000);
            }
        }, 2500);
    }
}

const particles = new ParticleSystem();
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

const statusDisplay = document.querySelector('.status');
const cells = document.querySelectorAll('[data-cell]');
const restartButton = document.querySelector('.restart-button');

statusDisplay.textContent = `Player ${currentPlayer}'s turn`;

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

let scores = {
    player: 0,
    ai: 0
};

const AI_PLAYER = 'O';

function handleCellClick(e) {
    if (!gameActive) return;
    
    const cell = e.target;
    const cellIndex = Array.from(cells).indexOf(cell);

    if (gameBoard[cellIndex] !== '') return;

    makeMove(cellIndex, 'X');
}

function getBestMove() {
    switch(currentDifficulty) {
        case 'easy':
            return getEasyMove();
        case 'hard':
            return getHardMove();
        case 'impossible':
            return getImpossibleMove();
        default:
            return getHardMove();
    }
}

function getEasyMove() {
    // Easy AI: Makes reasonable moves but with some randomness
    const availableMoves = gameBoard.map((cell, index) => cell === '' ? index : -1).filter(i => i !== -1);
    
    // 40% chance to block player's winning move
    if (Math.random() < 0.4) {
        const blockMove = findWinningMove('X');
        if (blockMove !== -1) return blockMove;
    }
    
    // 30% chance to take center if available
    if (Math.random() < 0.3 && gameBoard[4] === '') {
        return 4;
    }
    
    // Random move from available positions
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function getHardMove() {
    // Hard AI: Uses strategy with occasional perfect moves
    
    // Always block winning moves
    const blockMove = findWinningMove('X');
    if (blockMove !== -1) return blockMove;
    
    // Always take winning moves
    const winMove = findWinningMove(AI_PLAYER);
    if (winMove !== -1) return winMove;
    
    // 80% chance to make strategic moves
    if (Math.random() < 0.8) {
        // Take center if available
        if (gameBoard[4] === '') return 4;
        
        // Look for fork opportunities
        const forkMove = findForkMove(AI_PLAYER);
        if (forkMove !== -1) return forkMove;
        
        // Block opponent's fork
        const blockForkMove = findForkMove('X');
        if (blockForkMove !== -1) return blockForkMove;
        
        // Take corners strategically
        const cornerMove = getStrategicCornerMove();
        if (cornerMove !== -1) return cornerMove;
    }
    
    // Take any available corner
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => gameBoard[i] === '');
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Take any available side
    const sides = [1, 3, 5, 7];
    const availableSides = sides.filter(i => gameBoard[i] === '');
    if (availableSides.length > 0) {
        return availableSides[Math.floor(Math.random() * availableSides.length)];
    }
    
    // Take any available move
    const availableMoves = gameBoard.map((cell, index) => cell === '' ? index : -1).filter(i => i !== -1);
    return availableMoves[0];
}

function getImpossibleMove() {
    // Impossible AI: Uses minimax with alpha-beta pruning and learning patterns
    
    // Always take winning moves
    const winMove = findWinningMove(AI_PLAYER);
    if (winMove !== -1) return winMove;
    
    // Always block opponent's winning moves
    const blockMove = findWinningMove('X');
    if (blockMove !== -1) return blockMove;
    
    // Use minimax for perfect play
    return findBestMove();
}

function findBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;
    
    // Add randomness to first move for variety
    if (gameBoard.every(cell => cell === '')) {
        const firstMoves = [0, 2, 4, 6, 8];
        return firstMoves[Math.floor(Math.random() * firstMoves.length)];
    }
    
    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = AI_PLAYER;
            let score = minimax(gameBoard, 0, false, -Infinity, Infinity);
            gameBoard[i] = '';
            
            // Add slight randomness to equally good moves
            if (score > bestScore || (score === bestScore && Math.random() < 0.3)) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

function minimax(board, depth, isMaximizing, alpha, beta) {
    // Check for terminal states
    if (checkWin(AI_PLAYER)) return 10 - depth;
    if (checkWin('X')) return depth - 10;
    if (checkDraw()) return 0;
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = AI_PLAYER;
                let score = minimax(board, depth + 1, false, alpha, beta);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                let score = minimax(board, depth + 1, true, alpha, beta);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
        }
        return bestScore;
    }
}

function getStrategicCornerMove() {
    const corners = [0, 2, 6, 8];
    
    // If opponent has center, take opposite corner of our corner
    if (gameBoard[4] === 'X') {
        if (gameBoard[0] === AI_PLAYER && gameBoard[8] === '') return 8;
        if (gameBoard[2] === AI_PLAYER && gameBoard[6] === '') return 6;
        if (gameBoard[6] === AI_PLAYER && gameBoard[2] === '') return 2;
        if (gameBoard[8] === AI_PLAYER && gameBoard[0] === '') return 0;
    }
    
    // Take corner opposite to player's corner
    for (let corner of corners) {
        if (gameBoard[corner] === 'X') {
            const oppositeCorner = 8 - corner;
            if (gameBoard[oppositeCorner] === '') return oppositeCorner;
        }
    }
    
    return -1;
}

function findWinningMove(player) {
    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = player;
            if (checkWin(player)) {
                gameBoard[i] = '';
                return i;
            }
            gameBoard[i] = '';
        }
    }
    return -1;
}

function findForkMove(player) {
    // Check each empty cell for potential fork
    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = player;
            
            // Count potential winning ways after this move
            let winningWays = 0;
            for (let j = 0; j < gameBoard.length; j++) {
                if (gameBoard[j] === '') {
                    gameBoard[j] = player;
                    if (checkWin(player)) winningWays++;
                    gameBoard[j] = '';
                }
            }
            
            gameBoard[i] = '';
            if (winningWays > 1) return i;
        }
    }
    return -1;
}

function findOppositeCorner() {
    const corners = [[0, 8], [2, 6]];
    for (let [first, second] of corners) {
        if (gameBoard[first] === 'X' && gameBoard[second] === '') return second;
        if (gameBoard[second] === 'X' && gameBoard[first] === '') return first;
    }
    return -1;
}

function findEmptyCorner() {
    const corners = [0, 2, 6, 8];
    const emptyCorners = corners.filter(i => gameBoard[i] === '');
    if (emptyCorners.length > 0) {
        // Prioritize corners that create potential winning lines
        for (let corner of emptyCorners) {
            gameBoard[corner] = AI_PLAYER;
            let potentialWins = 0;
            for (let condition of winningConditions) {
                if (condition.includes(corner)) {
                    const otherCells = condition.filter(i => i !== corner);
                    if (otherCells.every(i => gameBoard[i] === '' || gameBoard[i] === AI_PLAYER)) {
                        potentialWins++;
                    }
                }
            }
            gameBoard[corner] = '';
            if (potentialWins > 1) return corner;
        }
        // If no strategic corner found, take random corner
        return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    }
    return -1;
}

function findEmptySide() {
    const sides = [1, 3, 5, 7];
    const emptySides = sides.filter(i => gameBoard[i] === '');
    if (emptySides.length > 0) {
        // Prioritize sides that create potential winning lines
        for (let side of emptySides) {
            gameBoard[side] = AI_PLAYER;
            let potentialWins = 0;
            for (let condition of winningConditions) {
                if (condition.includes(side)) {
                    const otherCells = condition.filter(i => i !== side);
                    if (otherCells.every(i => gameBoard[i] === '' || gameBoard[i] === AI_PLAYER)) {
                        potentialWins++;
                    }
                }
            }
            gameBoard[side] = '';
            if (potentialWins > 0) return side;
        }
        // If no strategic side found, take random side
        return emptySides[Math.floor(Math.random() * emptySides.length)];
    }
    return -1;
}

function makeMove(index, player) {
    if (!gameActive) return;

    const cell = cells[index];
    const rect = cell.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    cell.style.transform = 'scale(0)';
    setTimeout(() => {
        gameBoard[index] = player;
        cell.textContent = player;
        cell.setAttribute('data-player', player);
        cell.style.transform = 'scale(1)';
        
        particles.emit(centerX, centerY, player === 'X' ? '#ff6b6b' : '#4ecdc4');
        
        if (checkWin(player)) {
            gameActive = false;
            const winner = player === 'X' ? `${playerName} Wins!` : 'AI Wins!';
            statusDisplay.textContent = winner;
            
            const winningCells = findWinningCombination(player);
            if (winningCells) {
                createFlowingEffect(winningCells, player);
            }
            
            setTimeout(() => {
                showPopup(winner);
                updateScore(player);
            }, 1200);
            return;
        }

        if (checkDraw()) {
            statusDisplay.textContent = "Draw!";
            showPopup("Draw!");
            gameActive = false;
            return;
        }

        if (gameActive) {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            updateStatusMessage();
            
            if (currentPlayer === 'O' && gameActive) {
                setTimeout(() => {
                    const aiMove = getBestMove();
                    if (aiMove !== -1 && gameActive) {
                        makeMove(aiMove, AI_PLAYER);
                    }
                }, 500);
            }
        }
    }, 150);
}

function updateScore(winner) {
    if (winner === 'X') {
        scores.player++;
        document.getElementById('playerScore').textContent = scores.player;
    } else {
        scores.ai++;
        document.getElementById('aiScore').textContent = scores.ai;
    }
}

function checkWin(player) {
    for (let condition of winningConditions) {
        if (condition.every(index => gameBoard[index] === player)) {
            condition.forEach(index => {
                cells[index].classList.add('win');
            });
            return true;
        }
    }
    return false;
}

function createFlowingEffect(winningCells, player) {
    setTimeout(() => {
        const startCell = cells[winningCells[0]];
        const endCell = cells[winningCells[2]];
        const board = document.getElementById('gameBoard');
        
        const startRect = startCell.getBoundingClientRect();
        const endRect = endCell.getBoundingClientRect();
        const boardRect = board.getBoundingClientRect();
        
        const line = document.createElement('div');
        line.className = 'flowing-line';
        
        // Update colors with higher opacity
        const color = player === 'X' ? 
            'rgba(255, 217, 62, 0.95)' : 
            'rgba(255, 107, 107, 0.95)';
        
        line.style.background = `linear-gradient(90deg, 
            transparent, 
            ${color}, 
            ${color},
            transparent
        )`;
        
        // Calculate start and end points from borders instead of centers
        const isHorizontal = Math.abs(endRect.top - startRect.top) < 10;
        const isVertical = Math.abs(endRect.left - startRect.left) < 10;
        
        let startX, startY, endX, endY;
        
        if (isHorizontal) {
            startX = startRect.left;
            endX = endRect.right;
            startY = endY = startRect.top + startRect.height / 2;
        } else if (isVertical) {
            startX = endX = startRect.left + startRect.width / 2;
            startY = startRect.top;
            endY = endRect.bottom;
        } else {
            // Diagonal
            if (endRect.left > startRect.left) {
                // Top-left to bottom-right
                startX = startRect.left;
                startY = startRect.top;
                endX = endRect.right;
                endY = endRect.bottom;
            } else {
                // Top-right to bottom-left
                startX = startRect.right;
                startY = startRect.top;
                endX = endRect.left;
                endY = endRect.bottom;
            }
        }
        
        const length = Math.sqrt(
            Math.pow(endX - startX, 2) + 
            Math.pow(endY - startY, 2)
        );
        
        const angle = Math.atan2(
            endY - startY,
            endX - startX
        ) * 180 / Math.PI;
        
        line.style.width = `${length}px`;
        line.style.left = `${startX - boardRect.left}px`;
        line.style.top = `${startY - boardRect.top}px`;
        line.style.transform = `rotate(${angle}deg)`;
        
        board.appendChild(line);
        
        setTimeout(() => {
            line.remove();
        }, 800);
    }, 100);
}

function checkDraw() {
    return gameBoard.every(cell => cell !== '');
}

function restartGame() {
    const popup = document.getElementById('popupMessage');
    popup.style.display = 'none';
    currentPlayer = 'X';
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    updateStatusMessage();
    
    cells.forEach(cell => {
        cell.style.transform = 'scale(0)';
        setTimeout(() => {
            cell.textContent = '';
            cell.removeAttribute('data-player');
            cell.style.transform = 'scale(1)';
            cell.style.animation = 'none';
            cell.classList.remove('win');
        }, 150);
    });
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartButton.addEventListener('click', restartGame); 

// Update the showPopup function
function showPopup(message) {
    const popup = document.getElementById('popupMessage');
    const popupText = popup.querySelector('.popup-text');
    const computerName = document.getElementById('computerName').textContent;
    
    popupText.classList.remove('win', 'lose', 'draw');
    
    // Modify the message if AI wins
    if (message.includes('AI Wins')) {
        message = `${computerName} Wins!`;
    }
    
    if (message.includes('Wins')) {
        if (message.includes(computerName)) {
            popupText.classList.add('lose');
            if (currentDifficulty === 'impossible') {
                window.impossibleModeLosses = (window.impossibleModeLosses || 0) + 1;
            }
        } else {
            popupText.classList.add('win');
            if (currentDifficulty === 'impossible') {
                window.impossibleModeLosses = 0;
            }
        }
    } else {
        popupText.classList.add('draw');
    }
    
    popupText.textContent = message;
    popup.style.display = 'block';
    
    setTimeout(() => {
        popup.style.display = 'none';
        restartGame();
    }, 600);
}

// Add this helper function to find winning combination
function findWinningCombination(player) {
    for (let condition of winningConditions) {
        if (condition.every(index => gameBoard[index] === player)) {
            return condition;
        }
    }
    return null;
}

// Add this function
function showNameScreen() {
    document.getElementById('nameScreen').style.display = 'flex';
    document.querySelector('.container').style.display = 'none';
}

// Add difficulty selection handling
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        currentDifficulty = btn.dataset.level;
    });
}); 

// Remove the style element that was added for the gear icon
const existingStyle = document.querySelector('style');
if (existingStyle) {
    existingStyle.remove();
} 

// Add this function to show current difficulty level
function updateDifficultyIndicator() {
    const difficultyLabels = {
        'easy': '😊 Easy Mode',
        'hard': '😈 Hard Mode',
        'impossible': '👿 Impossible Mode'
    };
    
    const difficultyToggle = document.getElementById('difficultyToggle');
    difficultyToggle.className = `difficulty-indicator ${currentDifficulty}`;
    difficultyToggle.firstChild.textContent = difficultyLabels[currentDifficulty];
}

function initializeSettings() {
    const settingsBtn = document.querySelector('.settings-btn');
    const settingsPanel = document.getElementById('settingsPanel');
    const closeSettingsBtn = document.querySelector('.close-settings');
    const overlay = document.createElement('div');
    overlay.className = 'settings-overlay';
    document.body.appendChild(overlay);

    settingsBtn.addEventListener('click', () => {
        settingsPanel.classList.add('active');
        overlay.classList.add('active');
    });

    closeSettingsBtn.addEventListener('click', closeSettings);
    overlay.addEventListener('click', closeSettings);

    function closeSettings() {
        settingsPanel.classList.remove('active');
        overlay.classList.remove('active');
    }

    // Handle difficulty buttons in settings
    const difficultyBtns = settingsPanel.querySelectorAll('.difficulty-btn');
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            currentDifficulty = btn.dataset.level;
            localStorage.setItem('ticTacToeDifficulty', currentDifficulty);
            updateDifficultyIndicator();
            
            // Show new AI personality message if it's AI's turn
            if (currentPlayer === 'O') {
                updateStatusMessage();
            }
        });
    });

    // Set initial difficulty and update indicator
    const savedDifficulty = localStorage.getItem('ticTacToeDifficulty') || 'hard';
    currentDifficulty = savedDifficulty;
    const selectedDiffBtn = settingsPanel.querySelector(`[data-level="${savedDifficulty}"]`);
    if (selectedDiffBtn) {
        selectedDiffBtn.classList.add('selected');
    }
    updateDifficultyIndicator();

    // Add this: Set initial name in settings
    const settingsNameInput = document.getElementById('settingsNameInput');
    settingsNameInput.value = playerName || '';

    // Add input validation
    settingsNameInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
    });
}

function saveNameFromSettings() {
    const settingsNameInput = document.getElementById('settingsNameInput');
    const newName = settingsNameInput.value.trim();
    const saveBtn = document.querySelector('.save-name-btn');
    
    if (newName) {
        playerName = newName;
        localStorage.setItem('ticTacToeName', newName);
        updatePlayerNames();
        
        // Show success animation
        saveBtn.classList.add('save-success');
        saveBtn.textContent = 'Saved!';
        saveBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        
        // Update game status if it's player's turn
        if (currentPlayer === 'X') {
            updateStatusMessage();
        }
        
        // Reset button after animation
        setTimeout(() => {
            saveBtn.classList.remove('save-success');
            saveBtn.textContent = 'Save';
            saveBtn.style.background = 'linear-gradient(135deg, #ff6b6b, #4ecdc4)';
        }, 1500);
    } else {
        // Show error state
        settingsNameInput.style.borderColor = '#ff6b6b';
        saveBtn.style.background = '#ff6b6b';
        saveBtn.textContent = 'Enter name';
        
        setTimeout(() => {
            settingsNameInput.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            saveBtn.style.background = 'linear-gradient(135deg, #ff6b6b, #4ecdc4)';
            saveBtn.textContent = 'Save';
        }, 1500);
    }
} 

// Modify the getAIPersonalityMessage function
function getAIPersonalityMessage() {
    // Track consecutive losses in impossible mode
    if (!window.impossibleModeLosses) {
        window.impossibleModeLosses = 0;
    }

    const messages = {
        easy: [
            "Challenge: Just warming up! 🌱",
            "I'm still learning, go easy on me! 🤓",
            "Training mode activated 🎮"
        ],
        hard: [
            "Challenge: Bring your A-game! 🎯",
            "I calculate every move carefully 🧠",
            "Victory won't come easy! 💪"
        ],
        impossible: {
            regular: [
                "Challenge: I remain undefeated! 👑",
                "Warning: Maximum intelligence engaged ⚠️",
                "Prepare for the ultimate challenge! 🔥"
            ],
            hints: [
                "Hint: Try controlling the center first! 🎯",
                "Tip: Corners are more powerful than edges 💫",
                "Strategy: Think two moves ahead! 🧠",
                "Secret: Create two winning paths to win! ✨",
                "Advice: Block my diagonal strategy! 🛡️",
                "Key: First move matters most! 🔑",
                "Tip: Watch out for my fork moves! ⚔️"
            ],
            taunts: [
                "Getting frustrated? Maybe try Hard mode first! 😈",
                "I can predict your every move! 🔮",
                "No one has beaten me yet... Will you? 🤔",
                "You're persistent, I'll give you that! 💪"
            ]
        }
    };

    if (currentDifficulty === 'impossible') {
        // If player has lost multiple times in impossible mode
        if (window.impossibleModeLosses > 2) {
            // 50% chance to show a hint
            if (Math.random() < 0.5) {
                const hint = messages.impossible.hints[Math.floor(Math.random() * messages.impossible.hints.length)];
                window.impossibleModeLosses = 0; // Reset counter after giving hint
                return hint;
            }
            // 30% chance to show a taunt
            else if (Math.random() < 0.3) {
                return messages.impossible.taunts[Math.floor(Math.random() * messages.impossible.taunts.length)];
            }
        }
        return messages.impossible.regular[Math.floor(Math.random() * messages.impossible.regular.length)];
    }

    // For easy and hard modes
    return messages[currentDifficulty][Math.floor(Math.random() * messages[currentDifficulty].length)];
} 

function updatePlayerNames() {
    const humanNameElement = document.getElementById('humanName');
    if (humanNameElement) {
        humanNameElement.textContent = playerName;
    }
} 

function initializeModeSelector() {
    const difficultyToggle = document.getElementById('difficultyToggle');
    const modeDropdown = difficultyToggle.querySelector('.mode-dropdown');
    const modeOptions = document.querySelectorAll('.mode-option');
    
    // Toggle dropdown
    difficultyToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        difficultyToggle.classList.toggle('active');
        modeDropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
        difficultyToggle.classList.remove('active');
        modeDropdown.classList.remove('active');
    });
    
    // Handle mode selection
    modeOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const mode = option.dataset.mode;
            currentDifficulty = mode;
            localStorage.setItem('ticTacToeDifficulty', mode);
            
            // Update UI
            modeOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            updateDifficultyIndicator();
            updateComputerName();
            
            // Show new AI personality message
            updateStatusMessage();
        });
    });
    
    // Set initial selected mode
    const currentMode = document.querySelector(`.mode-option[data-mode="${currentDifficulty}"]`);
    if (currentMode) {
        currentMode.classList.add('selected');
    }
} 

// Add click handler for reset button
document.getElementById('resetButton').addEventListener('click', () => {
    restartGame();
}); 

// Add these functions for name editing
function editName(element) {
    const currentName = element.textContent;
    element.classList.add('editing');
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.className = 'name-input';
    input.maxLength = 15;
    
    element.textContent = '';
    element.appendChild(input);
    input.focus();
    
    input.addEventListener('blur', () => saveName(element, input));
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveName(element, input);
        }
    });
}

function saveName(element, input) {
    let newName = input.value.trim();
    element.classList.remove('editing');
    
    if (element.id === 'humanName') {
        newName = newName || 'Name?';
        playerName = newName;
        localStorage.setItem('ticTacToeName', newName);
    } else if (element.id === 'computerName') {
        if (!newName) {
            newName = getComputerName();
        } else {
            localStorage.setItem('computerName', newName);
        }
    }
    
    element.textContent = newName;
    updateStatusMessage();
}

// Add function to update computer name when difficulty changes
function updateComputerName() {
    const computerNameElement = document.getElementById('computerName');
    if (!localStorage.getItem('computerName')) {
        computerNameElement.textContent = getComputerName();
    }
}

// Update the getComputerName function
function getComputerName() {
    const defaultNames = {
        'easy': 'Chiti 1.0',
        'hard': 'Chiti 2.0',
        'impossible': 'Chiti ∞'
    };
    
    const savedName = localStorage.getItem('computerName');
    return savedName || defaultNames[currentDifficulty];
} 

// Add this to optimize particle animations
function optimizeParticles() {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        // Reduce particle count on mobile
        particles.maxParticles = 10;
        particles.particleLifetime = 500;
    }
}

// Call this on load
window.addEventListener('load', optimizeParticles); 